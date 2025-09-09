'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { AnchorClient } from '@/lib/anchor';
import { formatSOL, formatUSDC, parseSOL, parseUSDC, MAX_SOL_AMOUNT, LAMPORTS_PER_USDC_UNIT } from '@/lib/format';
import { WalletBalances } from './wallet-balances';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function BuySellInterface() {
  const { publicKey, connected, wallet, signTransaction, signAllTransactions } = useWallet();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletBalances, setWalletBalances] = useState<{ solBalance: number; usdcBalance: number } | null>(null);

  const fetchWalletBalances = async () => {
    if (!connected || !publicKey || !signTransaction || !signAllTransactions) {
      setWalletBalances(null);
      return;
    }

    try {
      const connection = new Connection('https://api.devnet.solana.com');
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions
      };
      const account = { address: publicKey.toString() };
      const client = new AnchorClient(connection, account, walletAdapter);
      
      const balances = await client.getWalletBalances();
      setWalletBalances(balances);
    } catch (err) {
      console.error('Error fetching wallet balances:', err);
    }
  };

  const validateInput = (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'Amount is required';
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid amount';
    }

    if (activeTab === 'buy') {
      const solAmount = parseSOL(value);
      if (solAmount > MAX_SOL_AMOUNT) {
        return `Maximum ${formatSOL(MAX_SOL_AMOUNT)} SOL per transaction`;
      }
      
      // Check if wallet has enough SOL
      if (walletBalances && solAmount > walletBalances.solBalance) {
        return `Insufficient SOL balance. Available: ${formatSOL(walletBalances.solBalance)}`;
      }
    } else {
      const usdcAmount = parseUSDC(value);
      if (usdcAmount <= 0) {
        return 'Please enter a valid USDC amount';
      }
      
      // Check if wallet has enough USDC
      if (walletBalances && usdcAmount > walletBalances.usdcBalance) {
        return `Insufficient USDC balance. Available: ${formatUSDC(walletBalances.usdcBalance)}`;
      }
    }

    return null;
  };

  // Fetch wallet balances when component mounts or wallet connects
  useEffect(() => {
    fetchWalletBalances();
    if (connected && publicKey) {
      const interval = setInterval(fetchWalletBalances, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [connected, publicKey, signTransaction, signAllTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setWalletError(null);
    setSuccess(null);

    // Check wallet connection
    if (!connected) {
      setWalletError('Please connect your wallet first');
      toast.error('Please connect your wallet first');
      return;
    }

    if (!publicKey) {
      setWalletError('Wallet public key not available. Please reconnect your wallet.');
      toast.error('Wallet public key not available. Please reconnect your wallet.');
      return;
    }

    if (!wallet) {
      setWalletError('Wallet not properly initialized. Please refresh the page.');
      toast.error('Wallet not properly initialized. Please refresh the page.');
      return;
    }

    if (!signTransaction || !signAllTransactions) {
      setWalletError('Wallet signer not available. Please reconnect your wallet.');
      toast.error('Wallet signer not available. Please reconnect your wallet.');
      return;
    }

    const validationError = validateInput(amount);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      // Use devnet endpoint for now
      const connection = new Connection('https://api.devnet.solana.com');
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions
      };
      const account = { address: publicKey.toString() };
      const client = new AnchorClient(connection, account, walletAdapter);
      let txSignature: string;

      if (activeTab === 'buy') {
        const solAmount = parseSOL(amount);
        // Convert SOL to USDC: 1 USDC = 0.01 SOL, so 1 SOL = 100 USDC
        const usdcAmount = Math.floor(solAmount / LAMPORTS_PER_USDC_UNIT);
        txSignature = await client.buyUSDC(usdcAmount);
        setSuccess(`Successfully bought ${formatUSDC(usdcAmount)} USDC for ${amount} SOL!`);
        toast.success(`Successfully bought ${formatUSDC(usdcAmount)} USDC!`);
        
        // Refresh wallet balances after successful transaction
        setTimeout(() => {
          fetchWalletBalances();
        }, 2000);
      } else {
        const usdcAmount = parseUSDC(amount);
        txSignature = await client.sellUSDC(usdcAmount);
        const solReceived = (usdcAmount * LAMPORTS_PER_USDC_UNIT) / 1e9;
        setSuccess(`Successfully sold ${amount} USDC for ${solReceived.toFixed(4)} SOL!`);
        toast.success(`Successfully sold ${amount} USDC!`);
        
        // Refresh wallet balances after successful transaction
        setTimeout(() => {
          fetchWalletBalances();
        }, 2000);
      }

      console.log('Transaction signature:', txSignature);
      
      // Clear form
      setAmount('');
    } catch (err: unknown) {
      console.error('Transaction failed:', err);
      let errorMessage = 'Transaction failed';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error types
        if (err.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled by user';
        } else if (err.message.includes('Insufficient funds')) {
          errorMessage = 'Insufficient funds for this transaction';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('Wallet')) {
          setWalletError('Wallet error: ' + err.message);
          errorMessage = 'Wallet error. Please check your wallet connection.';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(null);
    setSuccess(null);
  };


  const getPlaceholder = () => {
    if (activeTab === 'buy') {
      return `Max: ${formatSOL(MAX_SOL_AMOUNT)} SOL`;
    }
    return 'Enter USDC amount';
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Trade USDC</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy USDC</TabsTrigger>
            <TabsTrigger value="sell">Sell USDC</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">SOL Amount</Label>
                <Input
                  id="buy-amount"
                  type="number"
                  step="0.0001"
                  placeholder={getPlaceholder()}
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={error ? 'border-red-500' : ''}
                />
                <div className="text-sm text-muted-foreground">
                  Rate: 1 USDC = 0.01 SOL
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !connected || !publicKey || !signTransaction}
              >
                {loading ? 'Processing...' : !connected ? 'Connect Wallet' : 'Buy USDC'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">USDC Amount</Label>
                <Input
                  id="sell-amount"
                  type="number"
                  step="0.01"
                  placeholder={getPlaceholder()}
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={error ? 'border-red-500' : ''}
                />
                <div className="text-sm text-muted-foreground">
                  Rate: 1 USDC = 0.01 SOL
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !connected || !publicKey || !signTransaction}
              >
                {loading ? 'Processing...' : !connected ? 'Connect Wallet' : 'Sell USDC'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {walletError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-600 font-medium">Wallet Error</div>
            <div className="text-sm text-red-600 mt-1">{walletError}</div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-600 font-medium">Transaction Error</div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-600 font-medium">Success</div>
            <div className="text-sm text-green-600 mt-1">{success}</div>
          </div>
        )}

        {!connected && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-600 font-medium">Wallet Required</div>
            <div className="text-sm text-blue-600 mt-1">
              Please connect your wallet using the button in the header to start trading
            </div>
          </div>
        )}

        {connected && !publicKey && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-sm text-yellow-600 font-medium">Account Loading</div>
            <div className="text-sm text-yellow-600 mt-1">
              Wallet connected but account details are loading. Please wait...
            </div>
          </div>
        )}

        {connected && publicKey && !signTransaction && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="text-sm text-orange-600 font-medium">Wallet Signer Loading</div>
            <div className="text-sm text-orange-600 mt-1">
              Wallet connected but signer is initializing. Please wait...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* Wallet Balances Component */}
    <WalletBalances />
    </>
  );
}
