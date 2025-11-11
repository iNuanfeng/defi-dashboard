/**
 * 资产卡片组件
 * 展示单个资产的详细信息
 */

import { formatUSDValue, formatPriceChange } from '@/lib/utils/formatters';
import type { EnhancedAssetBalance } from '@/lib/hooks/useEnhancedAssetBalances';

interface AssetCardProps {
  asset: EnhancedAssetBalance;
  onClick?: () => void;
  className?: string;
}

export function AssetCard({ asset, onClick, className = '' }: AssetCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // 检查资产是否有错误
  const hasError = !!asset.error;

  const getChainBadgeColor = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 137:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div 
      className={`bg-white rounded-lg border transition-all duration-200 ${
        hasError 
          ? 'border-red-200 bg-red-50' 
          : 'border-gray-200 hover:border-gray-300'
      } p-4 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* 错误状态指示器 */}
      {hasError && (
        <div className="mb-3 flex items-center space-x-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.858-.833-2.628 0L3.186 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>数据加载异常</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Token Icon Placeholder */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {asset.symbol.charAt(0)}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{asset.symbol}</h3>
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getChainBadgeColor(asset.chainId)}`}
              >
                {asset.chainName}
              </span>
            </div>
            <p className="text-sm text-gray-500">{asset.name}</p>
          </div>
        </div>

        {/* Asset Type Badge */}
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          asset.type === 'native' 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {asset.type === 'native' ? '原生' : 'ERC20'}
        </span>
      </div>

      {/* Balance and Value */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">余额</span>
          <span className="text-lg font-semibold text-gray-900">
            {parseFloat(asset.formatted).toLocaleString()} {asset.symbol}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">价值</span>
          <span className="text-lg font-bold text-gray-900">
            {formatUSDValue(asset.usdValue)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">价格</span>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              ${asset.price.toLocaleString()}
            </div>
            {asset.priceChange24h !== 0 && (
              <div className={`text-xs font-medium px-2 py-1 rounded-md ${getPriceChangeColor(asset.priceChange24h)}`}>
                {formatPriceChange(asset.priceChange24h)} (24h)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Address (for ERC20 only) */}
      {asset.type === 'erc20' && asset.address && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">合约地址</span>
            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {`${asset.address.slice(0, 6)}...${asset.address.slice(-4)}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface CompactAssetCardProps {
  asset: EnhancedAssetBalance;
  onClick?: () => void;
  className?: string;
}

export function CompactAssetCard({ asset, onClick, className = '' }: CompactAssetCardProps) {
  const hasError = !!asset.error;
  
  return (
    <div 
      className={`bg-white rounded-lg border transition-colors p-3 ${
        hasError 
          ? 'border-red-200 bg-red-50' 
          : 'border-gray-200 hover:border-gray-300'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
            hasError ? 'bg-red-400' : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}>
            {hasError ? '!' : asset.symbol.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${hasError ? 'text-red-600' : 'text-gray-900'}`}>
                {asset.symbol}
                {hasError && <span className="text-xs ml-1">(异常)</span>}
              </span>
              <span className="text-xs text-gray-500">{asset.chainName}</span>
            </div>
            <div className={`text-sm ${hasError ? 'text-red-500' : 'text-gray-500'}`}>
              {hasError ? '数据异常' : parseFloat(asset.formatted).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {formatUSDValue(asset.usdValue)}
          </div>
          {asset.priceChange24h !== 0 && (
            <div className={`text-xs ${asset.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPriceChange(asset.priceChange24h)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}