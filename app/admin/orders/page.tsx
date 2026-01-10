"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter, Eye } from "lucide-react";
import Link from "next/link";
import { useData } from "@/lib/data-context";

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

export default function OrdersPage() {
  const { orders } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage customer orders
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="order_placed">Order Placed</SelectItem>
            <SelectItem value="accepted_order_by_seller">Accepted Order by Seller</SelectItem>
            <SelectItem value="order_rejected_by_seller">Order Rejected by Seller</SelectItem>
            <SelectItem value="order_cancelled_by_customer">Order Cancelled by Customer</SelectItem>
            <SelectItem value="order_packed">Order Packed</SelectItem>
            <SelectItem value="order_shipped">Order Shipped</SelectItem>
            <SelectItem value="order_delivered">Order Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/orders/${order.id}`} className="hover:underline text-blue-600">
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[order.status as keyof typeof statusVariants]}>
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-blue-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/orders/${order.id}`} >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem>Print Invoice</DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}