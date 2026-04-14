"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Link from "next/link"

// IMPORT REAL DATA HOOKS
import { useProducts } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useBrands } from "@/hooks/api/useBrands"
import { useSubcategories } from "@/hooks/api/useSubcategories"
import { useEnquiries } from "@/hooks/api/useEnquiries"
import { useNewsletter } from "@/hooks/api/useNewsletter"
import { useData } from "@/lib/data-context"

export default function DashboardPage() {
  // 1. Fetch Real Data
  const { data: products = [], isLoading: pLoading } = useProducts()
  const { data: categories = [], isLoading: cLoading } = useCategories()
  const { data: brands = [], isLoading: bLoading } = useBrands()
  const { data: subcategories = [], isLoading: sLoading } = useSubcategories()
  const { data: enquiries = [], isLoading: eLoading } = useEnquiries()
  const { data: newsletterSubscribers = [], isLoading: nLoading } =
    useNewsletter()
  const { orders, customers, payments } = useData()

  // Ensure all data arrays are actually arrays (safety for API errors)
  const productsArray = Array.isArray(products) ? products : []
  const categoriesArray = Array.isArray(categories) ? categories : []
  const brandsArray = Array.isArray(brands) ? brands : []
  const subcategoriesArray = Array.isArray(subcategories) ? subcategories : []
  const enquiriesArray = Array.isArray(enquiries) ? enquiries : []
  const newsletterArray = Array.isArray(newsletterSubscribers)
    ? newsletterSubscribers
    : []

  // 2. Calculate Real Metrics
  const inventoryData = useMemo(() => {
    const totalValue = productsArray.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0,
    )
    const lowStockCount = productsArray.filter(
      (p) => (p.stock || 0) < 10,
    ).length
    const outOfStockCount = productsArray.filter(
      (p) => (p.stock || 0) === 0,
    ).length

    // Sort products by newest first for "Recent" list
    const recent = [...productsArray]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)

    return { totalValue, lowStockCount, outOfStockCount, recent }
  }, [productsArray])

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

  if (pLoading || cLoading || bLoading || sLoading || eLoading || nLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
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
      value: productsArray.length.toString(),
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-accent-blue">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Store overview and real-time inventory metrics.
        </p>
      </div>

      {/* TOP ROW STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-accent-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <TrendingUp
                  className={`h-3 w-3 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                />
                <span
                  className={
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SECOND ROW SUB-STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {subStats.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-accent-blue/10">
                  <stat.icon
                    className={`h-5 w-5 ${stat.color || "text-accent-blue"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BOTTOM ROW TABLES */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* RECENT ORDERS */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-accent-blue">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {order.id}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {order.customer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      &#8377;{order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.date}
                    </p>
                  </div>
                </div>
              ))}
              {dashboardStats.recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RECENT PAYMENTS */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-accent-blue">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {payment.id}
                    </Link>
                    <p className="text-xs text-muted-foreground uppercase">
                      {payment.method.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      &#8377;{payment.amount.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        payment.status === "completed" ? "success" : "secondary"
                      }
                      className="text-[10px] h-4 px-1"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {dashboardStats.recentPayments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No payments yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TOP PRODUCTS (REAL DATA - NEWEST) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-accent-blue">New Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryData.recent.map((product) => (
                <div
                  key={product._id || product.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-blue/10">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt="p"
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-accent-blue" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[120px]">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeof product.category === "object"
                          ? product.category.name
                          : "Category"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      &#8377;{product.price}
                    </span>
                  </div>
                </div>
              ))}
              {inventoryData.recent.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No products yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* LOW STOCK ALERTS (REAL DATA) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-accent-blue">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsArray
                .filter((p) => (p.stock ?? 0) < 10)
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product._id || product.id}
                    className="flex flex-col border-b border-border/50 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate max-w-[150px]">
                        {product.name}
                      </p>
                      <Badge
                        variant="destructive"
                        className="text-[10px] h-4 px-1"
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : `Low: ${product.stock}`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      SKU: {product.sku}
                    </p>
                  </div>
                ))}
              {productsArray.filter((p) => (p.stock ?? 0) < 10).length ===
                0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-8 w-8 text-green-200 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Inventory looks healthy!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
