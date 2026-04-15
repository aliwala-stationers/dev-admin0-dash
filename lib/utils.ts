// @/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind + conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * India-specific currency config (single source of truth)
 */
const LOCALE = "en-IN"
const CURRENCY = "INR"

/**
 * Derived currency symbol (no hardcoding ₹)
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
  showDecimals?: boolean
  compact?: boolean
}

type NumericValue = number | string

/**
 * Memoized formatters (avoid re-instantiation)
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
 * Safe number parser
 */
function toNumber(value: NumericValue, defaultValue = 0): number {
  if (typeof value === "number") return value
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Integer math helpers (avoid floating point issues)
 */
function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Format currency (₹)
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
 * Format currency with sign (+ / -)
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
 * Format plain number (no ₹)
 */
export function formatNumber(amount: NumericValue): string {
  return FORMATTERS.number.format(toNumber(amount))
}

/**
 * Format percentage
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
 * Difference between two values (₹ with sign)
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
 * Discount %
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
 * Profit Margin %
 * Margin = Profit / Selling Price
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
 * Markup %
 * Markup = Profit / Cost Price
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
