"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  FolderTree, 
  Package, 
  Clock,
  ExternalLink,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useData, Category } from "@/lib/data-context";

export default function ViewCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getCategory, products } = useData();
  const [category, setCategory] = useState<Category | undefined>(undefined);

  useEffect(() => {
    setCategory(getCategory(id));
  }, [id, getCategory]);

  if (!category) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Category not found</h2>
        <Button variant="link" asChild>
          <Link href="/admin/categories">Back to categories</Link>
        </Button>
      </div>
    );
  }

  // Get products in this category
  const categoryProducts = products.filter(p => p.category === category.name);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/categories">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">{category.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={category.status ? "default" : "secondary"}>
                {category.status ? "ACTIVE" : "INACTIVE"}
              </Badge>
              <span className="text-sm text-muted-foreground">Slug: /{category.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/categories/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </Link>
          </Button>
          <Button className="bg-accent-blue hover:bg-accent-blue-hover">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Store
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Description & Overview */}
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

          <Card>
            <CardHeader>
              <CardTitle>Products in {category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No products assigned to this category yet.
                  </p>
                ) : (
                  categoryProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}`}>View</Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
              {categoryProducts.length > 5 && (
                <Button variant="link" className="w-full mt-4 text-accent-blue" asChild>
                  <Link href={`/admin/products?category=${category.name}`}>
                    View All {categoryProducts.length} Products
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Total Products</span>
                </div>
                <span className="font-semibold">{categoryProducts.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  <span className="text-sm">Sub-categories</span>
                </div>
                <span className="font-medium">0</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-xs">{category.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}