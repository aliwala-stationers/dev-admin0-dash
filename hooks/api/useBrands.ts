import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Brand {
  _id: string // MongoDB uses _id
  id?: string // Fallback for UI
  name: string
  slug: string
  description: string
  status: boolean
  logo: string
  createdAt: string
}

// 1. FETCH ALL
export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async (): Promise<Brand[]> => {
      const res = await fetch("/api/brands")
      if (!res.ok) throw new Error("Failed to fetch brands")
      return res.json()
    },
  })
}

// 2. FETCH ONE
export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ["brands", id],
    queryFn: async (): Promise<Brand> => {
      const res = await fetch(`/api/brands/${id}`)
      if (!res.ok) throw new Error("Failed to fetch brand")
      return res.json()
    },
    enabled: !!id, // Only fetch if ID exists
  })
}

// 3. CREATE
export const useCreateBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Brand>) => {
      const res = await fetch("/api/brands", {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create brand")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}

// 4. UPDATE
export const useUpdateBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Brand> }) => {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update brand")
      return res.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      queryClient.invalidateQueries({ queryKey: ["brands", variables.id] })
    },
  })
}

// 5. DELETE
export const useDeleteBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete brand")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Brand deleted successfully")
    },
  })
}
