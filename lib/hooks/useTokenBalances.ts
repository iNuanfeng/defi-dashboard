import { useAccount, useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import { getTokensByChain } from '@/config/tokens';
import { mainnet, polygon } from 'wagmi/chains';
import type { Address } from 'viem';

export interface TokenBalance {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  chainName: string;
  balance: string;
  formatted: string;
  coingeckoId: string;
  isLoading: boolean;
  error?: Error | null;
}

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Hook for querying ERC20 token balances across multiple chains
 * Supports major tokens on Ethereum and Polygon
 */
export const useTokenBalances = () => {
  const { address, isConnected } = useAccount();

  // Get token configurations for each chain
  const ethereumTokens = getTokensByChain(mainnet.id);
  const polygonTokens = getTokensByChain(polygon.id);

  // Prepare contract read calls for Ethereum tokens
  const ethereumContracts = useMemo(() => {
    if (!address || !isConnected) return [];
    
    return ethereumTokens.map(token => ({
      address: token.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf' as const,
      args: [address],
      chainId: mainnet.id,
    }));
  }, [address, isConnected, ethereumTokens]);

  // Prepare contract read calls for Polygon tokens
  const polygonContracts = useMemo(() => {
    if (!address || !isConnected) return [];
    
    return polygonTokens.map(token => ({
      address: token.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf' as const,
      args: [address],
      chainId: polygon.id,
    }));
  }, [address, isConnected, polygonTokens]);

  // Query Ethereum token balances
  const ethereumResults = useReadContracts({
    contracts: ethereumContracts,
    query: {
      enabled: !!address && isConnected && ethereumContracts.length > 0,
    },
  });

  // Query Polygon token balances
  const polygonResults = useReadContracts({
    contracts: polygonContracts,
    query: {
      enabled: !!address && isConnected && polygonContracts.length > 0,
    },
  });

  // Process and format token balances
  const tokenBalances = useMemo((): TokenBalance[] => {
    const results: TokenBalance[] = [];

    // Process Ethereum tokens
    if (ethereumResults.data) {
      ethereumResults.data.forEach((result, index) => {
        const token = ethereumTokens[index];
        const balance = result.result as bigint || 0n;
        const formatted = formatTokenBalance(balance, token.decimals);

        results.push({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          chainId: token.chainId,
          chainName: 'Ethereum',
          balance: balance.toString(),
          formatted,
          coingeckoId: token.coingeckoId,
          isLoading: ethereumResults.isLoading,
          error: result.error,
        });
      });
    }

    // Process Polygon tokens
    if (polygonResults.data) {
      polygonResults.data.forEach((result, index) => {
        const token = polygonTokens[index];
        const balance = result.result as bigint || 0n;
        const formatted = formatTokenBalance(balance, token.decimals);

        results.push({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          chainId: token.chainId,
          chainName: 'Polygon',
          balance: balance.toString(),
          formatted,
          coingeckoId: token.coingeckoId,
          isLoading: polygonResults.isLoading,
          error: result.error,
        });
      });
    }

    return results;
  }, [ethereumResults, polygonResults, ethereumTokens, polygonTokens]);

  const isLoading = ethereumResults.isLoading || polygonResults.isLoading;
  const hasError = !!ethereumResults.error || !!polygonResults.error;

  // Calculate active token count (tokens with non-zero balance)
  const activeTokens = tokenBalances.filter(token => 
    parseFloat(token.formatted) > 0
  ).length;

  return {
    tokenBalances,
    isLoading,
    hasError,
    activeTokens,
    refetch: () => {
      ethereumResults.refetch();
      polygonResults.refetch();
    },
  };
};

/**
 * Format token balance from wei to human readable format
 */
function formatTokenBalance(balance: bigint, decimals: number): string {
  if (balance === 0n) return '0';
  
  const divisor = BigInt(10 ** decimals);
  const quotient = balance / divisor;
  const remainder = balance % divisor;
  
  if (remainder === 0n) {
    return quotient.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmedRemainder = remainderStr.replace(/0+$/, '');
  
  if (trimmedRemainder === '') {
    return quotient.toString();
  }
  
  return `${quotient.toString()}.${trimmedRemainder}`;
}
