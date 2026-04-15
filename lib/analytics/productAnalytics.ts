// @/lib/analytics/productAnalytics.ts

import Product from "@/models/Product"
import mongoose from "mongoose"
import { AnalyticsError, ANALYTICS_ERRORS } from "./errors"

/**
 * Product Analytics Service
 * Computes full-dataset analytics using MongoDB aggregation
 * Separates listing concerns from analytics concerns for scalability
 *
 * Uses single-pass aggregation with $cond instead of $facet to avoid multiple collection scans
 * This is critical for performance at scale (10k → 1M products)
 */

export interface ProductAnalyticsParams {
  lowStockThreshold?: number
  storeId?: string // Future-proof for multi-tenant
}

export interface ProductAnalyticsResponse {
  totalProducts: number
  totalInventoryValue: number
  lowStockCount: number
  outOfStockCount: number
}

/**
 * Get product analytics using MongoDB aggregation
 * Computes metrics across the entire product catalog efficiently
 *
 * Single-pass aggregation using $cond:
 * - Single collection scan instead of multiple scans with $facet
 * - Better performance at scale
 *
 * Note: For production-grade financial accuracy, consider using paise-based pricing
 * (priceInPaise: number) to avoid floating point drift in calculations
 */
export async function getProductAnalytics({
  lowStockThreshold = 10,
  storeId,
}: ProductAnalyticsParams = {}): Promise<ProductAnalyticsResponse> {
  // Clamp threshold to prevent unbounded or malicious inputs (allow 0 for exact zero edge case)
  const threshold = Math.max(0, Math.min(lowStockThreshold, 10000))

  const matchStage: any = {
    // Only count active products - prevents corrupted analytics from drafts/inactive
    status: true,
  }

  // Future-proof for multi-tenant - validate and cast to ObjectId to prevent silent mismatches
  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw ANALYTICS_ERRORS.INVALID_STORE_ID()
    }
    matchStage.store = new mongoose.Types.ObjectId(storeId)
  }

  const result = await Product.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalInventoryValue: {
          $sum: {
            $multiply: [{ $ifNull: ["$costPrice", "$price"] }, "$stock"],
          },
        },
        lowStockCount: {
          $sum: {
            $cond: [
              {
                $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", threshold] }],
              },
              1,
              0,
            ],
          },
        },
        outOfStockCount: {
          $sum: {
            $cond: [{ $lte: ["$stock", 0] }, 1, 0],
          },
        },
      },
    },
  ]).option({ maxTimeMS: 5000 })

  const data = result[0] ?? {}

  return {
    totalProducts: data.totalProducts || 0,
    totalInventoryValue: data.totalInventoryValue || 0,
    lowStockCount: data.lowStockCount || 0,
    outOfStockCount: data.outOfStockCount || 0,
  }
}
