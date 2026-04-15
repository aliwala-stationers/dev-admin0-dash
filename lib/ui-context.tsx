// @/lib/ui-context.tsx

"use client"

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react"

interface UIPreferences {
  denseMode: boolean
  sidebarCollapsed: boolean
  setDenseMode: (value: boolean) => void
  setSidebarCollapsed: (value: boolean) => void
}

const UIContext = createContext<UIPreferences | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [denseMode, setDenseMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("denseMode") === "true"
    }
    return false
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarCollapsed") === "true"
    }
    return false
  })

  // Save preferences to localStorage when changed
  useEffect(() => {
    localStorage.setItem("denseMode", denseMode.toString())
  }, [denseMode])

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString())
  }, [sidebarCollapsed])

  // Apply dense mode class to body
  useEffect(() => {
    if (denseMode) {
      document.body.classList.add("dense-mode")
    } else {
      document.body.classList.remove("dense-mode")
    }
  }, [denseMode])

  return (
    <UIContext.Provider
      value={{
        denseMode,
        sidebarCollapsed,
        setDenseMode,
        setSidebarCollapsed,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
}
