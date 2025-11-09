/**
 * Price service for fetching cryptocurrency prices from CoinGecko API
 * Supports caching to reduce API calls and improve performance
 */

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

class PriceService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTimeout = 60000; // 1 minute cache
  private readonly baseURL = 'https://api.coingecko.com/api/v3';
  private readonly headers = {
    'Accept': 'application/json',
    'User-Agent': 'DeFi-Dashboard/1.0',
  };

  /**
   * Get current prices for specified tokens
   */
  async getPrices(tokenIds: string[]): Promise<PriceData> {
    const cacheKey = tokenIds.sort().join(',');
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const ids = tokenIds.join(',');
      const response = await fetch(
        `${this.baseURL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Error fetching prices:', error);
      
      // Return cached data even if expired, or empty object as fallback
      if (cached) {
        return cached.data;
      }
      
      return {};
    }
  }

  /**
   * Get price for a single token
   */
  async getTokenPrice(tokenId: string): Promise<TokenPrice | null> {
    const prices = await this.getPrices([tokenId]);
    const tokenData = prices[tokenId];
    
    if (!tokenData) {
      return null;
    }

    return {
      current_price: tokenData.usd,
      price_change_percentage_24h: tokenData.usd_24h_change || 0,
    };
  }

  /**
   * Get prices for native tokens (ETH and MATIC)
   */
  async getNativePrices(): Promise<PriceData> {
    return this.getPrices([TOKEN_IDS.ethereum, TOKEN_IDS.polygon]);
  }

  /**
   * Calculate USD value for a token balance
   */
  calculateUSDValue(balance: string, price: number): number {
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum) || isNaN(price)) {
      return 0;
    }
    return balanceNum * price;
  }

  /**
   * Format USD value for display
   */
  formatUSDValue(value: number): string {
    if (value < 0.01 && value > 0) {
      return '<$0.01';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Format price change percentage
   */
  formatPriceChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取所有支持的代币价格（包括原生代币和ERC20代币）
   */
  async getAllTokenPrices(): Promise<PriceData> {
    const cacheKey = 'all-token-prices';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // 获取所有代币ID
      const allTokenIds = Object.values(TOKEN_IDS);
      const tokenIds = allTokenIds.join(',');
      
      const response = await fetch(
        `${this.baseURL}/simple/price?ids=${tokenIds}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      // 缓存数据
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Error fetching all token prices:', error);
      
      // 返回缓存的数据(如果有)
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached.data;
      }
      
      throw error;
    }
  }

  /**
   * 根据CoinGecko ID获取特定代币的价格
   */
  async getTokenPriceById(tokenId: string): Promise<TokenPrice | null> {
    try {
      const allPrices = await this.getAllTokenPrices();
      const tokenPrice = allPrices[tokenId];
      
      if (!tokenPrice) {
        return null;
      }

      return {
        current_price: tokenPrice.usd,
        price_change_percentage_24h: tokenPrice.usd_24h_change || 0,
      };
    } catch (error) {
      console.error(`Error fetching price for token ${tokenId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const priceService = new PriceService();