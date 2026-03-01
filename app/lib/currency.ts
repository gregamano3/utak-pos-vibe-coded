export const CURRENCY_SYMBOL = "₱";

export function formatCurrency(value: number): string {
  return `${CURRENCY_SYMBOL}${value.toFixed(2)}`;
}
