"use client";

import { use } from "react";
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

// Mock function to get category data
const getCategory = (id: string) => {
  const categories = [
    {
      id: "1",
      name: "Electronics",
      slug: "electronics",
      productCount: 45,
      status: "active",
      description: "Electronic devices and gadgets including smartphones, laptops, tablets, and various tech accessories. This category covers high-demand consumer electronics with regular inventory updates.",
      createdAt: "2023-11-15",
      updatedAt: "2024-01-02"
    },
    // ... more categories
  ];
  return categories.find(c => c.id === id) || categories[0];
};

export default function ViewCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const category = getCategory(id);

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
              <Badge variant={category.status === "active" ? "default" : "secondary"}>
                {category.status.toUpperCase()}
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
              <CardTitle>Recent Products in {category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sample Product {i}</p>
                        <p className="text-xs text-muted-foreground">SKU: PROD-00{i}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/products/${i}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4 text-accent-blue" asChild>
                <Link href={`/admin/products?category=${category.name}`}>
                  View All Products in this Category
                </Link>
              </Button>
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
                <span className="font-semibold">{category.productCount}</span>
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