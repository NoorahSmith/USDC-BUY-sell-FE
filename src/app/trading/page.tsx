'use client';

import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import components with no SSR to avoid wallet provider issues
const MarketStats = dynamicImport(() => import('@/components/trading/market-stats').then(mod => ({ default: mod.MarketStats })), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
});

const BuySellInterface = dynamicImport(() => import('@/components/trading/buy-sell-interface').then(mod => ({ default: mod.BuySellInterface })), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
});

// Force dynamic rendering to avoid SSR issues with wallet providers
export const dynamic = 'force-dynamic';

export default function TradingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">USDC Buy/Sell DEX</h1>
          <p className="text-lg text-muted-foreground">
            Trade USDC with SOL at a fixed rate of 0.01 SOL per USDC
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg"></div>}>
              <BuySellInterface />
            </Suspense>
          </div>
          <div className="space-y-6">
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg"></div>}>
              <MarketStats />
            </Suspense>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">1. Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Solana wallet to start trading
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. Choose Trade</h3>
              <p className="text-muted-foreground">
                Buy USDC with SOL or sell USDC for SOL
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">3. Confirm Transaction</h3>
              <p className="text-muted-foreground">
                Approve the transaction in your wallet
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
            Trading Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Exchange Rate</h3>
              <p className="text-blue-700 dark:text-blue-300">
                1 USDC = 0.01 SOL (Fixed Rate)
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Buy Limit</h3>
              <p className="text-blue-700 dark:text-blue-300">
                Maximum 2 SOL per transaction
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Network</h3>
              <p className="text-blue-700 dark:text-blue-300">
                Solana Devnet
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Auto ATA</h3>
              <p className="text-blue-700 dark:text-blue-300">
                Associated Token Accounts created automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

