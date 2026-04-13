"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  Trash2,
  Building2,
  Package,
  Loader2,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useProducts, useDeleteProduct } from "@/hooks/api/useProducts" // Updated import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { toast } from "sonner";

export default function ProductsPage() {
  // 1. Fetching data with React Query
  const { data: products = [], isLoading } = useProducts()
  const deleteMutation = useDeleteProduct()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : []

  const analytics = useMemo(() => {
    const totalValue = productsArray.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0,
    )
    const lowStock = productsArray.filter((p) => (p.stock ?? 0) < 10).length
    const active = productsArray.filter((p) => p.status).length

    return {
      total: productsArray.length,
      totalValue,
      lowStock,
      active,
    }
  }, [productsArray])

  // Helper to handle both populated and unpopulated fields
  const getLabel = (field: any) =>
    typeof field === "object" ? field?.name : field

  // 2. Dynamic Categories from DB products
  const categories = useMemo(() => {
    const unique = new Set(productsArray.map((p) => getLabel(p.category)))
    return Array.from(unique).filter(Boolean).sort()
  }, [productsArray])

  // 3. Filtering logic
  const filteredProducts = productsArray.filter((product) => {
    const name = product.name.toLowerCase()
    const brand = getLabel(product.brand)?.toLowerCase() || ""
    const category = getLabel(product.category)

    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      brand.includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id)
        // Toast is handled in the hook's onSuccess
      } catch (error) {
        // Error is handled in the hook's onError
      }
    }
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory ({filteredProducts.length} showing)
          </p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-accent-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique items in catalog
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Value
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377;
              {analytics.totalValue.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total value of stock
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items below threshold
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Listings
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visible to customers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or brand..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow key="no-products">
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 opacity-20" />
                    <p>No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product._id || product.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/products/${product._id || product.id}`}
                        className="text-accent-blue hover:underline"
                      >
                        {product.name}
                      </Link>
                      <span className="text-xs text-muted-foreground font-normal">
                        {product.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-lg border bg-muted">
                        {typeof product.brand === "object" &&
                        product.brand.logo ? (
                          <AvatarImage
                            src={product.brand.logo}
                            alt={product.brand.name}
                            className="object-contain p-1"
                          />
                        ) : null}
                        <AvatarFallback className="rounded-lg bg-transparent">
                          <Building2 className="h-4 w-4 text-muted-foreground/50" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-muted-foreground">
                        {getLabel(product.brand)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {getLabel(product.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className=" font-medium">
                        &#8377;
                        {product.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      {product.hsn && (
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          HSN: {product.hsn}
                        </span>
                      )}
                      {product.tax !== undefined && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          GST: {product.tax}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        (product.stock ?? 0) < 10
                          ? "text-red-600 font-bold"
                          : ""
                      }
                    >
                      {product.stock ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status ? "success" : "secondary"}>
                      {product.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/products/${product._id || product.id}`}
                          >
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/products/edit/${product._id || product.id}`}
                          >
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            handleDelete(
                              product._id || product.id || "",
                              product.name,
                            )
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
