"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  Layers, 
  Tag, 
  Mail, 
  Phone, 
  Calendar,
  CreditCard,
  User as UserIcon,
  Search,
  ExternalLink,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { customers, orders, products, categories, brands } = useData();
  const customerId = params.id as string;

  const customer = useMemo(() => 
    customers.find((c) => c.id === customerId),
    [customers, customerId]
  );

  const customerOrders = useMemo(() => 
    orders.filter((o) => o.customer === customer?.name),
    [orders, customer]
  );

  const addressGroups = useMemo(() => {
    if (!customer) return { billing: [], shipping: [] };
    
    const billing = (customer.addresses || [])
      .filter((a: any) => a.type === 'billing')
      .sort((a: any, b: any) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    
    const shipping = (customer.addresses || [])
      .filter((a: any) => a.type === 'shipping' || a.type === 'delivery')
      .sort((a: any, b: any) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    
    return { billing, shipping };
  }, [customer]);

  const stats = useMemo(() => {
    if (!customer) return null;

    const productIds = Array.from(new Set(customerOrders.flatMap(o => o.productIds || [])));
    const boughtProducts = products.filter(p => productIds.includes(p.id));
    const boughtCategories = Array.from(new Set(boughtProducts.map(p => p.category)));
    const boughtBrands = Array.from(new Set(boughtProducts.map(p => p.brand)));

    return {
      totalOrders: customerOrders.length,
      totalSpent: customerOrders.reduce((sum, o) => sum + o.total, 0),
      totalProducts: productIds.length,
      totalCategories: boughtCategories.length,
      totalBrands: boughtBrands.length,
      boughtProducts,
      boughtCategories,
      boughtBrands
    };
  }, [customer, customerOrders, products]);

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold">Customer not found</h2>
        <Button variant="link" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Customer Details</h1>
            <p className="text-muted-foreground mt-1">
              Viewing profile and purchase history for {customer.name}
            </p>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button>
            Edit Profile
          </Button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-border/50 shadow-sm">
          <CardHeader className="flex flex-col items-center pb-2">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="bg-accent-blue/10 text-accent-blue text-2xl">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{customer.name}</CardTitle>
            <Badge variant={customer.status === "active" ? "default" : "secondary"} className="mt-2">
              {customer.status === "active" ? "Active Customer" : "Inactive Customer"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-md bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email Address</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-md bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone Number</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-md bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Joined Date</p>
                <p className="font-medium">{customer.joinedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime orders placed</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">&#8377;{stats?.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Gross revenue from customer</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories Explored</CardTitle>
              <Layers className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCategories}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique categories ordered</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Brands Preferred</CardTitle>
              <Tag className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBrands}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique brands purchased</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4 pt-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>All orders placed by this customer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.length > 0 ? (
                    customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link className="text-blue-600" href={`/admin/orders/${order.id}`}>
                            {order.id}
                          </Link>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>{order.items} items</TableCell>
                        <TableCell className="text-right">&#8377;{order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No orders found for this customer.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 pt-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Ordered Products</CardTitle>
              <CardDescription>List of unique products this customer has purchased.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.boughtProducts && stats.boughtProducts.length > 0 ? (
                    stats.boughtProducts.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell className="text-right">&#8377;{product.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No products purchased yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 pt-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Interests by Category</CardTitle>
              <CardDescription>Categories this customer is interested in based on purchases.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats?.boughtCategories && stats.boughtCategories.length > 0 ? (
                  stats.boughtCategories.map((catName: string) => {
                    const count = stats.boughtProducts.filter((p: any) => p.category === catName).length;
                    return (
                      <div key={catName} className="p-4 rounded-lg border border-border/50 bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Layers className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">{catName}</span>
                        </div>
                        <Badge variant="secondary">{count} products</Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center col-span-3 py-8 text-muted-foreground italic">No category data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-4 pt-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Preferred Brands</CardTitle>
              <CardDescription>Brands this customer has purchased from.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats?.boughtBrands && stats.boughtBrands.length > 0 ? (
                  stats.boughtBrands.map((brandName: string) => {
                    const count = stats.boughtProducts.filter((p: any) => p.brand === brandName).length;
                    return (
                      <div key={brandName} className="p-4 rounded-lg border border-border/50 bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-orange-600" />
                          <span className="font-medium">{brandName}</span>
                        </div>
                        <Badge variant="secondary">{count} items</Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center col-span-3 py-8 text-muted-foreground italic">No brand data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-md bg-blue-50">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Billing Addresses</h3>
              </div>
              {addressGroups.billing.length > 0 ? (
                addressGroups.billing.map((addr: any, index: number) => (
                  <Card key={index} className={cn("border-border/50 shadow-sm transition-all hover:border-blue-200", addr.isDefault && "border-blue-500/30 bg-blue-50/10")}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase bg-muted/50">Billing</Badge>
                        {addr.isDefault && (
                          <Badge className="bg-blue-600 text-[10px] uppercase">Default</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{addr.street}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-sm text-muted-foreground">{addr.country}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-2 p-8 text-center text-muted-foreground bg-muted/5">
                  <p className="text-sm italic">No billing address on file.</p>
                </Card>
              )}
            </div>

            {/* Shipping & Delivery Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-md bg-green-50">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Shipping & Delivery Addresses</h3>
              </div>
              {addressGroups.shipping.length > 0 ? (
                addressGroups.shipping.map((addr: any, index: number) => (
                  <Card key={index} className={cn("border-border/50 shadow-sm transition-all hover:border-green-200", addr.isDefault && "border-green-500/30 bg-green-50/10")}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase bg-muted/50 capitalize">{addr.type}</Badge>
                        {addr.isDefault && (
                          <Badge className="bg-green-600 text-[10px] uppercase">Primary</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{addr.street}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-sm text-muted-foreground">{addr.country}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-2 p-8 text-center text-muted-foreground bg-muted/5">
                  <p className="text-sm italic">No shipping addresses on file.</p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
