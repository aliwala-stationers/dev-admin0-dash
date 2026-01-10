"use client";

import { useMemo, useState } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter, Eye, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

type OrderRow = {
  id: string;
  customer: string;
  date: string;
  lastUpdated?: string;
  items: number;
  total: number;
  status: keyof typeof statusLabels;
};

export default function OrdersPage() {
  const { orders } = useData();
  const data = useMemo(() => orders as OrderRow[], [orders]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order ID
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/orders/${row.original.id}`}
            className="hover:underline text-blue-600"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "customer",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Placed On
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
      },
      {
        id: "lastUpdated",
        accessorFn: (row) => row.lastUpdated || row.date,
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Updated
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {row.original.lastUpdated || row.original.date}
          </span>
        ),
      },
      {
        accessorKey: "items",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Items
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
      },
      {
        accessorKey: "total",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => `$${row.original.total.toFixed(2)}`,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <Badge
            variant={
              statusVariants[row.original.status as keyof typeof statusVariants]
            }
          >
            {statusLabels[row.original.status as keyof typeof statusLabels]}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          return row.getValue(id) === value;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-600">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                <DropdownMenuItem asChild>
                  <Link href={`/admin/orders/${row.original.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Print Invoice</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim();
      if (!q) return true;
      const id = String(row.original.id ?? "").toLowerCase();
      const customer = String(row.original.customer ?? "").toLowerCase();
      return id.includes(q) || customer.includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    table.getColumn("status")?.setFilterValue(value);
  };

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
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.id === "actions" ? "text-right" : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "actions" ? "text-right" : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}