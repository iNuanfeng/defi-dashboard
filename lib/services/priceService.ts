/**
 * Price service for fetching cryptocurrency prices from CoinGecko API
 * Supports caching to reduce API calls and improve performance
 */

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  last_updated: string;
}

export interface PriceData {
  [tokenId: string]: TokenPrice;
}

// CoinGecko token IDs mapping
export const TOKEN_IDS = {
  ethereum: 'ethereum',
  polygon: 'matic-network',
} as const;

class PriceService {
  private cache: Map<string, { data: PriceData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  /**
   * Get current prices for specified tokens
   */
  async getPrices(tokenIds: string[]): Promise<PriceData> {
    const cacheKey = tokenIds.sort().join(',');
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const ids = tokenIds.join(',');
      const response = await fetch(
        `${this.BASE_URL}/coins/markets?ids=${ids}&vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TokenPrice[] = await response.json();
      
      // Convert array to object with id as key
      const priceData: PriceData = {};
      data.forEach(token => {
        priceData[token.id] = token;
      });

      // Cache the result
      this.cache.set(cacheKey, {
        data: priceData,
        timestamp: Date.now(),
      });

      return priceData;
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
    return prices[tokenId] || null;
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
}

// Export singleton instance
export const priceService = new PriceService();