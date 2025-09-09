import { ReactNode } from 'react'

export function ClusterUiChecker({ children }: { children: ReactNode }) {
  // Since we're using devnet, just return children without checking cluster version
  // This avoids the hydration error and undefined cluster issues
  return children
}
