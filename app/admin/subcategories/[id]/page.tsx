"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useSubcategory } from "@/hooks/api/useSubcategories"
import { useCategories } from "@/hooks/api/useCategories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronLeft,
  Edit,
  Trash2,
  FolderTree,
  Layers,
  Calendar,
  Package,
} from "lucide-react"
import Link from "next/link"
import { useDeleteSubcategory } from "@/hooks/api/useSubcategories"

export default function SubcategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: subcategory, isLoading } = useSubcategory(id)
  const { data: categories = [] } = useCategories()
  const deleteMutation = useDeleteSubcategory()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${subcategory?.name}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          router.push("/admin/subcategories")
        },
      })
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  if (!subcategory) return <div className="p-6">Subcategory not found</div>

  const parentCategory = categories.find(
    (c) => c._id === subcategory.category || c.id === subcategory.category,
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/subcategories">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {subcategory.name}
            </h1>
            <p className="text-sm text-muted-foreground">/{subcategory.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
            <Link href={`/admin/subcategories/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subcategory Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border rounded-md">
                  <AvatarImage
                    src={subcategory.image}
                    className="object-contain p-2"
                  />
                  <AvatarFallback className="rounded-md">
                    <FolderTree className="h-10 w-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{subcategory.name}</h3>
                  <p className="text-muted-foreground">/{subcategory.slug}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="mt-1">{subcategory.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Category
                </label>
                {parentCategory ? (
                  <Link
                    href={`/admin/categories/${parentCategory._id || parentCategory.id}`}
                    className="mt-1 block text-accent-blue hover:underline"
                  >
                    {parentCategory.name}
                  </Link>
                ) : (
                  <p className="mt-1 text-muted-foreground italic">None</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Badge variant={subcategory.status ? "default" : "secondary"}>
                  {subcategory.status ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Products</p>
                  <p className="text-2xl font-bold">
                    {subcategory.productCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subcategory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subcategory.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
