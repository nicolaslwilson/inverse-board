import { BN, PublicKey } from '@drift-labs/sdk';

export interface DriftLiquidationRecord {
  liquidationType: Record<string, object>;
  marginRequirement: BN;
  totalCollateral: BN;
  bankrupt: boolean;
  liquidationId: number;
  marginFreed: BN;
  liquidatePerp: {
    marketIndex: number;
    oraclePrice: BN;
    baseAssetAmount: BN;
    quoteAssetAmount: BN;
    liquidatorFee: BN;
    ifFee: BN;
  };
  liquidateSpot: {
    assetMarketIndex: number;
    assetPrice: BN;
    assetTransfer: BN;
    liabilityMarketIndex: number;
    liabilityPrice: BN;
    liabilityTransfer: BN;
    ifFee: BN;
  };
  liquidatePerpPnlForDeposit: {
    perpMarketIndex: number;
    marketOraclePrice: BN;
    pnlTransfer: BN;
    assetMarketIndex: number;
    assetPrice: BN;
    assetTransfer: BN;
  };
  perpBankruptcy: {
    marketIndex: number;
    pnl: BN;
    ifPayment: BN;
    clawbackUser: PublicKey;
    clawbackUserPayment: null;
    cumulativeFundingRateDelta: BN;
  };
  spotBankruptcy: {
    marketIndex: number;
    borrowAmount: BN;
    ifPayment: BN;
    cumulativeDepositInterestDelta: BN;
  };
}
