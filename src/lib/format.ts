import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { USDC_DECIMALS, MAX_SOL_AMOUNT, LAMPORTS_PER_USDC_UNIT } from './constants';

export const formatSOL = (lamports: number): string => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
};

export const formatUSDC = (amount: number): string => {
  return (amount / Math.pow(10, USDC_DECIMALS)).toFixed(2);
};

export const parseSOL = (sol: string): number => {
  return Math.floor(parseFloat(sol) * LAMPORTS_PER_SOL);
};

export const parseUSDC = (usdc: string): number => {
  return Math.floor(parseFloat(usdc) * Math.pow(10, USDC_DECIMALS));
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Re-export constants for convenience
export { MAX_SOL_AMOUNT, LAMPORTS_PER_USDC_UNIT };

