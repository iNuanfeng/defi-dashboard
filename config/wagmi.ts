import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'MultiChain DeFi Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    ...(process.env.NODE_ENV === 'development' ? [sepolia] : []),
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const supportedChains = [
  {
    id: mainnet.id,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟨E⟩',
    color: '#627EEA',
    chain: mainnet,
  },
  {
    id: polygon.id,
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '◆',
    color: '#8247E5',
    chain: polygon,
  },
] as const;

export type SupportedChain = typeof supportedChains[number];