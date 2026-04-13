// @/lib/auth-context.tsx

"use client"

import { createContext, useContext, ReactNode } from "react"
import { useCurrentUser, useLogin, useLogout } from "@/hooks/api/useAuthQueries"

// --- Types ---
interface User {
  id: string
  name: string
  email: string
  role: string
  isAdmin: boolean
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: {
    email: string
    password: string
    redirect?: string | null
  }) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. Get Session State
  // The hook handles fetching, caching, and the 401 error suppression
  const { data: user, isLoading } = useCurrentUser()

  // 2. Get Actions
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null, // Ensure undefined becomes null
        isAuthenticated: !!user,
        isLoading,
        // We expose the mutate functions directly
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
