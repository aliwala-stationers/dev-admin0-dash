"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you use Sonner

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>; // Using mutation
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fetcher function
const fetchUser = async () => {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. QUERY: Check Session on Mount / Interval
  const { data, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchUser,
    retry: false, // Don't retry 401s
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const user = isError ? null : data?.user;

  // 2. MUTATION: Login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Update React Query Cache immediately
      queryClient.setQueryData(["currentUser"], { user: data.user });
      toast.success("Welcome back");
      router.push("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // 3. MUTATION: Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Need a logout API route to clear cookie!
      await fetch("/api/auth/logout", { method: "POST" }); 
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      router.push("/admin/login");
      toast.success("Logged out");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}