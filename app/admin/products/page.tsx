"use client"

import { useState, useMemo, useEffect, useRef } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
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
import { useProducts, useDeleteProduct } from "@/hooks/api/useProducts"
import { useSubcategories } from "@/hooks/api/useSubcategories"
import { useBrands } from "@/hooks/api/useBrands"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
// import { toast } from "sonner";

// Skeleton loading state components
const TableSkeleton = ({ limit }: { limit: number }) => (
  <>
    {Array.from({ length: limit }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-[200px]" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-[80px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[60px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[40px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-[60px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-8" />
        </TableCell>
      </TableRow>
    ))}
  </>
)

const AnalyticsCardsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-3 w-[140px] mt-2" />
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function ProductsPage() {
  // Pagination state
  const [page, setPage] = useState(1)
  const limit = 20

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page when filters change (using ref to track and update synchronously)
  const prevFiltersRef = useRef({
    debouncedSearch,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
  })
  const pageRef = useRef(page)

  // Update pageRef when page state changes (for pagination controls)
  useEffect(() => {
    pageRef.current = page
  }, [page])

  useEffect(() => {
    const prev = prevFiltersRef.current
    const filtersChanged =
      prev.debouncedSearch !== debouncedSearch ||
      prev.categoryFilter !== categoryFilter ||
      prev.subcategoryFilter !== subcategoryFilter ||
      prev.brandFilter !== brandFilter

    if (filtersChanged) {
      pageRef.current = 1
      prevFiltersRef.current = {
        debouncedSearch,
        categoryFilter,
        subcategoryFilter,
        brandFilter,
      }
      // Force a re-render to pick up the new page value
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1)
    }
  }, [debouncedSearch, categoryFilter, subcategoryFilter, brandFilter])

  // 1. Fetching data with React Query (paginated)
  const { data: productsData, isLoading } = useProducts({
    page,
    limit,
    search: debouncedSearch,
    category: categoryFilter,
    subcategory: subcategoryFilter,
    brand: brandFilter,
  })
  const deleteMutation = useDeleteProduct()
  const { data: subcategories = [] } = useSubcategories()
  const { data: brands = [] } = useBrands()

  const products = productsData?.data || []
  const pagination = productsData?.pagination || { total: 0, pages: 0 }

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

  // 2. Dynamic Categories from DB products (use subcategories hook for full list)
  const categories = useMemo(() => {
    const unique = new Set(productsArray.map((p) => getLabel(p.category)))
    return Array.from(unique).filter(Boolean).sort()
  }, [productsArray])

  // 3. Dynamic Subcategories from DB
  const subcategoriesList = useMemo(() => {
    const unique = new Set(productsArray.map((p) => getLabel(p.subcategory)))
    return Array.from(unique).filter(Boolean).sort()
  }, [productsArray])

  // 4. Dynamic Brands from DB
  const brandsList = useMemo(() => {
    const unique = new Set(productsArray.map((p) => getLabel(p.brand)))
    return Array.from(unique).filter(Boolean).sort()
  }, [productsArray])

  // 5. Products are now filtered server-side, so we use the paginated results directly
  const filteredProducts = productsArray

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory ({pagination.total} total,{" "}
            {filteredProducts.length} showing)
          </p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <AnalyticsCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-accent-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
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
                {formatCurrency(analytics.totalValue, { showDecimals: false })}
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
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, brand, category, subcategory..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
        <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Subcategories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subcategories</SelectItem>
            {subcategoriesList.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brandsList.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto max-w-[85vw] md:max-w-[90vw] lg:max-w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton limit={limit} />
            ) : filteredProducts.length === 0 ? (
              <TableRow key="no-products">
                <TableCell
                  colSpan={8}
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
                    {product.subcategory ? (
                      <Badge variant="secondary" className="font-normal">
                        {getLabel(product.subcategory)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className=" font-medium">
                        {formatCurrency(product.price)}
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {pagination.pages} ({pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8"
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
