"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Edit, FolderTree, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCategory } from "@/hooks/api/useCategories"; // <--- HOOK

export default function ViewCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: category, isLoading } = useCategory(id);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!category) return <div className="p-6">Category not found</div>;

  // NOTE: Once we build the Products module, we will add a 
  // const { data: products } = useProducts({ category: category.name }) here.
  const categoryProducts: any[] = []; 

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/categories"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">{category.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={category.status ? "default" : "secondary"}>
                {category.status ? "ACTIVE" : "INACTIVE"}
              </Badge>
              <span className="text-sm text-muted-foreground">/{category.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
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
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{category.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Products</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Products module integration pending.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  <span className="text-sm">Total Products</span>
                </div>
                <span className="font-semibold">{categoryProducts.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-xs">{new Date(category.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}