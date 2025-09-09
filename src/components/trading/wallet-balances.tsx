'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { AnchorClient } from '@/lib/anchor';
import { formatSOL, formatUSDC } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Coins } from 'lucide-react';

interface WalletBalances {
  solBalance: number;
  usdcBalance: number;
}

export function WalletBalances() {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!connected || !publicKey || !signTransaction || !signAllTransactions) {
      setBalances(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const connection = new Connection('https://api.devnet.solana.com');
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions
      };
      const account = { address: publicKey.toString() };
      const client = new AnchorClient(connection, account, walletAdapter);
      
      const walletBalances = await client.getWalletBalances();
      setBalances(walletBalances);
    } catch (err) {
      console.error('Error fetching wallet balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    if (connected && publicKey) {
      const interval = setInterval(fetchBalances, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [publicKey, connected, signTransaction, signAllTransactions]);

  if (!connected || !publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Connect your wallet to view balances
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Loading balances...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-4">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">SOL Balance</span>
          </div>
          <Badge variant="outline" className="text-yellow-600">
            {balances ? formatSOL(balances.solBalance) : '0 SOL'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">USDC Balance</span>
          </div>
          <Badge variant="outline" className="text-blue-600">
            {balances ? formatUSDC(balances.usdcBalance) : '0 USDC'}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Balances update automatically every 10 seconds
        </div>
      </CardContent>
    </Card>
  );
}
