'use client';

import { useAccount } from 'wagmi';
import { WalletButton, WalletInfo } from '@/components/wallet';
import { useEffect, useState, useMemo } from 'react';
import { useEnhancedAssetBalances } from '@/lib/hooks';
import { AssetList, CompactAssetCard } from '@/components/assets';
import { LoadingState, ErrorState, NoAssetsState, EmptyState, ChainTabGroup } from '@/components/ui';

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<number>(1); // 1 for Ethereum, 137 for Polygon
  const { isConnected } = useAccount();
  const { enhancedBalances, summary, isLoading, hasError, formatUSDValue, formatPriceChange } = useEnhancedAssetBalances();

  // 准备链数据
  const chainData = useMemo(() => [
    {
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      value: formatUSDValue(
        enhancedBalances
          .filter(b => b.chainId === 1)
          .reduce((sum, b) => sum + b.usdValue, 0)
      )
    },
    {
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      value: formatUSDValue(
        enhancedBalances
          .filter(b => b.chainId === 137)
          .reduce((sum, b) => sum + b.usdValue, 0)
      )
    }
  ], [enhancedBalances, formatUSDValue]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                MultiChain DeFi Dashboard
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          // Welcome Screen (未连接钱包状态)
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              欢迎使用多链DeFi仪表盘
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              连接您的钱包，查看您的资产和交易历史，管理您的DeFi投资
            </p>
            <div className="flex justify-center">
              <WalletButton />
            </div>
            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                MultiChain DeFi Dashboard © 2025
              </p>
            </div>
          </div>
        ) : hasError ? (
          // Error State
          <ErrorState 
            title="加载资产失败"
            message="无法获取您的资产信息，请检查网络连接或稍后重试"
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          // Loading State
          <LoadingState message="正在加载资产..." />
        ) : enhancedBalances.length === 0 ? (
          // Empty State
          <NoAssetsState 
            isConnected={isConnected}
            onConnectWallet={() => {}}
          />
        ) : (
          // Dashboard (已连接钱包状态)
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">资产总览</h2>
              
              {/* Total Value */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-600 mb-2">总资产价值</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {formatUSDValue(summary.totalUSDValue)}
                  </div>
                  {summary.totalChange24h !== 0 && (
                    <div className={`text-sm font-medium ${
                      summary.totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPriceChange(summary.totalChange24h)} (24h)
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {summary.activeAssets} 项活跃资产 • {summary.totalAssets} 项总资产 • {summary.activeChains} 个区块链
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  原生代币: {summary.nativeAssets} • ERC20代币: {summary.erc20Assets}
                </div>
              </div>

              {/* Chain Tabs */}
              <ChainTabGroup
                chains={chainData}
                activeChainId={selectedChain}
                onChainChange={setSelectedChain}
                className="mb-6"
              />

              {/* Asset List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedChain === 1 ? 'Ethereum 资产' : 'Polygon 资产'}
                  </h3>
                </div>
                <div className="p-6">
                  <AssetList 
                    assets={enhancedBalances.filter(b => b.chainId === selectedChain)}
                    isLoading={isLoading}
                    showControls={false}
                    showEmptyState={true}
                  />
                </div>
              </div>
            </div>

            {/* Wallet Info */}
            <WalletInfo />
          </div>
        )}
      </main>
    </div>
  );
}
