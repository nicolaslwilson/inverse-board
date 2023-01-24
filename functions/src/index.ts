import * as functions from 'firebase-functions';
import {
  AnchorProvider,
  BorshCoder,
  Instruction,
  Program,
} from '@project-serum/anchor';
import idl from '@drift-labs/sdk/lib/idl/drift.json';
import { getTwitterClient, twitterSecrets } from './tweet';
import {
  BASE_PRECISION,
  configs,
  convertToNumber,
  QUOTE_PRECISION,
} from '@drift-labs/sdk';
import { Drift } from './drift/drift-idl';
import {
  driftPerpMarketsByIndex,
  driftSpotMarketsByIndex,
} from './drift/utils';
import { TwitterClient } from 'twitter-api-client';
import { DriftLiquidationRecord } from './drift/drift-liquidation-record';
import { defineSecret } from 'firebase-functions/v2/params';

interface HeliusIx {
  accounts: number[];
  data: string;
  programIdIndex: number;
}

interface HeliusTx {
  message: {
    accountKeys: string[];
    addressTableLookups: any;
    instructions: HeliusIx[];
  };
  signatures: string[];
}

interface HeliusWebhookTx {
  blockTime: number;
  indexWithinBlock: number;
  slot: number;
  meta: {
    err: any;
    fee: number;
    innerInstructions: any[];
    logMessages: string[];
  };
  transaction: HeliusTx;
}

const driftCoder = new BorshCoder(idl as Drift);
const driftProgram = new Program(
  idl as Drift,
  configs['mainnet-beta'].DRIFT_PROGRAM_ID,
  {} as AnchorProvider,
  driftCoder,
);

const heliusAuthHeader = defineSecret('HELIUS_AUTH_HEADER');

export const heliusWebhook = functions
  .runWith({
    secrets: [
      ...twitterSecrets.map((secret) => secret.name),
      heliusAuthHeader.name,
    ],
  })
  .https.onRequest(async (request, response): Promise<any> => {
    if (request.headers.authorization !== heliusAuthHeader.value()) {
      console.log(request.headers.authorization);
      return response.sendStatus(400);
    }
    let handler: LiquidationEventHandler;
    await Promise.all(
      request.body.map(async (hook: HeliusWebhookTx) => {
        const { data } = checkTxForMatchingIx(hook.transaction);
        if (data && isLiquidationIx(data) && !hook.meta.err) {
          const txSignature = hook.transaction.signatures[0];
          console.log(getTxUrl(txSignature));
          console.log(data);
          const events = parseEventsFromLogMessage(hook.meta.logMessages);
          await Promise.all(
            events.map(async (event) => {
              console.log(event);
              if (isDriftLiquidationRecord(event)) {
                if (!handler) {
                  handler = new LiquidationEventHandler(getTwitterClient());
                }
                await handler.tweetLiquidationEventWithLink(
                  txSignature,
                  event.data as unknown as DriftLiquidationRecord,
                );
              }
            }),
          );
        }
      }),
    );
    return response.sendStatus(200);
  });

function getProgramIdForIx(ix: HeliusIx, tx: HeliusTx) {
  return tx.message.accountKeys[ix.programIdIndex];
}

function checkTxForMatchingIx(tx: HeliusTx) {
  const programId = 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH';
  for (let index = 0; index < tx.message.instructions.length; index++) {
    const ix = tx.message.instructions[index];
    const ixProgramId = getProgramIdForIx(ix, tx);
    if (programId === ixProgramId) {
      return { index, data: decodeIxData(ix.data), programId };
    }
  }
  return { index: null };
}

function decodeIxData(data: string) {
  const decodedIx = driftCoder.instruction.decode(data, 'base58');
  return decodedIx;
}

function isLiquidationIx(ix: Instruction) {
  return ix.name.toLowerCase().includes('liquidate');
}

function getTxUrl(signature: string) {
  return `https://explorer.solana.com/tx/${signature}`;
}

function parseEventsFromLogMessage(logMessages: string[]) {
  const events = [];
  for (const message of logMessages) {
    const dataPrefix = 'Program data: ';
    if (message.startsWith(dataPrefix)) {
      try {
        const event = driftProgram.coder.events.decode(
          message.substring(dataPrefix.length),
        );
        if (event) {
          console.log(event);
          events.push(event);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  return events;
}

function isDriftLiquidationRecord(result: any) {
  return result?.name === 'LiquidationRecord';
}

function getSpotLiquidationStats(data: DriftLiquidationRecord) {
  const assetMarket = driftSpotMarketsByIndex.get(
    data.liquidateSpot.assetMarketIndex,
  );
  const liabilityMarket = driftSpotMarketsByIndex.get(
    data.liquidateSpot.liabilityMarketIndex,
  );

  return {
    totalCollateral: convertToNumber(data.totalCollateral, QUOTE_PRECISION),
    marginFreed: convertToNumber(data.marginFreed, QUOTE_PRECISION),
    assetMarketIndex: data.liquidateSpot.assetMarketIndex,
    assetPrice: convertToNumber(data.liquidateSpot.assetPrice, QUOTE_PRECISION),
    assetTransfer: convertToNumber(
      data.liquidateSpot.assetTransfer,
      assetMarket!.precision,
    ),
    liabilityMarketIndex: data.liquidateSpot.liabilityMarketIndex,
    liabilityPrice: convertToNumber(
      data.liquidateSpot.liabilityPrice,
      QUOTE_PRECISION,
    ),
    liabilityTransfer: convertToNumber(
      data.liquidateSpot.liabilityTransfer,
      liabilityMarket!.precision,
    ),
    insuranceFundFee: convertToNumber(
      data.liquidateSpot.ifFee,
      QUOTE_PRECISION,
    ),
    assetMarket,
    liabilityMarket,
  };
}

function getPerpLiquidationStats(data: DriftLiquidationRecord) {
  return {
    marketIndex: data.liquidatePerp.marketIndex,
    perpMark: driftPerpMarketsByIndex.get(data.liquidatePerp.marketIndex),
    totalCollateral: convertToNumber(data.totalCollateral, QUOTE_PRECISION),
    oraclePrice: convertToNumber(
      data.liquidatePerp.oraclePrice,
      QUOTE_PRECISION,
    ),
    marginFreed: convertToNumber(data.marginFreed, QUOTE_PRECISION),
    baseAssetAmount: convertToNumber(
      data.liquidatePerp.baseAssetAmount,
      BASE_PRECISION,
    ),
    quoteAssetAmount: convertToNumber(
      data.liquidatePerp.quoteAssetAmount,
      QUOTE_PRECISION,
    ),
    liquidatorFee: convertToNumber(
      data.liquidatePerp.liquidatorFee,
      QUOTE_PRECISION,
    ),
    insuranceFundFee: convertToNumber(
      data.liquidatePerp.ifFee,
      QUOTE_PRECISION,
    ),
  };
}

function getTextForPerpLiquidation(data: DriftLiquidationRecord) {
  const stats = getPerpLiquidationStats(data);
  const symbol = stats.perpMark!.baseAssetSymbol;
  const side = stats.baseAssetAmount > 0 ? 'long' : 'short';
  return `${Math.abs(stats.baseAssetAmount).toFixed(
    3,
  )} ${symbol} ${side} liquidated for $${Math.abs(
    stats.quoteAssetAmount,
  ).toFixed(3)} on Drift`;
}

function getTextForSpotLiquidation(data: DriftLiquidationRecord) {
  const stats = getSpotLiquidationStats(data);
  return `${stats.liabilityTransfer.toFixed(3)} ${
    stats.liabilityMarket!.symbol
  } liquidated with ${stats.assetTransfer.toFixed(3)} ${
    stats.assetMarket!.symbol
  } on Drift`;
}

function getLiquidationType(data: DriftLiquidationRecord) {
  return Object.keys(data.liquidationType)[0];
}

class LiquidationEventHandler {
  constructor(private twitter: TwitterClient) {}

  private getTextForLiquidationEvent(data: DriftLiquidationRecord) {
    const liqType = getLiquidationType(data);
    switch (liqType) {
      case 'liquidateSpot':
        return getTextForSpotLiquidation(data);
      case 'liquidatePerp':
        return getTextForPerpLiquidation(data);
      default:
        return `Liquidation event on Drift `;
        break;
    }
  }

  public async tweetLiquidationEventWithLink(
    txId: string,
    data: DriftLiquidationRecord,
  ) {
    const url = getTxUrl(txId);
    const text = this.getTextForLiquidationEvent(data);

    return await this.twitter.tweetsV2.createTweet({
      text: text.concat(randomEmoji()).concat('\n\n').concat(url),
    });
  }
}

function randomEmoji() {
  const options = [...'🤬🤯😤😳😱🫡🫣🫠😬😲🥴🤢🤮😖🙈'];
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}
