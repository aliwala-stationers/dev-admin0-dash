import ErrorLog from "@/models/ErrorLog"

/**
 * Log server errors to the ErrorLog collection
 */
export async function logServerError(errorData: {
  errorType:
    | "validation"
    | "duplicate"
    | "server"
    | "network"
    | "unknown"
    | "timeout"
  errorMessage: string
  endpoint: string
  method: string
  requestData?: any
  stackTrace?: string
  errorCode?: string
}) {
  try {
    await ErrorLog.create(errorData)
  } catch (logError) {
    console.error("Failed to log error:", {
      originalError: errorData,
      loggingError: logError,
    })
  }
}
