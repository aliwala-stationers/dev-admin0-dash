"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  Package, 
  Tag, 
  BarChart3, 
  Layers, 
  Clock,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useData, Product } from "@/lib/data-context";

export default function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getProduct } = useData();
  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    setProduct(getProduct(id));
  }, [id, getProduct]);

  if (!product) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Button variant="link" asChild>
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={product.status ? "default" : "secondary"}>
                {product.status ? "ACTIVE" : "INACTIVE"}
              </Badge>
              <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/products/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
          <Button className="bg-accent-blue hover:bg-accent-blue-hover">
            <Eye className="mr-2 h-4 w-4" />
            View Storefront
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((url, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img src={url} alt={`Product ${index}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm">Price</span>
                </div>
                <span className="font-semibold text-lg">${parseFloat(product.price).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Category</span>
                </div>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Stock</span>
                </div>
                <span className={`font-medium ${parseInt(product.stock) < 10 ? "text-red-500" : "text-green-600"}`}>
                  {product.stock} units
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Added on</span>
                </div>
                <span className="text-xs">{product.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}