"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Tag,
  CreditCard,
  MessageSquare,
  Mail,
} from "lucide-react";
import { useData } from "@/lib/data-context";

export default function DashboardPage() {
  const { 
    products, 
    categories, 
    brands, 
    orders, 
    customers, 
    payments, 
    enquiries, 
    newsletterSubscribers 
  } = useData();

  // Calculate stats
  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+20.1%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      change: "+15.3%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: products.length.toString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Package,
    },
    {
      title: "Total Customers",
      value: customers.length.toString(),
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
      title: "Payments",
      value: payments.length,
      icon: CreditCard,
    },
    {
      title: "Enquiries",
      value: enquiries.length,
      icon: MessageSquare,
    },
    {
      title: "Newsletter",
      value: newsletterSubscribers.length,
      icon: Mail,
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const topProducts = [...products]
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      sold: Math.floor(Math.random() * 50) + 10, // Mocked sold count for now
    }));

  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-accent-blue">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={stat.title} className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-accent-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <TrendIcon
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
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {subStats.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-accent-blue/10">
                  <stat.icon className="h-5 w-5 text-accent-blue" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-accent-blue">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
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

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-accent-blue">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-blue/10">
                      <Package className="h-5 w-5 text-accent-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sold} sold
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-accent-blue">Recent Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnquiries.length > 0 ? (
                recentEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex flex-col border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate max-w-[150px]">{enquiry.subject}</p>
                      <Badge variant={enquiry.status === 'new' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">
                        {enquiry.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {enquiry.name}: {enquiry.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent enquiries</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}