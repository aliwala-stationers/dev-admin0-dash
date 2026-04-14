// @/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type CurrencyOptions = {
  showDecimals?: boolean
  compact?: boolean
}

type NumericValue = number | string

/**
 * Money formatter utilities for consistent currency formatting across the app
 * Uses Indian Rupee (INR) with en-IN locale
 * All calculations use integer math (cents) to avoid floating point precision issues
 */

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const CURRENCY_FORMATTER_NO_DECIMALS = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const NUMBER_FORMATTER = new Intl.NumberFormat("en-IN")

const COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  compactDisplay: "short",
})

/**
 * Safely parse a value to number
 * @param value - Value to parse (number or string)
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default
 */
function toNumber(value: NumericValue, defaultValue: number = 0): number {
  if (typeof value === "number") return value
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Convert rupees to cents (integer) to avoid floating point issues
 * @param amount - Amount in rupees
 * @returns Amount in cents (integer)
 */
function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert cents to rupees
 * @param cents - Amount in cents
 * @returns Amount in rupees
 */
function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Format a number as Indian Rupee currency
 * @param amount - The amount to format (number or string)
 * @param options - Formatting options
 * @param options.showDecimals - If false, removes decimal places (default: true)
 * @param options.compact - If true, uses compact notation (e.g., "₹1.2K")
 * @returns Formatted currency string (e.g., "₹1,234.56")
 * @example
 * ```ts
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1234, { showDecimals: false }) // "₹1,234"
 * formatCurrency(1500000, { compact: true }) // "₹1.5M"
 * ```
 */
export function formatCurrency(
  amount: NumericValue,
  options: CurrencyOptions = {},
): string {
  const num = toNumber(amount, 0)

  if (options.compact) {
    return COMPACT_CURRENCY_FORMATTER.format(num)
  }

  return options.showDecimals === false
    ? CURRENCY_FORMATTER_NO_DECIMALS.format(num)
    : CURRENCY_FORMATTER.format(num)
}

/**
 * Format a number as currency with explicit sign (+/-)
 * Useful for showing differences, profits, losses
 * @param amount - The amount to format
 * @param options - Formatting options
 * @param options.showDecimals - If false, removes decimal places (default: true)
 * @param options.compact - If true, uses compact notation
 * @returns Formatted currency string with sign (e.g., "+₹1,234.56" or "-₹1,234.56")
 * @example
 * ```ts
 * formatCurrencyWithSign(100) // "+₹100.00"
 * formatCurrencyWithSign(-50) // "-₹50.00"
 * formatCurrencyWithSign(1000, { compact: true }) // "+₹1K"
 * ```
 */
export function formatCurrencyWithSign(
  amount: NumericValue,
  options: CurrencyOptions = {},
): string {
  const num = toNumber(amount, 0)
  const sign = num >= 0 ? "+" : "-"
  const formatted = formatCurrency(Math.abs(num), options)
  return `${sign}${formatted}`
}

/**
 * Format a number using Indian locale (no currency symbol)
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 * @example
 * ```ts
 * formatNumber(1234.56) // "1,234.56"
 * formatNumber("10000") // "10,000"
 * ```
 */
export function formatNumber(amount: NumericValue): string {
  const num = toNumber(amount, 0)
  return NUMBER_FORMATTER.format(num)
}

/**
 * Format a value as percentage
 * @param value - The percentage value (0-100 or 0-1)
 * @param asDecimal - If true, treats input as decimal (0.18 = 18%)
 * @returns Formatted percentage string (e.g., "18.00%")
 * @example
 * ```ts
 * formatPercentage(18) // "18.00%"
 * formatPercentage(0.18, true) // "18.00%"
 * ```
 */
export function formatPercentage(
  value: NumericValue,
  asDecimal: boolean = false,
): string {
  const num = toNumber(value, 0)
  const percentage = asDecimal ? num * 100 : num
  return `${percentage.toFixed(2)}%`
}

/**
 * Format the difference between two values with sign
 * Uses integer math to avoid floating point precision issues
 * Commonly used for price comparisons, profit/loss calculations
 * @param value1 - First value
 * @param value2 - Second value
 * @param options - Formatting options
 * @returns Formatted difference string (e.g., "+₹100.00" or "-₹50.00")
 * @example
 * ```ts
 * formatDifference(100, 50) // "+₹50.00"
 * formatDifference(50, 100) // "-₹50.00"
 * formatDifference(1000, 800, { showDecimals: false }) // "+₹200"
 * ```
 */
export function formatDifference(
  value1: NumericValue,
  value2: NumericValue,
  options: CurrencyOptions = {},
): string {
  const num1 = toNumber(value1, 0)
  const num2 = toNumber(value2, 0)

  const diffCents = toCents(num1) - toCents(num2)
  const diff = fromCents(diffCents)

  return formatCurrencyWithSign(diff, options)
}

/**
 * Format discount percentage
 * Uses integer math to avoid floating point precision issues
 * Returns 0% if discounted price is higher than original (price increase)
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted discount percentage (e.g., "20.0%")
 * @example
 * ```ts
 * formatDiscount(100, 80) // "20.0%"
 * formatDiscount(100, 120) // "0%" (no negative discount)
 * formatDiscount(0, 50) // "0%" (handles zero original)
 * ```
 */
export function formatDiscount(
  originalPrice: NumericValue,
  discountedPrice: NumericValue,
): string {
  const original = toNumber(originalPrice, 0)
  const discounted = toNumber(discountedPrice, 0)

  if (original === 0) return "0%"

  const originalCents = toCents(original)
  const discountedCents = toCents(discounted)

  const discountCents = originalCents - discountedCents
  const discount = Math.max(0, (discountCents / originalCents) * 100)

  return `${discount.toFixed(1)}%`
}

/**
 * Format profit margin percentage
 * Uses integer math to avoid floating point precision issues
 * Margin = ((Selling Price - Cost Price) / Cost Price) * 100
 * @param costPrice - Cost price of the product
 * @param sellingPrice - Selling price of the product
 * @returns Formatted margin percentage (e.g., "25.00%")
 * @example
 * ```ts
 * formatProfitMargin(100, 125) // "25.00%"
 * formatProfitMargin(100, 80) // "-20.00%" (loss)
 * formatProfitMargin(0, 50) // "0%" (handles zero cost)
 * ```
 */
export function formatProfitMargin(
  costPrice: NumericValue,
  sellingPrice: NumericValue,
): string {
  const cost = toNumber(costPrice, 0)
  const selling = toNumber(sellingPrice, 0)

  if (cost === 0) return "0%"

  const costCents = toCents(cost)
  const sellingCents = toCents(selling)

  const profitCents = sellingCents - costCents
  const margin = (profitCents / costCents) * 100

  return `${margin.toFixed(2)}%`
}

/**
 * Format markup percentage
 * Uses integer math to avoid floating point precision issues
 * Markup = ((Selling Price - Cost Price) / Cost Price) * 100
 * @param costPrice - Cost price of the product
 * @param sellingPrice - Selling price of the product
 * @returns Formatted markup percentage (e.g., "25.00%")
 * @example
 * ```ts
 * formatMarkup(100, 125) // "25.00%"
 * formatMarkup(100, 80) // "-20.00%" (negative markup)
 * formatMarkup(0, 50) // "0%" (handles zero cost)
 * ```
 */
export function formatMarkup(
  costPrice: NumericValue,
  sellingPrice: NumericValue,
): string {
  const cost = toNumber(costPrice, 0)
  const selling = toNumber(sellingPrice, 0)

  if (cost === 0) return "0%"

  const costCents = toCents(cost)
  const sellingCents = toCents(selling)

  const profitCents = sellingCents - costCents
  const markup = (profitCents / costCents) * 100

  return `${markup.toFixed(2)}%`
}
