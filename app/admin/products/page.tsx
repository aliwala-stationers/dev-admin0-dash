"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table"
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
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import Link from "next/link"
import { useInfiniteProducts, useDeleteProduct } from "@/hooks/api/useProducts"
import { useSubcategories } from "@/hooks/api/useSubcategories"
import { useBrands } from "@/hooks/api/useBrands"
import { useProductAnalytics } from "@/hooks/api/useProductAnalytics"
import { useDebounce } from "@/hooks/useDebounce"
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
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-3 w-[140px] mt-2" />
      </CardContent>
    </Card>
  </div>
)

export default function ProductsPage() {
  // Pagination state (for infinite scroll, we still need limit)
  const limit = 20

  // TanStack Table state - single source of truth for UI state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "category", value: "all" },
    { id: "subcategory", value: "all" },
    { id: "brand", value: "all" },
  ])

  // Debounce globalFilter to reduce API calls
  const debouncedGlobalFilter = useDebounce(globalFilter, 300)

  // Normalize columnFilters into a map for O(1) lookups - avoids repeated .find()
  const filterMap = useMemo(() => {
    const map = new Map<string, string>()
    columnFilters.forEach((f) => map.set(f.id, f.value as string))
    return map
  }, [columnFilters])

  // Extract API params from table state - single source of truth for API calls
  // Use stable primitive values to prevent unnecessary re-fetches due to object identity
  const apiParams = useMemo(() => {
    const sortField = sorting[0]?.id || "createdAt"
    const sortOrder: "desc" | "asc" = sorting[0]?.desc ? "desc" : "asc"
    const category = filterMap.get("category") || "all"
    const subcategory = filterMap.get("subcategory") || "all"
    const brand = filterMap.get("brand") || "all"

    // Return object with stable structure - React Query will handle reference equality
    return {
      limit,
      search: debouncedGlobalFilter || "",
      category: category === "all" ? "" : category,
      subcategory: subcategory === "all" ? "" : subcategory,
      brand: brand === "all" ? "" : brand,
      sortField,
      sortOrder,
    }
  }, [sorting, filterMap, debouncedGlobalFilter, limit])

  // Fetch data with React Query (infinite scroll)
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts(apiParams)

  const deleteMutation = useDeleteProduct()
  const { data: subcategories = [] } = useSubcategories()
  const { data: brands = [] } = useBrands()
  const { data: analytics, isLoading: analyticsLoading } = useProductAnalytics()

  // Flatten all pages for table display
  const products = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.data) || [],
    [infiniteData],
  )

  // Get total count from first page
  const pagination = useMemo(
    () => infiniteData?.pages[0]?.pagination || { total: 0, pages: 0 },
    [infiniteData],
  )

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : []

  // Intersection observer for infinite scroll - use ref to prevent recreation on every render
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isFetchingRef = useRef(false) // Guard to prevent duplicate fetchNextPage calls

  useEffect(() => {
    // Clean up previous observer before creating new one
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Guard: only fetch if not already fetching and has next page
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetchingRef.current
        ) {
          isFetchingRef.current = true
          fetchNextPage()
            .catch(() => {
              // Optional: log error, but always reset guard
            })
            .finally(() => {
              isFetchingRef.current = false
            })
        }
      },
      { threshold: 0.1 },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observerRef.current.observe(currentRef)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Analytics: Only show stats that can be accurately calculated from full dataset
  // Note: pagination.total is the full count from API, but other metrics would require full dataset scan
  // For production accuracy, these should come from a dedicated analytics endpoint

  // Helper to handle both populated and unpopulated fields - memoized for stable reference
  const getLabel = useCallback(
    (field: string | { name: string } | null | undefined) => {
      return typeof field === "object" ? field?.name : field
    },
    [],
  )

  // Reusable helper to update a single filter - avoids repeated .map() logic
  const updateFilter = useCallback((id: string, value: string) => {
    setColumnFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f)),
    )
  }, [])

  // Dynamic Categories from DB products - memoized for performance
  const categories = useMemo(() => {
    const unique = new Set(productsArray.map((p) => getLabel(p.category)))
    return Array.from(unique)
      .filter((v): v is string => Boolean(v))
      .sort()
  }, [productsArray, getLabel])

  // Dynamic Subcategories from DB - memoized for performance
  const subcategoriesList = useMemo(() => {
    const unique = new Set(productsArray.map((p) => getLabel(p.subcategory)))
    return Array.from(unique)
      .filter((v): v is string => Boolean(v))
      .sort()
  }, [productsArray, getLabel])

  // Dynamic Brands from DB - memoized for performance
  const brandsList = useMemo(() => {
    const unique = new Set(productsArray.map((p) => getLabel(p.brand)))
    return Array.from(unique)
      .filter((v): v is string => Boolean(v))
      .sort()
  }, [productsArray, getLabel])

  // Products are filtered server-side, so we use the paginated results directly
  const filteredProducts = productsArray

  // Define columns for TanStack Table - memoized for stable reference
  const columns = useMemo<ColumnDef<(typeof productsArray)[0]>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product Name",
        cell: (info) => (
          <div className="flex flex-col">
            <Link
              href={`/admin/products/${info.row.original._id || info.row.original.id}`}
              className="text-accent-blue hover:underline"
            >
              {info.getValue() as string}
            </Link>
            <span className="text-xs text-muted-foreground font-normal">
              {info.row.original.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: (info) => {
          const brand = info.row.original.brand
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded-lg border bg-muted">
                {typeof brand === "object" && brand.logo ? (
                  <AvatarImage
                    src={brand.logo}
                    alt={brand.name}
                    className="object-contain p-1"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg bg-transparent">
                  <Building2 className="h-4 w-4 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-muted-foreground">
                {getLabel(brand)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: (info) => (
          <Badge variant="outline" className="font-normal">
            {getLabel(info.getValue() as string | { name: string })}
          </Badge>
        ),
      },
      {
        accessorKey: "subcategory",
        header: "Subcategory",
        cell: (info) => {
          const subcategory = info.row.original.subcategory
          return subcategory ? (
            <Badge variant="secondary" className="font-normal">
              {getLabel(subcategory)}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm italic">None</span>
          )
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: (info) => {
          const product = info.row.original
          return (
            <div className="flex flex-col">
              <span className="font-medium">
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
          )
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: (info) => {
          const stock = info.row.original.stock ?? 0
          return (
            <span className={stock < 10 ? "text-red-600 font-bold" : ""}>
              {stock}
            </span>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <Badge variant={info.row.original.status ? "success" : "secondary"}>
            {info.row.original.status ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const product = info.row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/products/${product._id || product.id}`}>
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
                    handleDelete(product._id || product.id || "", product.name)
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [deleteMutation, getLabel],
  )

  // Set up the table instance with TanStack Table as single source of truth - memoized for stable reference
  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    manualSorting: true, // Server-side sorting
    manualFiltering: true, // Server-side filtering
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

      {isLoading || analyticsLoading ? (
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
              <div className="text-2xl font-bold">
                {analytics?.totalProducts || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique items in catalog
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Inventory Value
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.totalInventoryValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cost basis (full dataset)
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.lowStockCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Items below threshold
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.outOfStockCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Zero stock items
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
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Select
          value={filterMap.get("category") ?? "all"}
          onValueChange={(value) => updateFilter("category", value)}
        >
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
        <Select
          value={filterMap.get("subcategory") ?? "all"}
          onValueChange={(value) => updateFilter("subcategory", value)}
        >
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
        <Select
          value={filterMap.get("brand") ?? "all"}
          onValueChange={(value) => updateFilter("brand", value)}
        >
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.id === "actions"
                        ? "text-right"
                        : header.id === "name"
                          ? "w-[300px]"
                          : ""
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center gap-2 cursor-pointer select-none hover:text-accent-blue transition-colors"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <div className="ml-2">
                            {header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 opacity-20" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton limit={limit} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow key="no-products">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 opacity-20" />
                    <p>No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Infinite scroll loading indicator */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more products...</span>
          </div>
        )}
        {!hasNextPage && productsArray.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing all {productsArray.length} products
          </p>
        )}
      </div>
    </div>
  )
}
