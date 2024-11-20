/**
 * Currency formatting utilities for PharmaLink
 */

/**
 * Format a number as RWF currency
 * @param amount - The amount to format
 * @returns Formatted string with RWF currency
 */
export function formatCurrency(amount: number): string {
  return `RWF ${amount.toLocaleString('en-RW')}`;
}

/**
 * Convert minor units to major units (cents to RWF)
 * @param minorUnits - Amount in minor units
 * @returns Amount in major units
 */
export function toMajorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

/**
 * Convert major units to minor units (RWF to cents)
 * @param majorUnits - Amount in major units
 * @returns Amount in minor units
 */
export function toMinorUnits(majorUnits: number): number {
  return Math.round(majorUnits * 100);
}