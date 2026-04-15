import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Category {
  _id?: string
  id?: string
  name: string
  slug: string
  description: string
  status: boolean
  image?: string // <--- ADDED: Category Image URL
  productCount?: number // <--- ADDED: Calculated field from API
  createdAt: string
  updatedAt: string
}

// 1. FETCH ALL
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      const json = await res.json()
      return json.data || []
    },
    retry: false,
  })
}

// 2. FETCH ONE
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async (): Promise<Category> => {
      const res = await fetch(`/api/categories/${id}`)
      if (!res.ok) throw new Error("Failed to fetch category")
      const json = await res.json()
      return json.category
    },
    enabled: !!id,
  })
}

// 3. CREATE
export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // <--- ADDED HEADER
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create category")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category created successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// 4. UPDATE
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Category>
    }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, // <--- ADDED HEADER
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update category")
      return res.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories", variables.id] })
      toast.success("Category updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// 5. DELETE
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete category")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category deleted")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
