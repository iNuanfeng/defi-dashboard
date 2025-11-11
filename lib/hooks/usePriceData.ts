/**
 * Price data hooks using React Query for caching and state management
 * Contains all price-related API calls and data structures
 */

import { useQuery } from '@tanstack/react-query';

// Types
export interface TokenPrice {
  current_price: number;
  price_change_percentage_24h: number;
}

export interface PriceData {
  [tokenId: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

// CoinGecko token IDs mapping
export const TOKEN_IDS = {
  ethereum: 'ethereum',
  polygon: 'matic-network',
  // ERC20 代币
  tether: 'tether',
  'usd-coin': 'usd-coin', 
  dai: 'dai',
  weth: 'weth',
  'wrapped-bitcoin': 'wrapped-bitcoin',
} as const;

// API configuration
const BASE_URL = 'https://api.coingecko.com/api/v3';
const HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'DeFi-Dashboard/1.0',
};

// Query keys for React Query
export const PRICE_QUERY_KEYS = {
  prices: (tokenIds: string[]) => ['prices', tokenIds.sort().join(',')],
  allPrices: () => ['prices', 'all'],
  tokenPrice: (tokenId: string) => ['price', tokenId],
  nativePrices: () => ['prices', 'native'],
} as const;

/**
 * Fetch prices from CoinGecko API
 */
const fetchPrices = async (tokenIds: string[]): Promise<PriceData> => {
  const ids = tokenIds.join(',');
  const response = await fetch(
    `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { headers: HEADERS }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Hook to get prices for multiple tokens
 */
export const usePrices = (tokenIds: string[]) => {
  return useQuery({
    queryKey: PRICE_QUERY_KEYS.prices(tokenIds),
    queryFn: () => fetchPrices(tokenIds),
    staleTime: 60 * 1000, // 1 minute - consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    enabled: tokenIds.length > 0,
    refetchInterval: 60 * 1000, // Refetch every minute in background
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for API errors
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes('4')) return false; // Don't retry 4xx errors
      return true;
    },
  });
};

/**
 * Hook to get all supported token prices
 */
export const useAllTokenPrices = () => {
  const allTokenIds = Object.values(TOKEN_IDS);
  
  return useQuery({
    queryKey: PRICE_QUERY_KEYS.allPrices(),
    queryFn: () => fetchPrices(allTokenIds),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes('4')) return false;
      return true;
    },
  });
};

/**
 * Hook to get price for a single token
 */
export const useTokenPrice = (tokenId: string) => {
  return useQuery({
    queryKey: PRICE_QUERY_KEYS.tokenPrice(tokenId),
    queryFn: async (): Promise<TokenPrice | null> => {
      const data = await fetchPrices([tokenId]);
      const tokenData = data[tokenId];
      
      if (!tokenData) {
        return null;
      }

      return {
        current_price: tokenData.usd,
        price_change_percentage_24h: tokenData.usd_24h_change || 0,
      };
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!tokenId,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes('4')) return false;
      return true;
    },
  });
};

/**
 * Hook to get prices for native tokens (ETH and MATIC)
 */
export const useNativePrices = () => {
  return useQuery({
    queryKey: PRICE_QUERY_KEYS.nativePrices(),
    queryFn: () => fetchPrices([TOKEN_IDS.ethereum, TOKEN_IDS.polygon]),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes('4')) return false;
      return true;
    },
  });
};

/**
 * Hook to get price for a token by CoinGecko ID with transformed data
 */
export const useTokenPriceById = (tokenId: string) => {
  const { data: allPrices, ...query } = useAllTokenPrices();
  
  const tokenPrice: TokenPrice | null = allPrices && allPrices[tokenId] 
    ? {
        current_price: allPrices[tokenId].usd,
        price_change_percentage_24h: allPrices[tokenId].usd_24h_change || 0,
      }
    : null;

  return {
    ...query,
    data: tokenPrice,
  };
};