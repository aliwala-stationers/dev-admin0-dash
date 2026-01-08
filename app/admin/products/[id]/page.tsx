"use client";

import { use } from "react";
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

// Mock function to get product data
const getProduct = (id: string) => {
  const products = [
    {
      id: "1",
      name: "Wireless Headphones",
      category: "Electronics",
      price: 99.99,
      stock: 45,
      status: "active",
      sku: "WH-001",
      description: "Premium wireless headphones with noise-canceling technology and 40-hour battery life. Perfect for music lovers and professionals alike.",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80"
      ],
      createdAt: "2023-12-01",
      updatedAt: "2024-01-05"
    },
    // ... more products if needed
  ];
  return products.find(p => p.id === id) || products[0];
};

export default function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProduct(id);

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
              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                {product.status.replace("_", " ").toUpperCase()}
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
              <p className="text-muted-foreground leading-relaxed">
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
                <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
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
                <span className={`font-medium ${product.stock < 10 ? "text-red-500" : "text-green-600"}`}>
                  {product.stock} units
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Total Sales</span>
                </div>
                <span className="font-medium">124</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Added on</span>
                </div>
                <span className="text-sm">{product.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}