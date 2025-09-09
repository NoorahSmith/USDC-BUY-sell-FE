import { PublicKey } from '@solana/web3.js';

export interface MarketState {
  usdcMint: PublicKey;
  vaultAuthorityBump: number;
  totalBought: number;
  totalSold: number;
  maxSupply: number;
}

export interface BuyEvent {
  buyer: PublicKey;
  amount: number;
  lamportsSpent: number;
}

export interface SellEvent {
  seller: PublicKey;
  amount: number;
  lamportsReceived: number;
}

export interface MarketStats {
  totalUSDCLeft: number;
  totalSOLInProgram: number;
  totalBought: number;
  totalSold: number;
  maxSupply: number;
}

export type TransactionType = 'buy' | 'sell';

