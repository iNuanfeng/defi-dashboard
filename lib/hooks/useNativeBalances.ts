import { useAccount, useBalance } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { useMemo } from 'react';

export interface NativeBalance {
  chainId: number;
  chainName: string;
  symbol: string;
  balance: string;
  formatted: string;
  decimals: number;
  isLoading: boolean;
  error?: Error | null;
}

/**
 * Hook for querying native token balances across multiple chains
 * Supports ETH (Ethereum) and MATIC (Polygon)
 */
export const useNativeBalances = () => {
  const { address, isConnected } = useAccount();

  // ETH balance query
  const ethBalance = useBalance({
    address,
    chainId: mainnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // MATIC balance query
  const maticBalance = useBalance({
    address,
    chainId: polygon.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const balances = useMemo((): NativeBalance[] => {
    const results: NativeBalance[] = [];

    // ETH Balance
    results.push({
      chainId: mainnet.id,
      chainName: 'Ethereum',
      symbol: 'ETH',
      balance: ethBalance.data?.value.toString() || '0',
      formatted: ethBalance.data?.formatted || '0',
      decimals: ethBalance.data?.decimals || 18,
      isLoading: ethBalance.isLoading,
      error: ethBalance.error,
    });

    // MATIC Balance
    results.push({
      chainId: polygon.id,
      chainName: 'Polygon',
      symbol: 'MATIC',
      balance: maticBalance.data?.value.toString() || '0',
      formatted: maticBalance.data?.formatted || '0',
      decimals: maticBalance.data?.decimals || 18,
      isLoading: maticBalance.isLoading,
      error: maticBalance.error,
    });

    return results;
  }, [ethBalance, maticBalance]);

  const isLoading = ethBalance.isLoading || maticBalance.isLoading;
  const hasError = !!ethBalance.error || !!maticBalance.error;
  
  // Calculate total count of non-zero balances
  const activeBalances = balances.filter(balance => 
    parseFloat(balance.formatted) > 0
  ).length;

  return {
    balances,
    isLoading,
    hasError,
    activeBalances,
    refetch: () => {
      ethBalance.refetch();
      maticBalance.refetch();
    },
  };
};