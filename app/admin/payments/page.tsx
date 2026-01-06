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
import { MoreHorizontal, Search, Filter, Download } from "lucide-react";

const mockPayments = [
  {
    id: "PAY-1001",
    orderId: "ORD-1001",
    customer: "John Doe",
    date: "2024-01-05",
    amount: 249.99,
    method: "credit_card",
    status: "completed",
    transactionId: "txn_1A2B3C4D5E",
  },
  {
    id: "PAY-1002",
    orderId: "ORD-1002",
    customer: "Jane Smith",
    date: "2024-01-05",
    amount: 149.99,
    method: "paypal",
    status: "pending",
    transactionId: "txn_2B3C4D5E6F",
  },
  {
    id: "PAY-1003",
    orderId: "ORD-1003",
    customer: "Bob Johnson",
    date: "2024-01-04",
    amount: 399.99,
    method: "credit_card",
    status: "completed",
    transactionId: "txn_3C4D5E6F7G",
  },
  {
    id: "PAY-1004",
    orderId: "ORD-1004",
    customer: "Alice Williams",
    date: "2024-01-04",
    amount: 89.99,
    method: "debit_card",
    status: "processing",
    transactionId: "txn_4D5E6F7G8H",
  },
  {
    id: "PAY-1005",
    orderId: "ORD-1005",
    customer: "Charlie Brown",
    date: "2024-01-03",
    amount: 199.99,
    method: "credit_card",
    status: "failed",
    transactionId: "txn_5E6F7G8H9I",
  },
];

const statusVariants = {
  completed: "default",
  pending: "secondary",
  processing: "default",
  failed: "destructive",
  refunded: "secondary",
} as const;

const methodLabels = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
} as const;

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage payment transactions
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
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
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.orderId}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell className="font-medium">
                  ${payment.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {methodLabels[payment.method as keyof typeof methodLabels]}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[payment.status as keyof typeof statusVariants]}>
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Order</DropdownMenuItem>
                      <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Issue Refund
                      </DropdownMenuItem>
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