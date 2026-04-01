"use client"

import { use } from "react"
import Link from "next/link"
import { ChevronLeft, Edit, FolderTree, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCategory } from "@/hooks/api/useCategories" // Correct Hook Path
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ViewCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: category, isLoading } = useCategory(id)

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <FolderTree className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Category not found</h2>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Back to categories</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/categories">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border rounded-lg shadow-sm">
              <AvatarImage
                src={category.image}
                className="object-contain p-2"
              />
              <AvatarFallback className="rounded-lg bg-muted">
                <FolderTree className="h-8 w-8 text-muted-foreground/50" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {category.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={category.status ? "success" : "secondary"}>
                  {category.status ? "ACTIVE" : "INACTIVE"}
                </Badge>
                <span className="text-sm text-muted-foreground font-mono">
                  /{category.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
            <Link href={`/admin/categories/edit/${category._id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {category.description}
              </p>
            </CardContent>
          </Card>

          {/* Optional: Add a "Recent Products" list here later */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              {category.productCount && category.productCount > 0 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    This category contains{" "}
                    <strong>{category.productCount}</strong> products.
                  </p>
                  <Button variant="link" asChild>
                    {/* We will build this filter page next */}
                    <Link href={`/admin/products?category=${category._id}`}>
                      View All
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No products assigned to this category yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-accent-blue shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  <span className="text-sm">Total Products</span>
                </div>
                {/* <--- FIX: Use the API field */}
                <span className="font-semibold">
                  {category.productCount || 0}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-xs">
                  {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
