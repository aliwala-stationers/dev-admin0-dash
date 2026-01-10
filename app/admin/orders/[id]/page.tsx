"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Package, 
  User, 
  Calendar, 
  CreditCard,
  Printer,
  Clock,
  Truck,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useData, OrderStatus } from "@/lib/data-context";
import { toast } from "sonner";

// Expanded mock data for detail view
const mockOrderDetails = {
  "ORD-1001": {
    id: "ORD-1001",
    customer: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    date: "2024-01-05",
    total: 249.99,
    status: "delivered",
    paymentStatus: "paid",
    shippingAddress: "123 Main St, New York, NY 10001",
    history: [
      { status: "Order Placed", date: "2024-01-05 10:30 AM", icon: Clock },
      { status: "Packed", date: "2024-01-05 02:15 PM", icon: Package },
      { status: "Shipped", date: "2024-01-06 09:00 AM", icon: Truck },
      { status: "Delivered", date: "2024-01-07 04:30 PM", icon: CheckCircle },
    ],
    items: [
      { id: 1, name: "Wireless Headphones", quantity: 1, price: 99.99 },
      { id: 2, name: "Phone Case", quantity: 2, price: 25.00 },
      { id: 3, name: "USB-C Cable", quantity: 1, price: 100.00 },
    ],
  },
  "ORD-1002": {
    id: "ORD-1002",
    customer: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 987-6543",
    date: "2024-01-05",
    total: 149.99,
    status: "processing",
    paymentStatus: "paid",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
    history: [
      { status: "Order Placed", date: "2024-01-05 11:20 AM", icon: Clock },
      { status: "Packed", date: "2024-01-05 04:00 PM", icon: Package },
    ],
    items: [
      { id: 4, name: "Running Shoes", quantity: 1, price: 120.00 },
      { id: 5, name: "Sports Socks", quantity: 3, price: 10.00 },
    ],
  },
};

const statusVariants = {
  order_placed: "secondary",
  accepted_order_by_seller: "default",
  order_rejected_by_seller: "destructive",
  order_cancelled_by_customer: "destructive",
  order_packed: "default",
  order_shipped: "default",
  order_delivered: "default",
} as const;

const statusLabels = {
  order_placed: "Order Placed",
  accepted_order_by_seller: "Accepted by Seller",
  order_rejected_by_seller: "Rejected by Seller",
  order_cancelled_by_customer: "Cancelled by Customer",
  order_packed: "Order Packed",
  order_shipped: "Order Shipped",
  order_delivered: "Order Delivered",
} as const;

const statusIcons = {
  order_placed: Clock,
  accepted_order_by_seller: CheckCircle2,
  order_rejected_by_seller: XCircle,
  order_cancelled_by_customer: XCircle,
  order_packed: Package,
  order_shipped: Truck,
  order_delivered: CheckCircle,
} as const;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateOrderStatus } = useData();
  const orderId = params.id as string;
  
  const orderFromContext = orders.find(o => o.id === orderId);
  
  // In a real app, you'd fetch this data
  const order = {
    ...(mockOrderDetails[orderId as keyof typeof mockOrderDetails] || {
      id: orderId,
      customer: "Unknown Customer",
      email: "-",
      phone: "-",
      date: "-",
      total: 0,
      status: "order_placed" as OrderStatus,
      paymentStatus: "pending",
      shippingAddress: "-",
      items: [],
    }),
    status: orderFromContext?.status || "order_placed" as OrderStatus,
    history: orderFromContext?.history || []
  };

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.status]);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      updateOrderStatus(order.id, currentStatus);
      setIsSaving(false);
      toast.success("Order status updated successfully");
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAccept = () => {
    setCurrentStatus("accepted_order_by_seller");
    updateOrderStatus(order.id, "accepted_order_by_seller");
    toast.success("Order accepted");
  };

  const handleReject = () => {
    setCurrentStatus("order_rejected_by_seller");
    updateOrderStatus(order.id, "order_rejected_by_seller");
    toast.error("Order rejected");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Print-only Invoice Header */}
      <div className="print-only mb-8">
        <div className="flex justify-between items-start border-b-2 pb-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Aliwala</h1>
            <p className="text-sm text-muted-foreground mt-1">Marketplace Admin Panel</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold">INVOICE</h2>
            <p className="font-medium mt-1">#{order.id}</p>
            <p className="text-sm text-muted-foreground">{order.date}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">Order {order.id}</h1>
              <Badge variant={statusVariants[currentStatus as keyof typeof statusVariants]}>
                {statusLabels[currentStatus as keyof typeof statusLabels]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Placed on {order.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          {currentStatus === "order_placed" && (
            <>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAccept}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Accept Order
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-muted-foreground" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/20 font-semibold">
                    <TableCell colSpan={3} className="text-right">Total Amount</TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {currentStatus !== "order_delivered" && (
            <Card className="no-print border-accent-blue/20">
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
                <CardDescription>Manually override the current order status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Select value={currentStatus} onValueChange={(v) => handleStatusUpdate(v as OrderStatus)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order_placed">Order Placed</SelectItem>
                      <SelectItem value="accepted_order_by_seller">Accepted Order by Seller</SelectItem>
                      <SelectItem value="order_rejected_by_seller">Order Rejected by Seller</SelectItem>
                      <SelectItem value="order_cancelled_by_customer">Order Cancelled by Customer</SelectItem>
                      <SelectItem value="order_packed">Order Packed</SelectItem>
                      <SelectItem value="order_shipped">Order Shipped</SelectItem>
                      <SelectItem value="order_delivered">Order Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  {currentStatus !== order.status && (
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Last updated: Today at 10:45 AM
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStatus === "order_delivered" && (
            <Card className="no-print border-green-200 bg-green-50/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-medium">Order completed. Status updates are now locked.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                {order.history && order.history.length > 0 ? (
                  [...order.history].reverse().map((event, index) => {
                    const Icon = statusIcons[event.status as keyof typeof statusIcons] || Clock;
                    return (
                      <div key={index} className="relative pl-8">
                        <div className="absolute left-0 top-1 p-1 bg-background border rounded-full z-10">
                          <Icon className="h-3 w-3 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {statusLabels[event.status as keyof typeof statusLabels]}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic">No history available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{order.customer}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{order.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{order.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Shipping Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.shippingAddress}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="mt-4">
                <Badge variant="outline" className="w-full justify-center py-1">
                  Payment Status: {order.paymentStatus.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}