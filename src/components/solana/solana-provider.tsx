import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { createSolanaDevnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react'

export const WalletButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiDropdown, {
  ssr: false,
})
export const ClusterButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiClusterDropdown, {
  ssr: false,
})

// Removal of localnet cluster
// const config = createWalletUiConfig({
//   clusters: [createSolanaDevnet(), createSolanaLocalnet()],
// })
const config = createWalletUiConfig({
  clusters: [createSolanaDevnet()],
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  console.log('Cluster config:', config.clusters)
  return <WalletUi config={config}>{children}</WalletUi>
}
