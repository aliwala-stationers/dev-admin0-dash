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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
} from "lucide-react"
import Link from "next/link"
import { useProducts, useDeleteProduct } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useSubcategories } from "@/hooks/api/useSubcategories"
import { useBrands } from "@/hooks/api/useBrands"
import { useProductAnalytics } from "@/hooks/api/useProductAnalytics"
import { useDebounce } from "@/hooks/useDebounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, cn } from "@/lib/utils"
import {
  TypographyH1,
  TypographyP,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography"

// --- SKELETONS ---
const TableSkeleton = ({ limit }: { limit: number }) => (
  <>
    {Array.from({ length: limit }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-[80px]" />
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-3 w-[40px]" />
          </div>
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
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="border-border/50 shadow-sm overflow-hidden">
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

// --- COMPONENTS ---

interface SearchableFilterProps {
  label: string
  items: any[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  icon?: React.ReactNode
}

function SearchableFilter({
  label,
  items,
  value,
  onValueChange,
  placeholder,
  icon,
}: SearchableFilterProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedItem = items.find(
    (item) => (item._id || item.id || item.slug || item.name) === value,
  )

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[200px] justify-between h-10 px-3 font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            {icon}
            <span className="truncate">
              {value === "all" ? label : selectedItem?.name || value}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onValueChange("all")
                  setOpen(false)
                  setSearch("")
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "all" ? "opacity-100" : "opacity-0",
                  )}
                />
                All {label}
              </CommandItem>
              {filteredItems.map((item) => {
                const itemId = item._id || item.id || item.slug || item.name
                return (
                  <CommandItem
                    key={itemId}
                    value={item.name}
                    onSelect={() => {
                      onValueChange(itemId)
                      setOpen(false)
                      setSearch("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === itemId ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const limit = 15

  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")

  const debouncedSearch = useDebounce(globalFilter, 300)

  // API Params
  const apiParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch,
      category: categoryFilter === "all" ? "" : categoryFilter,
      subcategory: subcategoryFilter === "all" ? "" : subcategoryFilter,
      brand: brandFilter === "all" ? "" : brandFilter,
      sortField: sorting[0]?.id || "createdAt",
      sortOrder: (sorting[0]?.desc ? "desc" : "asc") as "desc" | "asc",
    }
  }, [
    page,
    limit,
    debouncedSearch,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
    sorting,
  ])

  // Data fetching
  const { data: productsData, isLoading } = useProducts(apiParams)
  const { data: categories = [] } = useCategories()
  const { data: subcategories = [] } = useSubcategories()
  const { data: brands = [] } = useBrands()
  const { data: analytics, isLoading: analyticsLoading } = useProductAnalytics()
  const deleteMutation = useDeleteProduct()

  const products = productsData?.data || []
  const pagination = productsData?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    pages: 0,
  }

  // --- PAGINATION RESET LOGIC ---
  const prevFiltersRef = useRef({
    debouncedSearch,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
  })

  useEffect(() => {
    const prev = prevFiltersRef.current
    const filtersChanged =
      prev.debouncedSearch !== debouncedSearch ||
      prev.categoryFilter !== categoryFilter ||
      prev.subcategoryFilter !== subcategoryFilter ||
      prev.brandFilter !== brandFilter

    if (filtersChanged) {
      setPage(1)
    }
    prevFiltersRef.current = {
      debouncedSearch,
      categoryFilter,
      subcategoryFilter,
      brandFilter,
    }
  }, [debouncedSearch, categoryFilter, subcategoryFilter, brandFilter])

  // --- HELPERS ---
  const getLabel = useCallback((field: any) => {
    if (!field) return ""
    return typeof field === "object" ? field.name : field
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteMutation.mutateAsync(id)
    }
  }

  // --- COLUMNS ---
  const columns = useMemo<ColumnDef<(typeof products)[0]>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original
          const firstImage = product.images?.[0]
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded border bg-muted overflow-hidden flex-shrink-0">
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <Link
                  href={`/admin/products/${product._id || product.id}`}
                  className="font-medium text-accent-blue hover:underline truncate"
                >
                  {product.name}
                </Link>
                <TypographySmall className="text-muted-foreground font-normal truncate">
                  SKU: {product.sku}
                </TypographySmall>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit font-normal">
              {getLabel(row.original.category)}
            </Badge>
            {row.original.subcategory && (
              <span className="text-[10px] text-muted-foreground">
                {getLabel(row.original.subcategory)}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => {
          const brand = row.original.brand
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 rounded border bg-muted">
                {typeof brand === "object" && brand.logo ? (
                  <AvatarImage
                    src={brand.logo}
                    alt={brand.name}
                    className="object-contain p-0.5"
                  />
                ) : null}
                <AvatarFallback className="rounded bg-transparent text-[10px]">
                  {getLabel(brand)?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate">
                {getLabel(brand)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "price",
        header: "Pricing",
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">
                  {formatCurrency(p.b2cPrice || p.price)}
                </span>
                {p.salePrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(p.price)}
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                {p.mrp && <span>MRP: {formatCurrency(p.mrp)}</span>}
                {p.tax !== undefined && <span>GST: {p.tax}%</span>}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
          const stock = row.original.stock ?? 0
          const isLow = stock > 0 && stock < 10
          const isOut = stock === 0
          return (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-medium",
                  isOut ? "text-destructive" : isLow ? "text-amber-600" : "",
                )}
              >
                {stock}
              </span>
              {isLow && <AlertTriangle className="h-3 w-3 text-amber-600" />}
              {isOut && <AlertTriangle className="h-3 w-3 text-destructive" />}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status ? "success" : "secondary"}>
            {row.original.status ? "Active" : "Draft"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/products/${product._id || product.id}`}>
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/products/edit/${product._id || product.id}`}
                    >
                      Edit Product
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
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [deleteMutation, getLabel],
  )

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
  })

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <TypographyH1 className="text-3xl lg:text-3xl">Products</TypographyH1>
          <TypographyMuted>
            Manage your inventory, pricing, and product visibility.
          </TypographyMuted>
        </div>
        <Button
          className="bg-accent-blue hover:bg-accent-blue/90 shadow-sm transition-all"
          asChild
        >
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      {/* --- ANALYTICS --- */}
      {analyticsLoading ? (
        <AnalyticsCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/40 shadow-none bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Catalog
              </CardTitle>
              <Package className="h-4 w-4 text-accent-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.totalProducts || 0}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span>Across {categories.length} categories</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-none bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inventory Value
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.totalInventoryValue || 0)}
              </div>
              <TypographyMuted className="text-[10px] mt-1">
                Based on cost price
              </TypographyMuted>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-none bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.lowStockCount || 0}
              </div>
              <TypographyMuted className="text-[10px] mt-1">
                Items below 10 units
              </TypographyMuted>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-none bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.outOfStockCount || 0}
              </div>
              <TypographyMuted className="text-[10px] mt-1">
                Needs immediate restock
              </TypographyMuted>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- FILTERS --- */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or tags..."
              className="pl-10 h-10"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchableFilter
              label="Category"
              items={categories}
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              placeholder="Search categories..."
              icon={<Filter className="h-3.5 w-3.5" />}
            />
            <SearchableFilter
              label="Subcategory"
              items={
                categoryFilter !== "all"
                  ? subcategories.filter((s: any) => {
                      const subCatId =
                        typeof s.category === "object"
                          ? s.category?._id || s.category?.id
                          : s.category
                      return subCatId === categoryFilter
                    })
                  : subcategories
              }
              value={subcategoryFilter}
              onValueChange={setSubcategoryFilter}
              placeholder="Search subcategories..."
              icon={<Layers className="h-3.5 w-3.5 text-muted-foreground" />}
            />
            <SearchableFilter
              label="Brand"
              items={brands}
              value={brandFilter}
              onValueChange={setBrandFilter}
              placeholder="Search brands..."
              icon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
            />
            {(categoryFilter !== "all" ||
              subcategoryFilter !== "all" ||
              brandFilter !== "all" ||
              globalFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all")
                  setSubcategoryFilter("all")
                  setBrandFilter("all")
                  setGlobalFilter("")
                }}
                className="text-muted-foreground hover:text-foreground h-10 px-3"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- TABLE --- */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-12 text-xs font-semibold uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none hover:text-foreground transition-colors",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                      <Package className="h-12 w-12" />
                      <TypographyP className="m-0">
                        No products found matching your criteria.
                      </TypographyP>
                      <Button
                        variant="link"
                        onClick={() => {
                          setCategoryFilter("all")
                          setSubcategoryFilter("all")
                          setBrandFilter("all")
                          setGlobalFilter("")
                        }}
                      >
                        Reset all filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors border-border/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
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

        {/* --- PAGINATION FOOTER --- */}
        <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <TypographySmall className="text-muted-foreground">
            Showing <span className="font-medium">{products.length}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> products
          </TypographySmall>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="h-8 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }).map(
                (_, i) => {
                  let pageNum = page
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
                      key={i}
                      variant={page === pageNum ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => setPage(pageNum)}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </Button>
                  )
                },
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages || isLoading}
              className="h-8 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
