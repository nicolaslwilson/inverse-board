import {
  PerpMarketConfig,
  PerpMarkets,
  SpotMarketConfig,
  SpotMarkets,
} from '@drift-labs/sdk';

export const driftSpotMarketsByIndex = new Map<number, SpotMarketConfig>();
SpotMarkets['mainnet-beta'].forEach((market) =>
  driftSpotMarketsByIndex.set(market.marketIndex, market),
);

export const driftPerpMarketsByIndex = new Map<number, PerpMarketConfig>();
PerpMarkets['mainnet-beta'].forEach((market) =>
  driftPerpMarketsByIndex.set(market.marketIndex, market),
);
