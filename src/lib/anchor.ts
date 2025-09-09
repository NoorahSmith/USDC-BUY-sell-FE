import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PROGRAM_ID, VAULT_TOKEN_ADDRESS, USDC_MINT, MARKET_STATE_ADDRESS, VAULT_AUTHORITY_ADDRESS } from './constants';
import { MarketState, MarketStats } from './types';
import idl from '../usdc_buy_sell.json';
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

// Account interface from the new system
interface Account {
  address: string;
}

// Wallet adapter interface for Anchor provider
interface WalletAdapter {
  publicKey: PublicKey | null;
  signTransaction: (tx: unknown) => Promise<unknown>;
  signAllTransactions: (txs: unknown[]) => Promise<unknown[]>;
}

export class AnchorClient {
  private connection: Connection;
  private account: Account;
  private program: Program;
  private walletAdapter: WalletAdapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private walletSigner: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(connection: Connection, account: Account, walletSigner: any) {
    this.connection = connection;
    this.account = account;
    
    // Store the actual wallet signer for transaction signing
    this.walletSigner = walletSigner;
    
    // Convert WalletSigner to WalletAdapter format
    this.walletAdapter = {
      publicKey: new PublicKey(account.address),
      signTransaction: async (tx: unknown) => {
        if (!walletSigner?.signTransaction) {
          throw new Error('Wallet signer not available');
        }
        return await walletSigner.signTransaction(tx);
      },
      signAllTransactions: async (txs: unknown[]) => {
        if (!walletSigner?.signAllTransactions) {
          throw new Error('Wallet signer not available');
        }
        return await walletSigner.signAllTransactions(txs);
      }
    };

    // Create Anchor provider
    const provider = new AnchorProvider(
      connection,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.walletAdapter as any,
      { commitment: 'confirmed' }
    );

    // Initialize the program
    this.program = new Program(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      idl as any, 
      provider
    );
  }

  async getMarketState(): Promise<MarketState | null> {
    try {
      const marketState = await (this.program.account as unknown as { marketState: { fetch: (address: PublicKey) => Promise<MarketState> } }).marketState.fetch(MARKET_STATE_ADDRESS);
      return marketState;
    } catch (error) {
      console.error('Error fetching market state:', error);
      return null;
    }
  }

  async getMarketStats(): Promise<MarketStats | null> {
    try {
      const marketState = await this.getMarketState();
      if (!marketState) return null;

      // Get SOL balance of the program
      const programBalance = await this.connection.getBalance(PROGRAM_ID);
      const totalSOLInProgram = programBalance;

      // Get USDC left in vault using the actual vault token address
      try {
        const vaultTokenAccount = await this.connection.getTokenAccountBalance(VAULT_TOKEN_ADDRESS);
        const totalUSDCLeft = parseInt(vaultTokenAccount.value.amount);
        
        console.log('Vault token account info:', {
          address: VAULT_TOKEN_ADDRESS.toString(),
          amount: vaultTokenAccount.value.amount,
          uiAmount: vaultTokenAccount.value.uiAmount,
          decimals: vaultTokenAccount.value.decimals
        });

        return {
          totalUSDCLeft,
          totalSOLInProgram,
          totalBought: marketState.totalBought,
          totalSold: marketState.totalSold,
          maxSupply: marketState.maxSupply,
        };
      } catch {
        console.log('Vault not found, using mock data');
        return {
          totalUSDCLeft: 500000000, // Mock: 500 USDC
          totalSOLInProgram,
          totalBought: marketState.totalBought,
          totalSold: marketState.totalSold,
          maxSupply: marketState.maxSupply,
        };
      }
    } catch (error) {
      console.error('Error fetching market stats:', error);
      return null;
    }
  }

  async getWalletBalances(): Promise<{ solBalance: number; usdcBalance: number } | null> {
    if (!this.walletAdapter.publicKey) return null;

    try {
      // Get SOL balance
      const solBalance = await this.connection.getBalance(this.walletAdapter.publicKey);

      // Get USDC balance
      let usdcBalance = 0;
      try {
        const usdcTokenAccount = getAssociatedTokenAddressSync(
          USDC_MINT,
          this.walletAdapter.publicKey
        );
        const tokenAccountInfo = await this.connection.getTokenAccountBalance(usdcTokenAccount);
        usdcBalance = parseInt(tokenAccountInfo.value.amount);
      } catch (error) {
        console.log('USDC token account not found, balance is 0');
        usdcBalance = 0;
      }

      return {
        solBalance,
        usdcBalance
      };
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      return null;
    }
  }

  async buyUSDC(amount: number): Promise<string> {
    if (!this.walletAdapter.publicKey) throw new Error('Wallet not connected');

    console.log('Buy USDC - Amount requested:', amount);
    console.log('Account address:', this.account.address);

    // Validate wallet has enough SOL
    const balances = await this.getWalletBalances();
    if (!balances) throw new Error('Could not fetch wallet balances');
    
    const solRequired = amount; // 1 USDC = 1 lamport of SOL (0.01 SOL = 100 USDC)
    if (balances.solBalance < solRequired) {
      throw new Error(`Insufficient SOL balance. Required: ${solRequired / 1e9} SOL, Available: ${balances.solBalance / 1e9} SOL`);
    }

    try {
      // Get the buyer's USDC token account
      const buyerUsdcAccount = getAssociatedTokenAddressSync(
        USDC_MINT,
        this.walletAdapter.publicKey
      );

      // Create the transaction
      const tx = await this.program.methods
        .buyUsdc(new BN(amount))
        .accounts({
          buyer: this.walletAdapter.publicKey,
          usdcMint: USDC_MINT,
          buyerUsdcAccount: buyerUsdcAccount,
          vaultTokenAccount: VAULT_TOKEN_ADDRESS,
          vaultAuthority: VAULT_AUTHORITY_ADDRESS,
          marketState: MARKET_STATE_ADDRESS,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();

      // Add recent blockhash to the transaction
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = this.walletAdapter.publicKey;

      // Sign and send the transaction using the wallet
      const signedTx = await this.walletAdapter.signTransaction(tx);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      await this.connection.confirmTransaction(signature);
      console.log('Buy USDC transaction signature:', signature);
      
      return signature;
    } catch (error) {
      console.error('Error buying USDC:', error);
      throw error;
    }
  }

  async sellUSDC(amount: number): Promise<string> {
    if (!this.walletAdapter.publicKey) throw new Error('Wallet not connected');

    console.log('Sell USDC - Amount requested:', amount);
    console.log('Account address:', this.account.address);

    // Validate wallet has enough USDC
    const balances = await this.getWalletBalances();
    if (!balances) throw new Error('Could not fetch wallet balances');
    
    if (balances.usdcBalance < amount) {
      throw new Error(`Insufficient USDC balance. Required: ${amount / 1e6} USDC, Available: ${balances.usdcBalance / 1e6} USDC`);
    }

    try {
      // Get the seller's USDC token account
      const sellerUsdcAccount = getAssociatedTokenAddressSync(
        USDC_MINT,
        this.walletAdapter.publicKey
      );

      // Create the transaction
      const tx = await this.program.methods
        .sellUsdc(new BN(amount))
        .accounts({
          seller: this.walletAdapter.publicKey,
          usdcMint: USDC_MINT,
          sellerUsdcAccount: sellerUsdcAccount,
          vaultTokenAccount: VAULT_TOKEN_ADDRESS,
          vaultAuthority: VAULT_AUTHORITY_ADDRESS,
          marketState: MARKET_STATE_ADDRESS,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();

      // Add recent blockhash to the transaction
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = this.walletAdapter.publicKey;

      // Sign and send the transaction using the wallet
      const signedTx = await this.walletAdapter.signTransaction(tx);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      await this.connection.confirmTransaction(signature);
      console.log('Sell USDC transaction signature:', signature);
      
      return signature;
    } catch (error) {
      console.error('Error selling USDC:', error);
      throw error;
    }
  }
}
