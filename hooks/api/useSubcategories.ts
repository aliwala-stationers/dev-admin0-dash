import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Subcategory {
  _id?: string
  id?: string
  name: string
  slug: string
  description: string
  status: boolean
  image?: string
  category?: string | { _id: string; id?: string; name?: string }
  productCount?: number
  createdAt: string
  updatedAt: string
}

// 1. FETCH ALL
export const useSubcategories = (categoryId?: string) => {
  return useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async (): Promise<Subcategory[]> => {
      const url = categoryId
        ? `/api/subcategories?categoryId=${categoryId}`
        : "/api/subcategories"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch subcategories")
      const json = await res.json()
      return json.data || []
    },
    retry: false,
  })
}

// 2. FETCH ONE
export const useSubcategory = (id: string) => {
  return useQuery({
    queryKey: ["subcategories", id],
    queryFn: async (): Promise<Subcategory> => {
      const res = await fetch(`/api/subcategories/${id}`)
      if (!res.ok) throw new Error("Failed to fetch subcategory")
      const json = await res.json()
      return json.subcategory
    },
    enabled: !!id,
  })
}

// 3. CREATE
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Subcategory>) => {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create subcategory")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      toast.success("Subcategory created successfully")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// 4. UPDATE
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Subcategory>
    }) => {
      const res = await fetch(`/api/subcategories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update subcategory")
      return res.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      queryClient.invalidateQueries({
        queryKey: ["subcategories", variables.id],
      })
      toast.success("Subcategory updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// 5. DELETE
export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete subcategory")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] })
      toast.success("Subcategory deleted")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
