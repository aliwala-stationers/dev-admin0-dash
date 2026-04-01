"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { NotificationsNav } from "@/components/notifications-nav"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-4">
        {/* <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 h-9"
          />
        </div> */}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationsNav />
        <UserNav />
      </div>
    </header>
  )
}
