import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  mainnet,
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
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        injectedWallet,
        // 防止 SSR 时 indexedDB 错误 - 只在浏览器环境加载 WalletConnect 相关钱包
        ...(typeof indexedDB !== "undefined"
          ? [metaMaskWallet, walletConnectWallet, trustWallet]
          : []),
      ],
    },
  ],
  ssr: true, // 重新启用 SSR
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