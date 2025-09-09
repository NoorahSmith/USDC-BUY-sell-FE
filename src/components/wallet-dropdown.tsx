'use client'

import * as React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function WalletDropdown() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="wallet-adapter-button-trigger">
        Loading...
      </div>
    )
  }

  return <WalletMultiButton />
}