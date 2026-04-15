"use client"

import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  ShoppingCart,
  Users,
  CreditCard,
  LogOut,
  Tag,
  MessageSquare,
  Mail,
  History,
  ArrowRight,
  Bell,
  User,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// 1. FIX: Import from the new Context location
import { useAuth } from "@/lib/auth-context"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { title: "Products", icon: Package, href: "/admin/products" },
  { title: "Categories", icon: FolderTree, href: "/admin/categories" },
  { title: "Subcategories", icon: Layers, href: "/admin/subcategories" },
  { title: "Brands", icon: Tag, href: "/admin/brands" },
  { title: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { title: "Customers", icon: Users, href: "/admin/customers" },
  { title: "Payments", icon: CreditCard, href: "/admin/payments" },
  { title: "Enquiries", icon: MessageSquare, href: "/admin/enquiries" },
  { title: "Newsletter", icon: Mail, href: "/admin/newsletter" },
]

const bottomMenuItems = [
  { title: "Notifications", icon: Bell, href: "/admin/notifications" },
  { title: "Profile", icon: User, href: "/admin/profile" },
  { title: "Settings", icon: Settings, href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  // 2. Destructure the new mutation-based logout
  const { logout } = useAuth()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16">
        <div className="flex items-center gap-3 px-6 group-data-[collapsible=icon]:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-blue shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Admin Panel</span>
            <span className="text-xs text-muted-foreground">Aliwala 2.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {bottomMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 gap-2">
        <Link
          href="/changelog"
          className="flex w-full items-end gap-2 px-2 py-1.5 text-sm italic font-light text-accent-blue hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden"
        >
          {/* <History className="h-4 w-4 opacity-70" /> */}
          <span>View Changelog</span> <ArrowRight className="h-4 w-4" />
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start group-data-[collapsible=icon]:justify-center"
          // 3. FIX: Wrap execution to prevent passing the Event object to the API
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
