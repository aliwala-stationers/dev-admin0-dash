import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface NewsletterSubscriber {
  _id: string
  email: string
  isActive: boolean
  meta?: {
    source?: string
  }
  createdAt: string
  updatedAt: string
}

export const useNewsletter = () => {
  return useQuery({
    queryKey: ["newsletter"],
    queryFn: async (): Promise<NewsletterSubscriber[]> => {
      const res = await fetch("/api/newsletter")
      if (!res.ok) throw new Error("Failed to fetch newsletter subscribers")
      const json = await res.json()
      return json.data || []
    },
  })
}

export const useNewsletterSubscriber = (id: string) => {
  return useQuery({
    queryKey: ["newsletter", id],
    queryFn: async (): Promise<NewsletterSubscriber> => {
      const res = await fetch(`/api/newsletter/${id}`)
      if (!res.ok) throw new Error("Failed to fetch subscriber")
      const json = await res.json()
      return json.data
    },
    enabled: !!id,
  })
}

export const useCreateNewsletterSubscriber = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<NewsletterSubscriber>) => {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create subscriber")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter"] })
      toast.success("Subscriber added")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useUpdateNewsletterSubscriber = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<NewsletterSubscriber>
    }) => {
      const res = await fetch(`/api/newsletter/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update subscriber")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter"] })
      queryClient.invalidateQueries({ queryKey: ["newsletter", variables.id] })
      toast.success("Subscriber updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export const useDeleteNewsletterSubscriber = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/newsletter/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete subscriber")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter"] })
      toast.success("Subscriber removed")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
