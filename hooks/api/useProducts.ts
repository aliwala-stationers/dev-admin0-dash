import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Helper function to log errors to API
const logError = async (errorData: {
  errorType: "validation" | "duplicate" | "server" | "network" | "unknown"
  errorMessage: string
  endpoint: string
  method: string
  requestData?: any
  stackTrace?: string
}) => {
  try {
    await fetch("/api/error-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    })
  } catch (logError) {
    console.error("Failed to log error:", logError)
  }
}

// Helper types for populated fields
type PopulatedRef = { _id: string; name: string; slug?: string; logo?: string }

export interface Product {
  _id?: string
  id?: string
  name: string
  slug: string // <--- ADDED
  sku: string
  description: string

  // These can be ID strings OR Objects depending on API population
  category: string | PopulatedRef
  brand: string | PopulatedRef
  subcategory?: string | PopulatedRef

  price: number
  salePrice?: number
  hsn?: string
  tax?: number
  upc?: string
  barcode?: string
  stock?: number
  status: boolean

  images?: string[]
  videoUrl?: string | null
  specs?: Record<string, string> // <--- ADDED (e.g. { Color: "Red" })
  isFeatured?: boolean

  createdAt: string
  updatedAt: string
}

// 1. FETCH ALL PRODUCTS WITH PAGINATION
// Accepts pagination and filtering parameters
export interface ProductsParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  subcategory?: string
  brand?: string
}

export const useProducts = (params: ProductsParams = {}) => {
  const { page = 1, limit = 20, search, category, subcategory, brand } = params

  const queryParams = new URLSearchParams()
  queryParams.append("page", page.toString())
  queryParams.append("limit", limit.toString())
  if (search) queryParams.append("search", search)
  if (category && category !== "all") queryParams.append("category", category)
  if (subcategory && subcategory !== "all")
    queryParams.append("subcategory", subcategory)
  if (brand && brand !== "all") queryParams.append("brand", brand)

  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await fetch(`/api/products?${queryParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch products")
      const json = await res.json()
      return {
        data: json.data || [],
        pagination: json.pagination || { total: 0, page, limit, pages: 0 },
      }
    },
    retry: false,
  })
}

// 2. FETCH ONE PRODUCT
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<Product> => {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error("Failed to fetch product")
      const json = await res.json()
      return json.product
    },
    enabled: !!id,
  })
}

// 3. CREATE PRODUCT
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        const errorMessage = err.error || "Failed to create product"

        // Log error to API
        const errorType =
          errorMessage.toLowerCase().includes("sku") ||
          errorMessage.toLowerCase().includes("slug") ||
          errorMessage.toLowerCase().includes("name")
            ? "duplicate"
            : "server"

        await logError({
          errorType,
          errorMessage,
          endpoint: "/api/products",
          method: "POST",
          requestData: data,
        })

        console.log("Product creation error:", errorMessage)
        return { error: errorMessage }
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase()
      if (message.includes("sku")) {
        toast.error(
          "A product with this SKU already exists. Please use a different SKU.",
        )
      } else if (message.includes("slug")) {
        toast.error(
          "A product with this slug already exists. Please use a different slug.",
        )
      } else if (message.includes("name")) {
        toast.error(
          "A product with this name already exists. Please use a different name.",
        )
      } else {
        toast.error(error.message)
      }
    },
  })
}

// 4. UPDATE PRODUCT
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Product>
    }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        const errorMessage = err.error || "Failed to update product"

        // Log error to API
        const errorType =
          errorMessage.toLowerCase().includes("sku") ||
          errorMessage.toLowerCase().includes("slug") ||
          errorMessage.toLowerCase().includes("name")
            ? "duplicate"
            : "server"

        await logError({
          errorType,
          errorMessage,
          endpoint: `/api/products/${id}`,
          method: "PUT",
          requestData: data,
        })

        console.log("Product update error:", errorMessage)
        return { error: errorMessage }
      }
      return res.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate list AND the specific item
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] })
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase()
      if (message.includes("sku")) {
        toast.error(
          "A product with this SKU already exists. Please use a different SKU.",
        )
      } else if (message.includes("slug")) {
        toast.error(
          "A product with this slug already exists. Please use a different slug.",
        )
      } else if (message.includes("name")) {
        toast.error(
          "A product with this name already exists. Please use a different name.",
        )
      } else {
        toast.error(error.message)
      }
    },
  })
}

// 5. DELETE PRODUCT
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete product")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product moved to trash")
    },
    onError: (error: Error) => {
      toast.error("Delete failed: " + error.message)
    },
  })
}
