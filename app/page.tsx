'use client';

import { useAccount } from 'wagmi';
import { WalletButton, WalletInfo } from '@/components/wallet';
import { useEffect, useState } from 'react';
import { useEnhancedAssetBalances } from '@/lib/hooks';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedChain, setSelectedChain] = useState<number>(1); // 1 for Ethereum, 137 for Polygon
  const { isConnected } = useAccount();
  const { enhancedBalances, summary, isLoading, formatUSDValue, formatPriceChange } = useEnhancedAssetBalances();

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
              <WalletButton />
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
            <WalletButton />
            
            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                MultiChain DeFi Dashboard © 2025
              </p>
            </div>
          </div>
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
                    {isLoading ? '加载中...' : formatUSDValue(summary.totalUSDValue)}
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
              <div className="flex gap-2 mb-6">
                <ChainTab 
                  chainId={1}
                  name="Ethereum"
                  symbol="ETH"
                  value={formatUSDValue(
                    enhancedBalances
                      .filter(b => b.chainId === 1)
                      .reduce((sum, b) => sum + b.usdValue, 0)
                  )}
                  active={selectedChain === 1}
                  onClick={() => setSelectedChain(1)}
                />
                <ChainTab 
                  chainId={137}
                  name="Polygon"
                  symbol="MATIC"
                  value={formatUSDValue(
                    enhancedBalances
                      .filter(b => b.chainId === 137)
                      .reduce((sum, b) => sum + b.usdValue, 0)
                  )}
                  active={selectedChain === 137}
                  onClick={() => setSelectedChain(137)}
                />
              </div>

              {/* Asset List */}
              {(() => {
                const chainAssets = enhancedBalances.filter(b => b.chainId === selectedChain);
                const nativeAsset = chainAssets.find(a => a.type === 'native');
                const erc20Assets = chainAssets.filter(a => a.type === 'erc20' && parseFloat(a.formatted) > 0);
                const chainName = selectedChain === 1 ? 'Ethereum' : 'Polygon';
                
                return (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">{chainName} 资产</h3>
                    </div>
                    
                    {/* Native Token */}
                    {nativeAsset && (
                      <AssetItem asset={nativeAsset} formatUSDValue={formatUSDValue} formatPriceChange={formatPriceChange} />
                    )}

                    {/* ERC20 Tokens */}
                    {erc20Assets.length > 0 && (
                      <div className="border-t border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700">ERC20 代币</h4>
                        </div>
                        {erc20Assets.map((asset) => (
                          <AssetItem 
                            key={`${asset.chainId}-${asset.address || asset.symbol}`}
                            asset={asset} 
                            formatUSDValue={formatUSDValue} 
                            formatPriceChange={formatPriceChange}
                          />
                        ))}
                      </div>
                    )}

                    {/* Empty state for tokens */}
                    {erc20Assets.length === 0 && (
                      <div className="p-6 border-t border-gray-200">
                        <div className="text-center py-4 text-gray-500">
                          暂无ERC20代币资产
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()} 
            </div>

            {/* Wallet Info */}
            <WalletInfo />
          </div>
        )}
      </main>
    </div>
  );
}

interface ChainTabProps {
  chainId: number;
  name: string;
  symbol: string;
  value: string;
  active: boolean;
  onClick: () => void;
}

function ChainTab({ name, symbol, value, active, onClick }: ChainTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {name} ({value})
    </button>
  );
}

// 新增资产项目组件
interface AssetItemProps {
  asset: any;
  formatUSDValue: (value: number) => string;
  formatPriceChange: (change: number) => string;
}

function AssetItem({ asset, formatUSDValue, formatPriceChange }: AssetItemProps) {
  return (
    <div className="p-6 border-b border-gray-200 last:border-b-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            asset.type === 'native' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <span className={`font-bold text-xs ${
              asset.type === 'native' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {asset.symbol}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {asset.name}
              {asset.type === 'erc20' && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  ERC20
                </span>
              )}
            </div>
            {asset.price > 0 && (
              <div className="text-sm text-gray-500">
                {formatUSDValue(asset.price)}
                {asset.priceChange24h !== 0 && (
                  <span className={`ml-1 ${
                    asset.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({formatPriceChange(asset.priceChange24h)})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">
            {asset.isLoading ? '...' : parseFloat(asset.formatted).toFixed(4)}
          </div>
          <div className="text-sm text-gray-500">
            {formatUSDValue(asset.usdValue)}
          </div>
        </div>
      </div>
    </div>
  );
}
