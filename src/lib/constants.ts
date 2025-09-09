import { PublicKey } from '@solana/web3.js';

// Program ID from the deployed program
export const PROGRAM_ID = new PublicKey("9HzagBuheBCfbbXWVhqkYVArBzepy8Mif5rbe7gM257n");

// USDC Mint address (devnet)
export const USDC_MINT = new PublicKey("4f3XEdxWDzxAadHfXyqofXUg1Qsz5kwLCrABp64JqS7h");

// Market State PDA (actual deployed address)
export const MARKET_STATE_ADDRESS = new PublicKey("2W1sWniYNwLg7LoWfZtKgeBTmXsy3GyDuCcd4ewLAHYA");

// Market State PDA seed (for reference)
export const MARKET_STATE_SEED = "market_state";

// Vault PDA (actual deployed addresses)
export const VAULT_AUTHORITY_ADDRESS = new PublicKey("D2rns2sJNRyxA1DJVSwux9NcKb79h2dBrFP2y53yyQJa");
export const VAULT_TOKEN_ADDRESS = new PublicKey("5Dcg7FqrJTiC1mb39exEjnxANXTzVZFLgXvabcDqCjd7");

// Vault PDA seed (for reference)
export const VAULT_SEED = "vault";

// Maximum SOL amount for a single transaction (2 SOL)
export const MAX_SOL_AMOUNT = 2 * 1e9; // 2 SOL in lamports

// Price: 0.01 SOL per 1 USDC (10 lamports per USDC base unit)
export const SOL_PER_USDC = 0.01;
export const LAMPORTS_PER_USDC_UNIT = 10;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// SOL has 9 decimals
export const SOL_DECIMALS = 9;

