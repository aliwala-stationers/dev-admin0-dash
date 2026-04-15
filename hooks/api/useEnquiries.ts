import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Enquiry {
  _id?: string
  id?: string
  name: string
  email: string
  phone?: string
  message: string
  status: "new" | "read" | "contacted"
  createdAt: string
  updatedAt: string
}

export const useEnquiries = () => {
  return useQuery({
    queryKey: ["enquiries"],
    queryFn: async (): Promise<Enquiry[]> => {
      const res = await fetch("/api/enquiries")
      if (!res.ok) throw new Error("Failed to fetch enquiries")
      const json = await res.json()
      return json.data || []
    },
    retry: false,
  })
}

export const useEnquiry = (id: string) => {
  return useQuery({
    queryKey: ["enquiries", id],
    queryFn: async (): Promise<Enquiry> => {
      const res = await fetch(`/api/enquiries/${id}`)
      if (!res.ok) throw new Error("Failed to fetch enquiry")
      const json = await res.json()
      return json.data
    },
    enabled: !!id,
  })
}

export const useCreateEnquiry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Enquiry>) => {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create enquiry")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] })
      toast.success("Enquiry submitted")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateEnquiry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Enquiry>
    }) => {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update enquiry")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] })
      queryClient.invalidateQueries({ queryKey: ["enquiries", variables.id] })
      toast.success("Enquiry updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useDeleteEnquiry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete enquiry")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] })
      toast.success("Enquiry removed")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
