import { Address } from 'viem';

export interface TokenConfig {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  coingeckoId: string;
  logoUrl?: string;
}

// Ethereum Mainnet Tokens (使用正确的合约地址)
export const ETHEREUM_TOKENS: TokenConfig[] = [
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT - 官方合约地址
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chainId: 1,
    coingeckoId: 'tether',
  },
  {
    address: '0xA0b86a33E6441b4b5DD9a5DF129D8d7C4e7A5a5e', // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 1,
    coingeckoId: 'usd-coin',
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    chainId: 1,
    coingeckoId: 'dai',
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    chainId: 1,
    coingeckoId: 'weth',
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chainId: 1,
    coingeckoId: 'wrapped-bitcoin',
  },
];

// Polygon Tokens
export const POLYGON_TOKENS: TokenConfig[] = [
  {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chainId: 137,
    coingeckoId: 'tether',
  },
  {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 137,
    coingeckoId: 'usd-coin',
  },
  {
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    chainId: 137,
    coingeckoId: 'dai',
  },
  {
    address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    chainId: 137,
    coingeckoId: 'weth',
  },
];

// 合并所有代币配置
export const ALL_TOKENS: Record<number, TokenConfig[]> = {
  1: ETHEREUM_TOKENS,
  137: POLYGON_TOKENS,
};

// 根据链ID和符号获取代币配置
export const getTokenConfig = (chainId: number, symbol: string): TokenConfig | undefined => {
  return ALL_TOKENS[chainId]?.find(token => token.symbol === symbol);
};

// 根据链ID获取所有代币配置
export const getTokensByChain = (chainId: number): TokenConfig[] => {
  return ALL_TOKENS[chainId] || [];
};

// 获取所有支持的代币的CoinGecko ID列表
export const getAllCoingeckoIds = (): string[] => {
  const allTokens = Object.values(ALL_TOKENS).flat();
  const uniqueIds = [...new Set(allTokens.map(token => token.coingeckoId))];
  return uniqueIds;
};
