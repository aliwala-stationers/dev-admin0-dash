// @/app/api/products/analytics/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getProductAnalytics } from "@/lib/analytics/productAnalytics"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { AnalyticsError } from "@/lib/analytics/errors"
import { logServerError } from "@/lib/server/errorlogs"

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
  const { searchParams } = new URL(req.url)
  const lowStockThreshold = Number(searchParams.get("lowStockThreshold")) || 10

  try {
    await verifyAdmin()

    const analytics = await getProductAnalytics({
      lowStockThreshold,
    })

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: "/api/products/analytics",
        method: "GET",
        requestData: { lowStockThreshold },
        stackTrace: error.stack,
      })

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    if (error instanceof AnalyticsError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: "/api/products/analytics",
        method: "GET",
        requestData: { lowStockThreshold },
        stackTrace: error.stack,
      })

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    await logServerError({
      errorType: "server",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      endpoint: "/api/products/analytics",
      method: "GET",
      requestData: { lowStockThreshold },
      stackTrace: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product analytics",
      },
      { status: 500 },
    )
  }
}
