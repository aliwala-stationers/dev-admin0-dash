// @/lib/analytics/errors.ts

export class AnalyticsError extends Error {
  status: number
  code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = "AnalyticsError"
    this.status = status
    this.code = code

    Object.setPrototypeOf(this, AnalyticsError.prototype)
  }
}

/**
 * Centralized analytics errors
 */
export const ANALYTICS_ERRORS = {
  INVALID_STORE_ID: () =>
    new AnalyticsError("Invalid storeId", 400, "INVALID_STORE_ID"),

  INVALID_THRESHOLD: () =>
    new AnalyticsError("Invalid threshold value", 400, "INVALID_THRESHOLD"),

  AGGREGATION_TIMEOUT: () =>
    new AnalyticsError(
      "Analytics aggregation timed out",
      504,
      "AGGREGATION_TIMEOUT",
    ),

  AGGREGATION_FAILED: (message: string = "Aggregation failed") =>
    new AnalyticsError(message, 500, "AGGREGATION_FAILED"),
}
