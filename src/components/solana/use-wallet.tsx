'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

export function useSolanaWallet() {
  const { connection } = useConnection()
  const { 
    publicKey, 
    wallet, 
    connect, 
    disconnect, 
    connected, 
    connecting,
    disconnecting 
  } = useWallet()

  return {
    connection,
    publicKey,
    wallet,
    connect,
    disconnect,
    connected,
    connecting,
    disconnecting,
    // For compatibility with existing code
    account: publicKey ? { address: publicKey.toString() } : null,
    cluster: { id: 'devnet', cluster: { endpoint: connection.rpcEndpoint } }
  }
}
