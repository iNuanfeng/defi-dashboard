import { useState, useEffect, useMemo } from 'react';
import { useNativeBalances } from './useNativeBalances';
import { priceService, PriceData, TOKEN_IDS } from '@/lib/services/priceService';

export interface AssetBalance {
  chainId: number;
  chainName: string;
  symbol: string;
  balance: string;
  formatted: string;
  decimals: number;
  price: number;
  priceChange24h: number;
  usdValue: number;
  isLoading: boolean;
  error?: Error | null;
}

export interface AssetSummary {
  totalUSDValue: number;
  totalChange24h: number;
  activeChains: number;
  activeAssets: number;
}

/**
 * Hook for aggregating native token balances with price data
 * Combines balance queries with real-time price information
 */
export const useAssetBalances = () => {
  const { balances: nativeBalances, isLoading: balancesLoading, refetch: refetchBalances } = useNativeBalances();
  const [prices, setPrices] = useState<PriceData>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError, setPricesError] = useState<Error | null>(null);

  // Fetch prices for native tokens
  useEffect(() => {
    const fetchPrices = async () => {
      setPricesLoading(true);
      setPricesError(null);
      
      try {
        const priceData = await priceService.getNativePrices();
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

  // Combine balance and price data
  const assetBalances = useMemo((): AssetBalance[] => {
    return nativeBalances.map(balance => {
      let tokenId: string;
      let price = 0;
      let priceChange24h = 0;

      // Map chain to CoinGecko token ID
      switch (balance.chainId) {
        case 1: // Ethereum
          tokenId = TOKEN_IDS.ethereum;
          break;
        case 137: // Polygon
          tokenId = TOKEN_IDS.polygon;
          break;
        default:
          tokenId = '';
      }

      // Get price data if available
      if (tokenId && prices[tokenId]) {
        price = prices[tokenId].current_price;
        priceChange24h = prices[tokenId].price_change_percentage_24h || 0;
      }

      // Calculate USD value
      const usdValue = priceService.calculateUSDValue(balance.formatted, price);

      return {
        ...balance,
        price,
        priceChange24h,
        usdValue,
        isLoading: balance.isLoading || pricesLoading,
      };
    });
  }, [nativeBalances, prices, pricesLoading]);

  // Calculate summary statistics
  const summary = useMemo((): AssetSummary => {
    const activeAssets = assetBalances.filter(asset => 
      parseFloat(asset.formatted) > 0
    );

    const totalUSDValue = assetBalances.reduce(
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

    return {
      totalUSDValue,
      totalChange24h,
      activeChains,
      activeAssets: activeAssets.length,
    };
  }, [assetBalances]);

  const isLoading = balancesLoading || pricesLoading;
  const hasError = !!pricesError || assetBalances.some(asset => !!asset.error);

  return {
    assetBalances,
    summary,
    isLoading,
    hasError,
    pricesError,
    refetch: () => {
      refetchBalances();
      // Force price refetch by clearing cache
      priceService.clearCache();
    },
    // Utility functions for formatting
    formatUSDValue: priceService.formatUSDValue,
    formatPriceChange: priceService.formatPriceChange,
  };
};