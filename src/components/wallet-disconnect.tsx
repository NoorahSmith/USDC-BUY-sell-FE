'use client'

import * as React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'

function WalletDisconnect(props: React.ComponentProps<typeof Button>) {
  const { connected, disconnect } = useWallet()
  return (
    <Button variant="outline" className="cursor-pointer" {...props} onClick={disconnect} disabled={!connected}>
      Disconnect
    </Button>
  )
}

export { WalletDisconnect }
