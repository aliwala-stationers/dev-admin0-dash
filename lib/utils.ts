// @/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind and conditional class names.
 * Combines `clsx` for conditional logic and `tailwind-merge` to resolve conflicting Tailwind classes.
 * @example
 * ```ts
 * cn("p-2", isActive && "bg-blue-500") // "p-2 bg-blue-500"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Locale and currency configuration for Indian Rupees.
 * Centralized constants to avoid hardcoding locale and currency codes.
 */
const LOCALE = "en-IN"
const CURRENCY = "INR"

/**
 * Dynamically derived currency symbol (₹).
 * Prevents hardcoding and ensures correct symbol for locale.
 * @example
 * ```ts
 * console.log(CURRENCY_SYMBOL) // "₹"
 * ```
 */
export const CURRENCY_SYMBOL = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
  .format(0)
  .replace(/[0-9.,]/g, "")
  .trim()

type CurrencyOptions = {
  /** Whether to show decimal places. Default: `true`. */
  showDecimals?: boolean
  /** Whether to use compact notation (e.g., ₹1.2K). Default: `false`. */
  compact?: boolean
}

type NumericValue = number | string

/**
 * Pre-initialized currency and number formatters for reuse.
 * Prevents costly re-instantiation of `Intl.NumberFormat`.
 */
const FORMATTERS = {
  currency: new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  currencyNoDec: new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  compact: new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    notation: "compact",
    compactDisplay: "short",
  }),
  number: new Intl.NumberFormat(LOCALE),
}

/**
 * Safely parse a value to a number.
 * @param value - Input number or numeric string.
 * @param defaultValue - Returned if parsing fails. Default: `0`.
 * @returns Parsed numeric value.
 * @example
 * ```ts
 * toNumber("12.5") // 12.5
 * toNumber("abc", 10) // 10
 * ```
 */
function toNumber(value: NumericValue, defaultValue = 0): number {
  if (typeof value === "number") return value
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Convert rupees to integer cents for precise calculations.
 * @param amount - Amount in rupees.
 * @returns Equivalent integer in cents.
 */
function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert integer cents back to rupees.
 * @param cents - Amount in cents.
 * @returns Equivalent value in rupees.
 */
function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Format a numeric value as Indian Rupee currency.
 * @param amount - The amount to format.
 * @param options - Optional formatting options.
 * @returns Formatted currency string.
 * @example
 * ```ts
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1000, { compact: true }) // "₹1K"
 * formatCurrency(500, { showDecimals: false }) // "₹500"
 * ```
 */
export function formatCurrency(
  amount: NumericValue,
  options: CurrencyOptions = {},
): string {
  const num = toNumber(amount)
  if (options.compact) return FORMATTERS.compact.format(num)
  return options.showDecimals === false
    ? FORMATTERS.currencyNoDec.format(num)
    : FORMATTERS.currency.format(num)
}

/**
 * Format a numeric value as currency with an explicit sign (+ or -).
 * Useful for visualizing profit/loss or deltas.
 * @param amount - The amount to format.
 * @param options - Formatting options.
 * @returns Signed currency string.
 * @example
 * ```ts
 * formatCurrencyWithSign(100) // "+₹100.00"
 * formatCurrencyWithSign(-75) // "-₹75.00"
 * ```
 */
export function formatCurrencyWithSign(
  amount: NumericValue,
  options: CurrencyOptions = {},
): string {
  const num = toNumber(amount)
  if (num === 0) return formatCurrency(0, options)
  const formatted = formatCurrency(Math.abs(num), options)
  return num > 0 ? `+${formatted}` : `-${formatted}`
}

/**
 * Format a numeric value using Indian locale (no currency symbol).
 * @param amount - Number or numeric string.
 * @returns Formatted number string.
 * @example
 * ```ts
 * formatNumber(1234567.89) // "12,34,567.89"
 * ```
 */
export function formatNumber(amount: NumericValue): string {
  return FORMATTERS.number.format(toNumber(amount))
}

/**
 * Format a numeric value as a percentage string.
 * @param value - The value to convert.
 * @param asDecimal - Whether to interpret value as decimal (e.g., `0.25` → `25%`). Default: `false`.
 * @returns Formatted percentage string.
 * @example
 * ```ts
 * formatPercentage(25) // "25.00%"
 * formatPercentage(0.25, true) // "25.00%"
 * ```
 */
export function formatPercentage(
  value: NumericValue,
  asDecimal = false,
): string {
  const num = toNumber(value)
  const percentage = asDecimal ? num * 100 : num
  return `${percentage.toFixed(2)}%`
}

/**
 * Calculate and format the difference between two values with a sign.
 * Uses integer math for accurate precision.
 * @param value1 - First numeric value.
 * @param value2 - Second numeric value.
 * @param options - Currency formatting options.
 * @returns Formatted difference (e.g., "+₹50.00" or "-₹10.00").
 * @example
 * ```ts
 * formatDifference(120, 100) // "+₹20.00"
 * formatDifference(80, 100) // "-₹20.00"
 * ```
 */
export function formatDifference(
  value1: NumericValue,
  value2: NumericValue,
  options: CurrencyOptions = {},
): string {
  const diffCents = toCents(toNumber(value1)) - toCents(toNumber(value2))
  return formatCurrencyWithSign(fromCents(diffCents), options)
}

/**
 * Calculate discount percentage between original and discounted prices.
 * Returns 0% if discounted price is higher than original.
 * @param originalPrice - Original price before discount.
 * @param discountedPrice - Discounted price after applying discount.
 * @returns Discount percentage string.
 * @example
 * ```ts
 * formatDiscount(100, 80) // "20.0%"
 * formatDiscount(100, 120) // "0%"
 * formatDiscount(0, 50) // "0%"
 * ```
 */
export function formatDiscount(
  originalPrice: NumericValue,
  discountedPrice: NumericValue,
): string {
  const original = toNumber(originalPrice)
  const discounted = toNumber(discountedPrice)
  if (original <= 0) return "0%"
  const discount = (toCents(original) - toCents(discounted)) / toCents(original)
  return `${Math.max(0, discount * 100).toFixed(1)}%`
}

/**
 * Format profit margin percentage.
 * Formula: `(Selling Price - Cost Price) / Selling Price * 100`
 * @param costPrice - The cost price.
 * @param sellingPrice - The selling price.
 * @returns Formatted profit margin percentage (may be negative for losses).
 * @example
 * ```ts
 * formatProfitMargin(100, 125) // "20.00%"
 * formatProfitMargin(100, 80) // "-25.00%"
 * ```
 */
export function formatProfitMargin(
  costPrice: NumericValue,
  sellingPrice: NumericValue,
): string {
  const cost = toNumber(costPrice)
  const selling = toNumber(sellingPrice)
  if (selling === 0) return "0%"
  const profit = toCents(selling) - toCents(cost)
  return `${((profit / toCents(selling)) * 100).toFixed(2)}%`
}

/**
 * Format markup percentage.
 * Formula: `(Selling Price - Cost Price) / Cost Price * 100`
 * @param costPrice - The cost price.
 * @param sellingPrice - The selling price.
 * @returns Formatted markup percentage (may be negative for loss situations).
 * @example
 * ```ts
 * formatMarkup(100, 125) // "25.00%"
 * formatMarkup(100, 80) // "-20.00%"
 * ```
 */
export function formatMarkup(
  costPrice: NumericValue,
  sellingPrice: NumericValue,
): string {
  const cost = toNumber(costPrice)
  const selling = toNumber(sellingPrice)
  if (cost === 0) return "0%"
  const profit = toCents(selling) - toCents(cost)
  return `${((profit / toCents(cost)) * 100).toFixed(2)}%`
}
