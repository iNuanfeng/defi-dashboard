'use client';

import { useAccount, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';

export function WalletInfo() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected || !address) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">钱包信息</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">网络:</span>
          <span className="font-medium text-gray-900">
            {chain?.name || '未知网络'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">地址:</span>
          <span className="font-mono text-xs text-gray-900">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">余额:</span>
          <span className="font-medium text-gray-900">
            {isLoading ? (
              <span className="animate-pulse">加载中...</span>
            ) : (
              `${balance?.formatted.slice(0, 8)} ${balance?.symbol}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
}