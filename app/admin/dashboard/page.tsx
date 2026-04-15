// @/app/admin/dashboard/page.tsx

"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Layers,
  Tag,
  CreditCard,
  MessageSquare,
  Mail,
  Loader2,
  AlertTriangle,
  FolderTree,
  ArrowUpRight,
  Clock,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CURRENCY_SYMBOL } from "@/lib/utils"

// IMPORT REAL DATA HOOKS
import { useProducts } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useBrands } from "@/hooks/api/useBrands"
import { useSubcategories } from "@/hooks/api/useSubcategories"
import { useEnquiries } from "@/hooks/api/useEnquiries"
import { useNewsletter } from "@/hooks/api/useNewsletter"
import { useProductAnalytics } from "@/hooks/api/useProductAnalytics"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"

// Skeleton loading state component
const DashboardSkeleton = () => (
  <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-8 w-40" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr lg:auto-rows-[minmax(160px,auto)]">
      {/* Large card skeleton */}
      <Card className="lg:col-span-2 lg:row-span-2 border-none shadow-xl">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-16 w-64 mt-4" />
        </CardHeader>
        <CardContent className="mt-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
      {/* Small card skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-3 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}

      {/* Recent Orders skeleton */}
      <Card className="lg:col-span-2 lg:row-span-3 border-border/50 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-24 mt-2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="p-4 border-t">
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </Card>

      {/* New Arrivals skeleton */}
      <Card className="lg:col-span-2 lg:row-span-2 border-border/50">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-24 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-2 rounded-xl border">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity skeleton */}
      <Card className="lg:col-span-2 lg:row-span-1 border-border/50 bg-secondary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-2 w-10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mini stats skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-3 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export default function DashboardPage() {
  // 1. Fetch Real Data
  const { data: productsData, isLoading: pLoading } = useProducts()
  const { data: categories = [], isLoading: cLoading } = useCategories()
  const { data: brands = [], isLoading: bLoading } = useBrands()
  const { data: subcategories = [], isLoading: sLoading } = useSubcategories()
  const { data: enquiries = [], isLoading: eLoading } = useEnquiries()
  const { data: newsletterSubscribers = [], isLoading: nLoading } =
    useNewsletter()
  const { data: analytics, isLoading: aLoading } = useProductAnalytics()
  const { orders, customers, payments } = useData()

  // Ensure all data arrays are actually arrays (safety for API errors)
  const productsArray = Array.isArray(productsData?.data)
    ? productsData.data
    : []
  const categoriesArray = Array.isArray(categories) ? categories : []
  const brandsArray = Array.isArray(brands) ? brands : []
  const subcategoriesArray = Array.isArray(subcategories) ? subcategories : []
  const enquiriesArray = Array.isArray(enquiries) ? enquiries : []
  const newsletterArray = Array.isArray(newsletterSubscribers)
    ? newsletterSubscribers
    : []

  // 2. Calculate Real Metrics
  const inventoryData = useMemo(() => {
    // Use analytics from dedicated endpoint (full dataset)
    const totalValue = analytics?.totalInventoryValue || 0
    const lowStockCount = analytics?.lowStockCount || 0
    const outOfStockCount = analytics?.outOfStockCount || 0

    // Sort products by newest first for "Recent" list (still uses loaded data for display)
    const recent = [...productsArray]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)

    return { totalValue, lowStockCount, outOfStockCount, recent }
  }, [analytics, productsArray])

  // 3. Real Data Metrics
  const dashboardStats = useMemo(() => {
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    const activeNewsletter = newsletterArray.filter(
      (s: any) => s.isActive,
    ).length

    return { recentOrders, recentPayments, activeNewsletter }
  }, [orders, payments, newsletterArray])

  // Show skeleton if any API is still loading initially
  // This ensures smooth UX during data fetch
  if (
    pLoading ||
    cLoading ||
    bLoading ||
    sLoading ||
    eLoading ||
    nLoading ||
    aLoading
  ) {
    return <DashboardSkeleton />
  }

  // Configuration for Top Stats Cards
  const stats = [
    {
      title: "Total Inventory Value",
      value: `${inventoryData.totalValue.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: "Real-time",
      trend: "up" as const,
      icon: DollarSign, // Changed from Revenue to Inventory Value
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      change: "Lifetime",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: analytics?.totalProducts?.toString() || "0",
      change: `${inventoryData.lowStockCount} Low Stock`, // Showing actionable data
      trend: inventoryData.lowStockCount > 0 ? "down" : ("up" as const), // Red trend if low stock
      icon: Package,
    },
    {
      title: "Total Customers",
      value: customers.length.toString(),
      change: "Active users",
      trend: "up" as const,
      icon: Users,
    },
  ]

  const subStats = [
    {
      title: "Brands",
      value: brandsArray.length,
      icon: Tag,
    },
    {
      title: "Categories",
      value: categoriesArray.length,
      icon: Layers,
    },
    {
      title: "Subcategories",
      value: subcategoriesArray.length,
      icon: FolderTree,
    },
    {
      title: "Stock Alerts",
      value: inventoryData.lowStockCount,
      icon: AlertTriangle,
      color: "text-red-500", // Highlight specific metric
    },
    {
      title: "Enquiries",
      value: enquiriesArray.length,
      icon: MessageSquare,
    },
    {
      title: "Newsletter",
      value: newsletterArray.length,
      icon: Mail,
    },
    {
      title: "Total Payments",
      value: payments.length,
      icon: CreditCard,
    },
  ]

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-background/50 backdrop-blur-sm border-accent-blue/20 text-accent-blue px-3 py-1"
          >
            <div className="h-2 w-2 rounded-full bg-accent-blue mr-2 animate-pulse" />
            Live Store Updates
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr lg:auto-rows-[minmax(160px,auto)]">
        {/* HERO STAT: TOTAL VALUE (Bento: 2x2) */}
        <Card className="lg:col-span-2 lg:row-span-2 border-none shadow-xl bg-accent-blue text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="h-32 w-32 rotate-12" />
          </div>
          <CardHeader className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">
              Estimated Inventory Value
            </p>
            <CardTitle className="text-4xl md:text-5xl font-black mt-2">
              {inventoryData.totalValue.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-auto">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Real-time calculations
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-white/60 uppercase font-bold tracking-tighter">
                    Products
                  </p>
                  <p className="text-xl font-bold">{productsArray.length}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase font-bold tracking-tighter">
                    Avg. Price
                  </p>
                  <p className="text-xl font-bold">
                    {CURRENCY_SYMBOL}
                    {productsArray.length > 0
                      ? (
                          inventoryData.totalValue / productsArray.length
                        ).toFixed(0)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TOP STAT: ORDERS (Bento: 1x1) */}
        <Card className="border-border/50 hover:border-accent-blue/50 transition-colors cursor-default group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </p>
            <div className="p-2 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue group-hover:text-white transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders.length}</div>
            <div className="flex items-center gap-1 text-[10px] mt-1 text-green-600 font-bold">
              <ArrowUpRight className="h-3 w-3" />
              <span>LIFETIME GROWTH</span>
            </div>
          </CardContent>
        </Card>

        {/* TOP STAT: CUSTOMERS (Bento: 1x1) */}
        <Card className="border-border/50 hover:border-accent-blue/50 transition-colors cursor-default group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Customers
            </p>
            <div className="p-2 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue group-hover:text-white transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customers.length}</div>
            <p className="text-[10px] mt-1 text-muted-foreground font-medium">
              ACTIVE USERS BASE
            </p>
          </CardContent>
        </Card>

        {/* TOP STAT: STOCK ALERTS (Bento: 1x1) - High Impact */}
        <Card
          className={cn(
            "border-border/50 transition-all cursor-default group",
            inventoryData.lowStockCount > 0
              ? "border-red-200 bg-red-50/30 dark:bg-red-950/10"
              : "hover:border-accent-blue/50",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Inventory Alert
            </p>
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                inventoryData.lowStockCount > 0
                  ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                  : "bg-green-100 text-green-600",
              )}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-3xl font-bold",
                inventoryData.lowStockCount > 0 && "text-red-600",
              )}
            >
              {inventoryData.lowStockCount}
            </div>
            <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-tighter">
              Items requiring restock
            </p>
          </CardContent>
        </Card>

        {/* TOP STAT: BRANDS (Bento: 1x1) */}
        <Card className="border-border/50 hover:border-accent-blue/50 transition-colors cursor-default group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Brands
            </p>
            <div className="p-2 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue group-hover:text-white transition-colors">
              <Tag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{brandsArray.length}</div>
            <p className="text-[10px] mt-1 text-muted-foreground font-medium">
              PARTNER ECOSYSTEM
            </p>
          </CardContent>
        </Card>

        {/* RECENT ORDERS (Bento: 2x3) */}
        <Card className="lg:col-span-2 lg:row-span-3 border-border/50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-bold text-accent-blue">
                Recent Orders
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-0.5">
                Live Transactions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link href="/admin/orders">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              {dashboardStats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-colors">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-accent-blue transition-colors truncate max-w-[150px]">
                        {order.customer}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold h-4 px-1 leading-none uppercase tracking-tighter"
                        >
                          #{order.id.slice(-6)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {order.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {CURRENCY_SYMBOL}
                      {order.total.toLocaleString("en-IN")}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-3.5 px-1 uppercase font-black tracking-tighter mt-1"
                    >
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
              {dashboardStats.recentOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm italic">Queue is empty</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-4 bg-muted/30 border-t border-border/50 mt-auto">
            <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest">
              Total {orders.length} orders processed
            </p>
          </div>
        </Card>

        {/* NEW ARRIVALS (Bento: 2x2) */}
        <Card className="lg:col-span-2 lg:row-span-2 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-accent-blue">
              New Arrivals
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-0.5">
              Latest Inventory Additions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inventoryData.recent.slice(0, 4).map((product) => (
                <div
                  key={product._id || product.id}
                  className="flex gap-3 p-2 rounded-xl border border-border/40 hover:bg-secondary/50 transition-colors"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt="p"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between overflow-hidden">
                    <div>
                      <p className="text-xs font-bold truncate pr-2">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">
                        {typeof product.category === "object"
                          ? product.category.name
                          : "Uncategorized"}
                      </p>
                    </div>
                    <p className="text-xs font-black text-accent-blue">
                      {CURRENCY_SYMBOL}
                      {product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
              {inventoryData.recent.length === 0 && (
                <div className="col-span-2 py-12 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm italic">Warehouse empty</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY (Bento: 2x1) */}
        <Card className="lg:col-span-2 lg:row-span-1 border-border/50 bg-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Recent Activity (Last 30 Days)
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[9px] font-black h-4 uppercase"
              >
                {payments.length} Payments
              </Badge>
              <Badge
                variant="outline"
                className="text-[9px] font-black h-4 uppercase"
              >
                {enquiriesArray.length} Enquiries
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
              {(() => {
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                const recentPayments = payments.filter(
                  (payment) => new Date(payment.date) >= thirtyDaysAgo,
                )
                const recentEnquiries = enquiriesArray.filter(
                  (enquiry) => new Date(enquiry.createdAt) >= thirtyDaysAgo,
                )
                const recentOrders = orders.filter(
                  (order) => new Date(order.date) >= thirtyDaysAgo,
                )

                const allActivities = [
                  ...recentPayments.map((p) => ({
                    type: "payment" as const,
                    id: p.id,
                    amount: p.amount,
                    method: p.method,
                    date: p.date,
                  })),
                  ...recentEnquiries.map((e) => ({
                    type: "enquiry" as const,
                    id: e.id,
                    name: e.name,
                    date: e.createdAt,
                  })),
                  ...recentOrders.map((o) => ({
                    type: "order" as const,
                    id: o.id,
                    total: o.total,
                    date: o.date,
                  })),
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .slice(0, 5)

                if (allActivities.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-8 w-full text-muted-foreground">
                      <Clock className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm italic">
                        No activity in the last 30 days
                      </p>
                    </div>
                  )
                }

                return allActivities.map((activity) => {
                  if (activity.type === "payment") {
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-2 shrink-0 bg-background border border-border/50 rounded-lg p-2 pr-4 shadow-sm"
                      >
                        <div className="h-8 w-8 rounded bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">
                            {CURRENCY_SYMBOL}
                            {activity.amount}
                          </p>
                          <p className="text-[8px] text-muted-foreground uppercase font-black">
                            {activity.method}
                          </p>
                        </div>
                      </div>
                    )
                  }
                  if (activity.type === "enquiry") {
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-2 shrink-0 bg-background border border-border/50 rounded-lg p-2 pr-4 shadow-sm"
                      >
                        <div className="h-8 w-8 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold truncate max-w-[100px]">
                            {activity.name}
                          </p>
                          <p className="text-[8px] text-muted-foreground uppercase font-black">
                            Enquiry
                          </p>
                        </div>
                      </div>
                    )
                  }
                  if (activity.type === "order") {
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-2 shrink-0 bg-background border border-border/50 rounded-lg p-2 pr-4 shadow-sm"
                      >
                        <div className="h-8 w-8 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">
                            {CURRENCY_SYMBOL}
                            {activity.total}
                          </p>
                          <p className="text-[8px] text-muted-foreground uppercase font-black">
                            Order
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                })
              })()}
            </div>
          </CardContent>
        </Card>

        {/* CATEGORIES & SUBCATEGORIES GROUP (Bento: 2x1) */}
        <Card className="lg:col-span-2 border-border/50 hover:border-accent-blue/50 transition-colors cursor-default group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Categories & Subcategories
            </p>
            <div className="p-2 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue group-hover:text-white transition-colors">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold">
                  {categoriesArray.length}
                </div>
                <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-tighter">
                  Categories
                </p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold">
                  {subcategoriesArray.length}
                </div>
                <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-tighter">
                  Subcategories
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ENQUIRIES & NEWSLETTER GROUP (Bento: 2x1) */}
        <Card className="lg:col-span-2 border-border/50 hover:border-accent-blue/50 transition-colors cursor-default group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Enquiries & Newsletter
            </p>
            <div className="p-2 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue group-hover:text-white transition-colors">
              <MessageSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold">
                  {enquiriesArray.length}
                </div>
                <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-tighter">
                  Enquiries
                </p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold">
                  {newsletterArray.length}
                </div>
                <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-tighter">
                  Subscribers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments card commented out for now */}
        {/* <Card className="border-border/50 hover:border-accent-blue/50 transition-colors cursor-default group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Payments
            </p>
            <div className="p-2 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue group-hover:text-white transition-colors">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payments.length}</div>
            <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-tighter">
              Transactions processed
            </p>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
