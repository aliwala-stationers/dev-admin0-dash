// @/hooks/api/useProductAnalytics.ts

import { useQuery } from "@tanstack/react-query"
import type {
  ProductAnalyticsResponse,
  ProductAnalyticsParams,
} from "@/lib/analytics/productAnalytics"

/**
 * React Query hook for product analytics
 * Fetches full-dataset metrics from dedicated analytics endpoint
 *
 * This separates listing concerns from analytics concerns for scalability
 * Analytics are cached for 5 minutes since they don't need real-time updates
 */
export function useProductAnalytics(params?: ProductAnalyticsParams) {
  return useQuery({
    queryKey: ["product-analytics", params],
    queryFn: async (): Promise<ProductAnalyticsResponse> => {
      const queryParams = new URLSearchParams()
      if (params?.lowStockThreshold) {
        queryParams.append(
          "lowStockThreshold",
          params.lowStockThreshold.toString(),
        )
      }

      const res = await fetch(
        `/api/products/analytics?${queryParams.toString()}`,
      )
      if (!res.ok) throw new Error("Failed to fetch product analytics")

      const json = await res.json()
      return json.data as ProductAnalyticsResponse
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - analytics don't need real-time updates
    refetchOnWindowFocus: false,
  })
}
