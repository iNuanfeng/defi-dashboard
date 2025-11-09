'use client';

import { useAccount } from 'wagmi';
import { WalletButton, WalletInfo } from '@/components/wallet';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

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
                <div className="text-4xl font-bold text-gray-900">$0.00</div>
              </div>

              {/* Chain Tabs */}
              <div className="flex gap-2 mb-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                  Ethereum ($0.00)
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
                  Polygon ($0.00)
                </button>
              </div>

              {/* Asset List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Ethereum 资产</h3>
                </div>
                
                {/* Native Token */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">ETH</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Ethereum (ETH)</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-500">$0.00</div>
                    </div>
                  </div>
                </div>

                {/* Tokens Section */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">代币资产</h4>
                  <div className="text-center py-8 text-gray-500">
                    暂无代币资产
                  </div>
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
