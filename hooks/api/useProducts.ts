import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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

// 1. FETCH ALL PRODUCTS
// Optional: Accept filters like ?category=...
export const useProducts = (filters?: string) => {
  return useQuery({
    queryKey: ["products", filters], // Key changes when filter changes
    queryFn: async (): Promise<Product[]> => {
      const queryString = filters ? `?${filters}` : ""
      const res = await fetch(`/api/products${queryString}`)
      if (!res.ok) throw new Error("Failed to fetch products")
      const json = await res.json()
      return json.data || []
    },
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
        throw new Error(err.error || "Failed to create product")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
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
        throw new Error(err.error || "Failed to update product")
      }
      return res.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate list AND the specific item
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] })
      toast.success("Product updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
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
