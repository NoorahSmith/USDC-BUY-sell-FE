'use client'

import * as React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function WalletConnectionStatus() {
  const { connected, connecting, publicKey } = useWallet()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Badge variant="outline" className="text-gray-600 border-gray-600">
        Loading...
      </Badge>
    )
  }

  if (connecting) {
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-600">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Connecting...
      </Badge>
    )
  }

  if (!connected || !publicKey) {
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
        <XCircle className="w-3 h-3 mr-1" />
        Not Connected
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-green-600 border-green-600">
      <CheckCircle className="w-3 h-3 mr-1" />
      Connected
    </Badge>
  )
}
