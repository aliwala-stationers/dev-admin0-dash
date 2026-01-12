"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

// IMPORT REAL DATA HOOKS
import { useProducts } from "@/hooks/api/useProducts";
import { useCategories } from "@/hooks/api/useCategories";
import { useBrands } from "@/hooks/api/useBrands";

export default function DashboardPage() {
  // 1. Fetch Real Data
  const { data: products = [], isLoading: pLoading } = useProducts();
  const { data: categories = [], isLoading: cLoading } = useCategories();
  const { data: brands = [], isLoading: bLoading } = useBrands();

  // 2. Calculate Real Metrics
  const inventoryData = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock < 10).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    // Sort products by newest first for "Recent" list
    const recent = [...products]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return { totalValue, lowStockCount, outOfStockCount, recent };
  }, [products]);

  // 3. Mock Data (Placeholders until we build these APIs)
  const MOCK_ORDERS = 142;
  const MOCK_CUSTOMERS = 89;
  const mockRecentOrders = [
    {
      id: "ORD-001",
      customer: "Alice Smith",
      total: 120.5,
      date: "2 mins ago",
    },
    { id: "ORD-002", customer: "Bob Jones", total: 79.99, date: "15 mins ago" },
    {
      id: "ORD-003",
      customer: "Charlie Day",
      total: 299.0,
      date: "1 hour ago",
    },
  ];

  if (pLoading || cLoading || bLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Configuration for Top Stats Cards
  const stats = [
    {
      title: "Total Inventory Value",
      value: `$${inventoryData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "Real-time",
      trend: "up" as const,
      icon: DollarSign, // Changed from Revenue to Inventory Value
    },
    {
      title: "Total Orders",
      value: MOCK_ORDERS.toString(),
      change: "+15.3%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: products.length.toString(),
      change: `${inventoryData.lowStockCount} Low Stock`, // Showing actionable data
      trend: inventoryData.lowStockCount > 0 ? "down" : ("up" as const), // Red trend if low stock
      icon: Package,
    },
    {
      title: "Total Customers",
      value: MOCK_CUSTOMERS.toString(),
      change: "+3.2%",
      trend: "up" as const,
      icon: Users,
    },
  ];

  const subStats = [
    {
      title: "Brands",
      value: brands.length,
      icon: Tag,
    },
    {
      title: "Categories",
      value: categories.length,
      icon: Layers,
    },
    {
      title: "Stock Alerts",
      value: inventoryData.lowStockCount,
      icon: AlertTriangle,
      color: "text-red-500", // Highlight specific metric
    },
    {
      title: "Enquiries",
      value: 12, // Mock
      icon: MessageSquare,
    },
    {
      title: "Newsletter",
      value: 450, // Mock
      icon: Mail,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-blue-600">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Store overview and real-time inventory metrics.
        </p>
      </div>

      {/* TOP ROW STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
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
          );
        })}
      </div>

      {/* SECOND ROW SUB-STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {subStats.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-blue-50">
                  <stat.icon
                    className={`h-5 w-5 ${stat.color || "text-blue-600"}`}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* RECENT ORDERS (MOCK) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-600">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TOP PRODUCTS (REAL DATA - NEWEST) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-600">New Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryData.recent.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt="p"
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-blue-600" />
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
                    <span className="text-sm font-bold">${product.price}</span>
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
            <CardTitle className="text-blue-600">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .filter((p) => p.stock < 10)
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product._id}
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
              {products.filter((p) => p.stock < 10).length === 0 && (
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
  );
}
