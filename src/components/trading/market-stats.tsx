'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { AnchorClient } from '@/lib/anchor';
import { MarketStats as MarketStatsType } from '@/lib/types';
import { formatSOL, formatUSDC } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MarketStats() {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [stats, setStats] = useState<MarketStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!connected) {
      setWalletError('Please connect your wallet to view market statistics');
      setLoading(false);
      return;
    }

    if (!publicKey) {
      setWalletError('Wallet public key not available. Please reconnect your wallet.');
      setLoading(false);
      return;
    }

    if (!signTransaction || !signAllTransactions) {
      setWalletError('Wallet signer not available. Please connect your wallet first.');
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      setWalletError(null);
      // Use devnet endpoint for now
      const connection = new Connection('https://api.devnet.solana.com');
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions
      };
      const account = { address: publicKey.toString() };
      const client = new AnchorClient(connection, account, walletAdapter);
      const marketStats = await client.getMarketStats();

      if (marketStats) {
        setStats(marketStats);
      } else {
        setError('Failed to fetch market statistics');
      }
    } catch (err) {
      console.error('Error fetching market stats:', err);
      if (err instanceof Error && err.message.includes('Wallet')) {
        setWalletError('Wallet error: ' + err.message);
      } else {
        setError('Error fetching market statistics');
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, signTransaction, signAllTransactions]);

  useEffect(() => {
    fetchStats();
    if (connected && publicKey) {
      const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [publicKey, connected, fetchStats]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading market data...</div>
        </CardContent>
      </Card>
    );
  }

  if (walletError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-red-500 font-medium mb-2">Wallet Connection Required</div>
            <div className="text-sm text-muted-foreground">{walletError}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-red-500 font-medium mb-2">Error Loading Market Data</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">No market data available</div>
        </CardContent>
      </Card>
    );
  }

  const utilizationPercentage = ((stats.totalBought - stats.totalSold) / stats.maxSupply) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">USDC Available</div>
            <div className="text-2xl font-bold text-green-600">
              {formatUSDC(stats.totalUSDCLeft)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">SOL in Program</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatSOL(stats.totalSOLInProgram)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Bought</div>
            <div className="text-lg font-semibold">
              {formatUSDC(stats.totalBought)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Sold</div>
            <div className="text-lg font-semibold">
              {formatUSDC(stats.totalSold)}
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Market Utilization</span>
            <span className="text-sm font-medium">{utilizationPercentage.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
