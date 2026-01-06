import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "2,350",
    change: "+15.3%",
    trend: "up" as const,
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: "486",
    change: "+12.5%",
    trend: "up" as const,
    icon: Package,
  },
  {
    title: "Total Customers",
    value: "1,234",
    change: "-3.2%",
    trend: "down" as const,
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Order #{1000 + i}</p>
                    <p className="text-xs text-muted-foreground">
                      Customer Name {i}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${(Math.random() * 500 + 50).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Product A", "Product B", "Product C", "Product D"].map(
                (product, i) => (
                  <div key={product} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 100 + 50)} sold
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}