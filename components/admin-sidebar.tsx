"use client";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  CreditCard,
  LogOut,
  Tag,
  MessageSquare,
  Mail,
  History,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// 1. FIX: Import from the new Context location
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { title: "Products", icon: Package, href: "/admin/products" },
  { title: "Categories", icon: FolderTree, href: "/admin/categories" },
  { title: "Brands", icon: Tag, href: "/admin/brands" },
  { title: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { title: "Customers", icon: Users, href: "/admin/customers" },
  { title: "Payments", icon: CreditCard, href: "/admin/payments" },
  { title: "Enquiries", icon: MessageSquare, href: "/admin/enquiries" },
  { title: "Newsletter", icon: Mail, href: "/admin/newsletter" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  // 2. Destructure the new mutation-based logout
  const { logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-blue">
            <Package className="h-5 w-5 text-white" />
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
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 gap-2">
        <Link 
          href="/changelog" 
          className="flex w-full items-end gap-2 px-2 py-1.5 text-sm italic font-light text-accent-blue hover:text-foreground transition-colors"
        >
          {/* <History className="h-4 w-4 opacity-70" /> */}
          <span>View Changelog</span> <ArrowRight className="h-4 w-4" />
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start"
          // 3. FIX: Wrap execution to prevent passing the Event object to the API
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
