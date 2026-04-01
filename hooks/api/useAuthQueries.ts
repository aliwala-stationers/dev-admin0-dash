import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"

// --- TYPES ---
interface User {
  id: string
  name: string
  email: string
  role: string
  isAdmin: boolean
  avatarUrl?: string
}

// --- 1. THE "WHO AM I?" QUERY ---
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<User | null> => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) {
        // If 401, we just return null (not logged in), don't throw error
        if (res.status === 401) return null
        throw new Error("Failed to fetch session")
      }
      const data = await res.json()
      return data.user
    },
    retry: false, // Don't retry if 401
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    refetchOnWindowFocus: true, // Re-check if tab is active
  })
}

// --- 2. THE LOGIN MUTATION ---
export const useLogin = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  return useMutation({
    mutationFn: async ({ email, password }: any) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Login failed")
      return data.user
    },
    onSuccess: (user) => {
      // 1. Update the 'currentUser' cache immediately
      queryClient.setQueryData(["currentUser"], user)

      // 2. Feedback
      toast.success("Welcome back")

      // 3. Redirect
      // If there's a redirect param, go there. Otherwise, dashboard.
      if (redirect) {
        router.push(redirect)
      } else {
        router.push("/admin/dashboard")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// --- 3. THE LOGOUT MUTATION ---
export const useLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" })
    },
    onSuccess: () => {
      // 1. Wipe the cache
      queryClient.setQueryData(["currentUser"], null)
      queryClient.clear() // Optional: clears all other data

      // 2. Redirect
      // If we're on the changelog page, stay there.
      // Otherwise, redirect to root login with the current path as redirect param.
      if (pathname !== "/changelog") {
        router.replace(`/?redirect=${encodeURIComponent(pathname)}`)
      }

      toast.success("Logged out")
    },
  })
}
