// @/app/api/products/analytics/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getProductAnalytics } from "@/lib/analytics/productAnalytics"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { AnalyticsError, ANALYTICS_ERRORS } from "@/lib/analytics/errors"
import { logServerError } from "@/lib/server/errorlogs"

// Simple in-memory cache for fallback on timeout
// In production, this should be replaced with Redis or similar
//
// IMPORTANT: In-memory cache limitations:
// - Not shared across serverless instances (Vercel, AWS Lambda, etc.)
// - Resets on cold starts and instance restarts
// - This is "best-effort resilience layer", not guaranteed cache
// - For distributed environments, use Redis or DB-backed metrics
let cacheMap: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * GET /api/products/analytics
 *
 * Production-grade analytics endpoint
 * Computes full-dataset metrics using MongoDB aggregation
 * Separates listing concerns from analytics concerns for scalability
 *
 * Query params:
 * - lowStockThreshold: number (default: 10)
 */
export async function GET(req: NextRequest) {
  // Declare outside try block for availability in catch blocks
  let lowStockThreshold = 10
  let cacheKey = "" // Declare here, will be set after validation
  const { searchParams } = new URL(req.url)

  try {
    // Proper threshold validation - throw on invalid input instead of silent correction
    const rawThreshold = searchParams.get("lowStockThreshold")
    if (rawThreshold !== null) {
      const parsed = Number(rawThreshold)
      if (Number.isNaN(parsed)) {
        throw ANALYTICS_ERRORS.INVALID_THRESHOLD()
      }
      lowStockThreshold = parsed
    }

    // Generate cache key based on params AFTER validation to prevent data corruption
    cacheKey = JSON.stringify({ lowStockThreshold })

    await verifyAdmin()

    const start = Date.now()
    const analytics = await getProductAnalytics({
      lowStockThreshold,
    })
    const duration = Date.now() - start

    // Log latency for performance monitoring
    console.log("analytics_duration_ms:", duration)

    // Update cache on successful fetch (validate shape before caching to prevent poisoning)
    const isValidAnalytics =
      typeof analytics.totalProducts === "number" &&
      analytics.totalProducts >= 0 &&
      typeof analytics.totalInventoryValue === "number" &&
      analytics.totalInventoryValue >= 0 &&
      typeof analytics.lowStockCount === "number" &&
      typeof analytics.outOfStockCount === "number"

    if (isValidAnalytics) {
      // Prevent unbounded cache growth - crude but effective safeguard
      if (Object.keys(cacheMap).length > 50) {
        cacheMap = {}
      }
      cacheMap[cacheKey] = {
        data: analytics,
        timestamp: Date.now(),
      }
    } else {
      console.warn("analytics_validation_failed: invalid shape, not caching")
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error: unknown) {
    // Handle domain errors (AuthError + AnalyticsError) with consistent pattern
    if (error instanceof AuthError || error instanceof AnalyticsError) {
      await logServerError({
        errorType: "validation",
        errorCode: error.code,
        errorMessage: error.message,
        endpoint: "/api/products/analytics",
        method: "GET",
        requestData: {
          lowStockThreshold,
          query: Object.fromEntries(searchParams),
        },
        stackTrace: error.stack,
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        },
        { status: error.status },
      )
    }

    // Handle MongoDB timeout (code 50 or message contains maxTimeMS) - map to 504 Gateway Timeout
    const isTimeout =
      error instanceof Error &&
      ((error as any).code === 50 || error.message?.includes("maxTimeMS"))

    if (isTimeout) {
      await logServerError({
        errorType: "timeout",
        errorCode: "AGGREGATION_TIMEOUT",
        errorMessage: error.message,
        endpoint: "/api/products/analytics",
        method: "GET",
        requestData: {
          lowStockThreshold,
          query: Object.fromEntries(searchParams),
        },
        stackTrace: error.stack,
      })

      // Return cached analytics if available and not expired
      const cached = cacheMap[cacheKey]
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("analytics_timeout_fallback: using cached data")
        return NextResponse.json({
          success: true,
          data: cached.data,
          _cached: true,
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Analytics aggregation timed out",
            code: "AGGREGATION_TIMEOUT",
          },
        },
        { status: 504 },
      )
    }

    await logServerError({
      errorType: "server",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      endpoint: "/api/products/analytics",
      method: "GET",
      requestData: {
        lowStockThreshold,
        query: Object.fromEntries(searchParams),
      },
      stackTrace: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch product analytics",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    )
  }
}
