import { useState, useEffect, useMemo } from 'react';
import { useNativeBalances } from './useNativeBalances';
import { useTokenBalances } from './useTokenBalances';
import { priceService, PriceData } from '@/lib/services/priceService';

export interface EnhancedAssetBalance {
  type: 'native' | 'erc20';
  chainId: number;
  chainName: string;
  symbol: string;
  name: string;
  address?: string;
  balance: string;
  formatted: string;
  decimals: number;
  price: number;
  priceChange24h: number;
  usdValue: number;
  coingeckoId: string;
  isLoading: boolean;
  error?: Error | null;
}

export interface EnhancedAssetSummary {
  totalUSDValue: number;
  totalChange24h: number;
  activeChains: number;
  totalAssets: number;
  nativeAssets: number;
  erc20Assets: number;
  activeAssets: number;
}

/**
 * Hook for aggregating native and ERC20 token balances with price data
 * Provides comprehensive portfolio overview across multiple chains
 */
export const useEnhancedAssetBalances = () => {
  const { balances: nativeBalances, isLoading: nativeLoading, refetch: refetchNative } = useNativeBalances();
  const { tokenBalances, isLoading: tokenLoading, refetch: refetchTokens } = useTokenBalances();
  const [prices, setPrices] = useState<PriceData>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError, setPricesError] = useState<Error | null>(null);

  // Fetch prices for all tokens
  useEffect(() => {
    const fetchPrices = async () => {
      setPricesLoading(true);
      setPricesError(null);
      
      try {
        const priceData = await priceService.getAllTokenPrices();
        setPrices(priceData);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to fetch prices');
        setPricesError(err);
        console.error('Error fetching prices:', err);
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
    
    // Set up interval for price updates (every 60 seconds)
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Combine all asset balances
  const enhancedBalances = useMemo((): EnhancedAssetBalance[] => {
    const results: EnhancedAssetBalance[] = [];

    // Add native token balances
    nativeBalances.forEach(balance => {
      let coingeckoId: string;
      
      switch (balance.chainId) {
        case 1: // Ethereum
          coingeckoId = 'ethereum';
          break;
        case 137: // Polygon
          coingeckoId = 'matic-network';
          break;
        default:
          coingeckoId = '';
      }

      const priceData = coingeckoId && prices[coingeckoId];
      const price = priceData?.usd || 0;
      const priceChange24h = priceData?.usd_24h_change || 0;
      const usdValue = priceService.calculateUSDValue(balance.formatted, price);

      results.push({
        type: 'native',
        chainId: balance.chainId,
        chainName: balance.chainName,
        symbol: balance.symbol,
        name: `${balance.chainName} Native Token`,
        balance: balance.balance,
        formatted: balance.formatted,
        decimals: balance.decimals,
        price,
        priceChange24h,
        usdValue,
        coingeckoId,
        isLoading: balance.isLoading || pricesLoading,
        error: balance.error,
      });
    });

    // Add ERC20 token balances
    tokenBalances.forEach(token => {
      const priceData = prices[token.coingeckoId];
      const price = priceData?.usd || 0;
      const priceChange24h = priceData?.usd_24h_change || 0;
      const usdValue = priceService.calculateUSDValue(token.formatted, price);

      results.push({
        type: 'erc20',
        chainId: token.chainId,
        chainName: token.chainName,
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        balance: token.balance,
        formatted: token.formatted,
        decimals: token.decimals,
        price,
        priceChange24h,
        usdValue,
        coingeckoId: token.coingeckoId,
        isLoading: token.isLoading || pricesLoading,
        error: token.error,
      });
    });

    return results.sort((a, b) => b.usdValue - a.usdValue); // Sort by USD value
  }, [nativeBalances, tokenBalances, prices, pricesLoading]);

  // Calculate enhanced summary statistics
  const summary = useMemo((): EnhancedAssetSummary => {
    const activeAssets = enhancedBalances.filter(asset => 
      parseFloat(asset.formatted) > 0
    );

    const totalUSDValue = enhancedBalances.reduce(
      (sum, asset) => sum + asset.usdValue, 
      0
    );

    // Calculate weighted average price change
    let totalValue = 0;
    let weightedChange = 0;

    activeAssets.forEach(asset => {
      if (asset.usdValue > 0) {
        totalValue += asset.usdValue;
        weightedChange += asset.priceChange24h * asset.usdValue;
      }
    });

    const totalChange24h = totalValue > 0 ? weightedChange / totalValue : 0;

    const activeChains = new Set(
      activeAssets.map(asset => asset.chainId)
    ).size;

    const nativeAssets = enhancedBalances.filter(asset => asset.type === 'native').length;
    const erc20Assets = enhancedBalances.filter(asset => asset.type === 'erc20').length;

    return {
      totalUSDValue,
      totalChange24h,
      activeChains,
      totalAssets: enhancedBalances.length,
      nativeAssets,
      erc20Assets,
      activeAssets: activeAssets.length,
    };
  }, [enhancedBalances]);

  const isLoading = nativeLoading || tokenLoading || pricesLoading;
  const hasError = !!pricesError || enhancedBalances.some(asset => !!asset.error);

  return {
    enhancedBalances,
    summary,
    isLoading,
    hasError,
    pricesError,
    refetch: () => {
      refetchNative();
      refetchTokens();
      // Force price refetch by clearing cache
      priceService.clearCache();
    },
    // Utility functions for filtering
    getAssetsByChain: (chainId: number) => 
      enhancedBalances.filter(asset => asset.chainId === chainId),
    getNativeAssets: () => 
      enhancedBalances.filter(asset => asset.type === 'native'),
    getERC20Assets: () => 
      enhancedBalances.filter(asset => asset.type === 'erc20'),
    getActiveAssets: () => 
      enhancedBalances.filter(asset => parseFloat(asset.formatted) > 0),
    // Utility functions for formatting
    formatUSDValue: priceService.formatUSDValue,
    formatPriceChange: priceService.formatPriceChange,
  };
};
