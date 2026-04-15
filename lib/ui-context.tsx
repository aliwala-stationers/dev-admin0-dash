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
  const [denseMode, setDenseMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedDenseMode = localStorage.getItem("denseMode") === "true"
    const savedSidebarCollapsed =
      localStorage.getItem("sidebarCollapsed") === "true"

    setDenseMode(savedDenseMode)
    setSidebarCollapsed(savedSidebarCollapsed)
  }, [])

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
