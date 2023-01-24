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

export const heliusWebhook = functions
  .runWith({ secrets: twitterSecrets.map((secret) => secret.name) })
  .https.onRequest(async (request, response) => {
    const handler = new LiquidationEventHandler(getTwitterClient());
    request.body.forEach(async (hook: HeliusWebhookTx) => {
      const { programId, data } = checkTxForMatchingIx(hook.transaction);
      if (data && isLiquidationIx(data)) {
        const txSignature = hook.transaction.signatures[0];
        console.log(getTxUrl(txSignature), programId);
        console.log(data);
        console.log(hook.meta.err);
        const events = parseEventsFromLogMessage(hook.meta.logMessages);
        await Promise.all(
          events.map(async (event) => {
            if (isDriftLiquidationRecord(event)) {
              await handler.handleLiquidationEvent(
                txSignature,
                event.data as unknown as DriftLiquidationRecord,
              );
            }
          }),
        );
      }
    });
    response.sendStatus(200);
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
  return `${Math.abs(
    stats.baseAssetAmount,
  )} ${symbol} ${side} liquidated for $${Math.abs(stats.quoteAssetAmount)}`;
}

function getTextForSpotLiquidation(data: DriftLiquidationRecord) {
  const stats = getSpotLiquidationStats(data);
  return `${stats.liabilityTransfer} ${
    stats.liabilityMarket!.symbol
  } liquidated with ${stats.assetTransfer} ${stats.assetMarket!.symbol}`;
}

function getLiquidationType(data: DriftLiquidationRecord) {
  return Object.keys(data.liquidationType)[0];
}

class LiquidationEventHandler {
  constructor(private twitter: TwitterClient) {}

  public async handleLiquidationEvent(
    txId: string,
    data: DriftLiquidationRecord,
  ) {
    const liqType = getLiquidationType(data);
    switch (liqType) {
      case 'liquidateSpot':
        return this.tweetLiquidationEventWithLink(
          txId,
          getTextForSpotLiquidation(data),
        );
      case 'liquidatePerp':
        return this.tweetLiquidationEventWithLink(
          txId,
          getTextForPerpLiquidation(data),
        );
      default:
        console.error('Unhandled liquidation type: ', liqType);
        break;
    }
  }

  private async tweetLiquidationEventWithLink(txId: string, text: string) {
    const url = getTxUrl(txId);

    return await this.twitter.tweetsV2.createTweet({
      text: text.concat('\n').concat(url),
    });
  }
}
