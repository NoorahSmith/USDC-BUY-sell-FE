const { Connection, PublicKey, Keypair, clusterApiUrl } = require('@solana/web3.js');
const { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddressSync, 
  getAccount,
  createTransferInstruction 
} = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const USDC_MINT = new PublicKey("4f3XEdxWDzxAadHfXyqofXUg1Qsz5kwLCrABp64JqS7h");
const VAULT_AUTHORITY = new PublicKey("D2rns2sJNRyxA1DJVSwux9NcKb79h2dBrFP2y53yyQJa");
const VAULT_TOKEN = new PublicKey("5Dcg7FqrJTiC1mb39exEjnxANXTzVZFLgXvabcDqCjd7");

async function fundVault() {
  try {
    // Get amount from command line argument or use default
    const amountArg = process.argv[2] || "1000"; // Default 1000 USDC
    const amount = parseFloat(amountArg);
    const amountInBaseUnits = Math.floor(amount * Math.pow(10, 6)); // Convert to base units

    // Setup connection and wallet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const secret = JSON.parse(fs.readFileSync(`${process.env.HOME}/.config/solana/id.json`, "utf8"));
    const payer = Keypair.fromSecretKey(Uint8Array.from(secret));

    console.log("Funding vault with USDC:");
    console.log("  Payer:", payer.publicKey.toBase58());
    console.log("  USDC Mint:", USDC_MINT.toBase58());
    console.log("  Vault Authority:", VAULT_AUTHORITY.toBase58());
    console.log("  Vault Token Account:", VAULT_TOKEN.toBase58());
    console.log("  Amount:", amount, "USDC (", amountInBaseUnits, "base units)");

    // Get the payer's USDC token account
    const payerTokenAccount = getAssociatedTokenAddressSync(
      USDC_MINT,
      payer.publicKey,
      false
    );

    // Check payer's USDC balance
    try {
      const payerAccount = await getAccount(connection, payerTokenAccount);
      console.log("  Payer USDC Balance:", payerAccount.amount);
      
      if (BigInt(amountInBaseUnits) > payerAccount.amount) {
        throw new Error(`Insufficient USDC balance. Have: ${payerAccount.amount}, Need: ${amountInBaseUnits}`);
      }
    } catch (error) {
      console.error("Error checking payer balance:", error);
      throw error;
    }

    // Check current vault balance
    try {
      const vaultAccount = await getAccount(connection, VAULT_TOKEN);
      console.log("  Vault USDC Balance (before):", vaultAccount.amount);
    } catch (error) {
      console.log("  Vault token account doesn't exist yet or has no balance");
    }

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      payerTokenAccount,
      VAULT_TOKEN,
      payer.publicKey,
      amountInBaseUnits,
      [],
      TOKEN_PROGRAM_ID
    );

    // Send transaction
    const { Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
    const transaction = new Transaction().add(transferInstruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);

    console.log("✅ Successfully funded vault!");
    console.log("  Transaction signature:", signature);
    
    // Check final vault balance
    try {
      const vaultAccount = await getAccount(connection, VAULT_TOKEN);
      console.log("  Vault USDC Balance (after):", vaultAccount.amount);
    } catch (error) {
      console.log("  Could not fetch final vault balance");
    }

  } catch (error) {
    console.error("Error funding vault:", error);
    process.exit(1);
  }
}

fundVault();
