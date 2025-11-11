/**
 * Utility functions for formatting prices and values
 */

/**
 * Calculate USD value for a token balance
 */
export function calculateUSDValue(balance: string, price: number): number {
  const balanceNum = parseFloat(balance);
  if (isNaN(balanceNum) || isNaN(price)) {
    return 0;
  }
  return balanceNum * price;
}

/**
 * Format USD value for display
 */
export function formatUSDValue(value: number): string {
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
export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}