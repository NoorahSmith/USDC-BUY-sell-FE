import { getExplorerLink, GetExplorerLinkArgs } from 'gill'
import { ArrowUpRightFromSquare } from 'lucide-react'

export function AppExplorerLink({
  className,
  label = '',
  ...link
}: GetExplorerLinkArgs & {
  className?: string
  label: string
}) {
  // Use devnet cluster for explorer links
  const cluster = { cluster: { endpoint: 'https://api.devnet.solana.com' } }
  return (
    <a
      href={getExplorerLink({ ...link, cluster: cluster.cluster })}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono inline-flex gap-1`}
    >
      {label}
      <ArrowUpRightFromSquare size={12} />
    </a>
  )
}
