import { UiWalletAccount, useWalletAccountTransactionSendingSigner } from '@wallet-ui/react'
import { useSolana } from '@/components/solana/use-solana'
import { useMemo } from 'react'

// Create a minimal valid account object that satisfies the hook's requirements
const createMinimalAccount = (): UiWalletAccount => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    address: { toString: () => 'dummy' } as any,
    signAndSendTransactions: async () => [],
    // Add any other required properties with minimal implementations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any as UiWalletAccount
}

export function useWalletUiSigner() {
  const { account, cluster } = useSolana()

  // Create a stable account object that's never null
  const stableAccount = useMemo(() => {
    return account || createMinimalAccount()
  }, [account])

  // Always call the hook with a valid account object
  const signer = useWalletAccountTransactionSendingSigner(
    stableAccount as UiWalletAccount, 
    cluster?.id || 'devnet'
  )

  // Return null if the real account is not available
  if (!account || !cluster) {
    return null
  }

  return signer
}
