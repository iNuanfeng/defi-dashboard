/**
 * 资产列表组件
 * 展示多个资产的列表，支持不同的展示模式
 */

import { useState } from 'react';
import { AssetCard, CompactAssetCard } from './AssetCard';
import { AssetLoadingCard } from '../ui/Loading';
import { ErrorState } from '../ui/ErrorState';
import type { EnhancedAssetBalance } from '@/lib/hooks/useEnhancedAssetBalances';
import { Bars3Icon, Squares2X2Icon, FunnelIcon } from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'list';
type SortBy = 'value' | 'balance' | 'symbol' | 'change';
type FilterBy = 'all' | 'native' | 'erc20';

interface AssetListProps {
  assets: EnhancedAssetBalance[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onAssetClick?: (asset: EnhancedAssetBalance) => void;
  className?: string;
  showControls?: boolean;
  defaultViewMode?: ViewMode;
  showEmptyState?: boolean;
}

export function AssetList({ 
  assets, 
  isLoading = false, 
  error = null,
  onRetry,
  onAssetClick,
  className = '',
  showControls = true,
  defaultViewMode = 'grid',
  showEmptyState = true
}: AssetListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [sortBy, setSortBy] = useState<SortBy>('value');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [showErrorAssets, setShowErrorAssets] = useState(true); // 新增：是否显示错误资产

  // 统计错误资产数量
  const errorAssetCount = assets.filter(asset => !!asset.error).length;

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    // 过滤错误资产（可选）
    if (!showErrorAssets && asset.error) {
      return false;
    }
    
    // Filter by type
    if (filterBy !== 'all' && asset.type !== filterBy) {
      return false;
    }
    
    // Filter zero balances
    if (!showZeroBalances && parseFloat(asset.formatted) === 0) {
      return false;
    }
    
    return true;
  });

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.usdValue - a.usdValue;
      case 'balance':
        return parseFloat(b.formatted) - parseFloat(a.formatted);
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      case 'change':
        return b.priceChange24h - a.priceChange24h;
      default:
        return 0;
    }
  });

  // Error state
  if (error) {
    return (
      <ErrorState
        title="加载资产失败"
        message={error.message || '无法加载资产信息，请稍后重试'}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showControls && <AssetListControls disabled />}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <AssetLoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (showEmptyState && sortedAssets.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Squares2X2Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无资产</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          {filterBy === 'all' 
            ? '当前钱包中没有发现任何资产' 
            : `没有找到 ${filterBy === 'native' ? '原生代币' : 'ERC20代币'} 资产`
          }
        </p>
        {filterBy !== 'all' && (
          <button
            onClick={() => setFilterBy('all')}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            查看所有资产
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showControls && (
        <AssetListControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          showZeroBalances={showZeroBalances}
          onShowZeroBalancesChange={setShowZeroBalances}
          showErrorAssets={showErrorAssets}
          onShowErrorAssetsChange={setShowErrorAssets}
          errorAssetCount={errorAssetCount}
          totalCount={assets.length}
          filteredCount={sortedAssets.length}
        />
      )}

      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-3'
      }>
        {sortedAssets.map((asset, index) => {
          const key = `${asset.chainId}-${asset.address || asset.symbol}`;
          
          if (viewMode === 'list') {
            return (
              <CompactAssetCard
                key={key}
                asset={asset}
                onClick={() => onAssetClick?.(asset)}
              />
            );
          }

          return (
            <AssetCard
              key={key}
              asset={asset}
              onClick={() => onAssetClick?.(asset)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface AssetListControlsProps {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  sortBy?: SortBy;
  onSortChange?: (sort: SortBy) => void;
  filterBy?: FilterBy;
  onFilterChange?: (filter: FilterBy) => void;
  showZeroBalances?: boolean;
  onShowZeroBalancesChange?: (show: boolean) => void;
  showErrorAssets?: boolean;
  onShowErrorAssetsChange?: (show: boolean) => void;
  errorAssetCount?: number;
  totalCount?: number;
  filteredCount?: number;
  disabled?: boolean;
}

function AssetListControls({
  viewMode = 'grid',
  onViewModeChange,
  sortBy = 'value',
  onSortChange,
  filterBy = 'all',
  onFilterChange,
  showZeroBalances = false,
  onShowZeroBalancesChange,
  showErrorAssets = true,
  onShowErrorAssetsChange,
  errorAssetCount = 0,
  totalCount = 0,
  filteredCount = 0,
  disabled = false
}: AssetListControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border">
          <button
            onClick={() => onViewModeChange?.('grid')}
            disabled={disabled}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange?.('list')}
            disabled={disabled}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Bars3Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange?.(e.target.value as SortBy)}
          disabled={disabled}
          className={`text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="value">按价值排序</option>
          <option value="balance">按余额排序</option>
          <option value="symbol">按名称排序</option>
          <option value="change">按涨跌排序</option>
        </select>

        {/* Filter Dropdown */}
        <select
          value={filterBy}
          onChange={(e) => onFilterChange?.(e.target.value as FilterBy)}
          disabled={disabled}
          className={`text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="all">所有资产</option>
          <option value="native">原生代币</option>
          <option value="erc20">ERC20代币</option>
        </select>
      </div>

      <div className="flex items-center space-x-4">
        {/* Zero Balance Toggle */}
        <label className="flex items-center space-x-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showZeroBalances}
            onChange={(e) => onShowZeroBalancesChange?.(e.target.checked)}
            disabled={disabled}
            className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <span>显示零余额</span>
        </label>

        {/* Error Assets Toggle */}
        <label className="flex items-center space-x-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showErrorAssets}
            onChange={(e) => onShowErrorAssetsChange?.(e.target.checked)}
            disabled={disabled}
            className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <span>显示异常资产 {errorAssetCount > 0 && `(${errorAssetCount})`}</span>
        </label>

        {/* Count Display */}
        <div className="text-sm text-gray-500">
          显示 {filteredCount} / {totalCount} 项资产
        </div>
      </div>
    </div>
  );
}