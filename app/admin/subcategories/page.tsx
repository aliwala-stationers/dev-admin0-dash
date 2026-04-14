"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Search,
  Trash2,
  FolderTree,
  Layers,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import {
  useSubcategories,
  useDeleteSubcategory,
} from "@/hooks/api/useSubcategories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"
import { useCategories } from "@/hooks/api/useCategories"

export default function SubcategoriesPage() {
  const { data: subcategories = [], isLoading } = useSubcategories()
  const { data: categories = [] } = useCategories()
  const deleteMutation = useDeleteSubcategory()
  const [searchQuery, setSearchQuery] = useState("")

  const subcategoriesArray = Array.isArray(subcategories) ? subcategories : []
  const categoriesArray = Array.isArray(categories) ? categories : []

  const analytics = useMemo(() => {
    const active = subcategoriesArray.filter((s) => s.status).length
    const totalProducts = subcategoriesArray.reduce(
      (sum, s) => sum + (s.productCount || 0),
      0,
    )
    const topSubcategory = [...subcategoriesArray].sort(
      (a, b) => (b.productCount || 0) - (a.productCount || 0),
    )[0]

    return {
      total: subcategoriesArray.length,
      active,
      totalProducts,
      topSubcategory: topSubcategory?.name || "N/A",
    }
  }, [subcategoriesArray])

  const filteredSubcategories = subcategoriesArray.filter((subcategory) =>
    subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div className="p-6">Loading subcategories...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Subcategories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your products by subcategories ({subcategories.length}{" "}
            total)
          </p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
          <Link href="/admin/subcategories/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Subcategory
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subcategories
            </CardTitle>
            <FolderTree className="h-4 w-4 text-accent-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Product sub-groupings
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subcategories
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Enabled for catalog
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Linked Products
            </CardTitle>
            <Layers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items with subcategories
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Subcategory
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {analytics.topSubcategory}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most items linked
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subcategories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto max-w-[85vw] md:max-w-[90vw] lg:max-w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subcategory Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubcategories.length === 0 ? (
              <TableRow key="no-subcategories">
                <TableCell colSpan={7} className="h-24 text-center">
                  No subcategories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubcategories.map((subcategory) => {
                const parentCategory = categoriesArray.find(
                  (c) =>
                    c._id === subcategory.category ||
                    c.id === subcategory.category,
                )
                return (
                  <TableRow key={subcategory._id || subcategory.id}>
                    <TableCell>
                      <Link
                        href={`/admin/subcategories/${subcategory._id || subcategory.id}`}
                        className="text-accent-blue hover:underline flex items-center gap-3"
                      >
                        <Avatar className="h-10 w-10 border rounded-md">
                          <AvatarImage
                            src={subcategory.image}
                            className="object-contain p-1"
                          />
                          <AvatarFallback className="rounded-md">
                            <FolderTree className="h-5 w-5 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{subcategory.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      /{subcategory.slug}
                    </TableCell>
                    <TableCell>
                      {parentCategory ? (
                        <Link
                          href={`/admin/categories/${parentCategory._id || parentCategory.id}`}
                          className="text-muted-foreground hover:text-accent-blue hover:underline"
                        >
                          {parentCategory.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground italic">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {subcategory.description}
                    </TableCell>

                    <TableCell className="font-medium">
                      {subcategory.productCount || 0}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={subcategory.status ? "default" : "secondary"}
                      >
                        {subcategory.status ? "Active" : "Inactive"}
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
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/subcategories/${subcategory._id || subcategory.id}`}
                            >
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/subcategories/edit/${subcategory._id || subcategory.id}`}
                            >
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDelete(
                                subcategory._id || subcategory.id || "",
                                subcategory.name,
                              )
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
