"use client";

import { use } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  Package, 
  Tag, 
  Layers, 
  Clock, 
  Eye, 
  Building2, 
  AlertTriangle,
  Loader2,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// NEW HOOK
import { useProduct } from "@/hooks/api/useProducts";

export default function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // 1. FETCH SINGLE PRODUCT
  const { data: product, isLoading } = useProduct(id);

  // Helper to handle populated objects or ID strings
  const getLabel = (field: any) => (typeof field === "object" && field !== null ? field.name : field);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Package className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={product.status ? "success" : "secondary"}>
                {product.status ? "ACTIVE" : "INACTIVE"}
              </Badge>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-sm text-muted-foreground font-mono">SKU: {product.sku}</span>
                {product.upc && (
                  <span className="text-sm text-muted-foreground font-mono">UPC: {product.upc}</span>
                )}
              </div>
              <span className="text-sm text-muted-foreground italic font-mono">/{product.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
            <Link href={`/admin/products/edit/${product._id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View on Store
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Product Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.images.map((url, index) => (
                  <div 
                    key={index} 
                    className={`rounded-lg overflow-hidden border bg-muted flex items-center justify-center 
                      ${index === 0 && product.images.length % 2 !== 0 ? "sm:col-span-2 aspect-[21/9]" : "aspect-square"}`}
                  >
                    <img 
                      src={url} 
                      alt={`${product.name} view ${index + 1}`} 
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {product.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Product Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden border bg-black shadow-inner">
                  <video 
                    src={product.videoUrl} 
                    className="h-full w-full" 
                    controls 
                    preload="metadata"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Detailed Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {product.barcode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Barcode</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center bg-white rounded-b-lg p-6">
                <img src={product.barcode} alt="Barcode" className="max-h-24 object-contain" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-accent-blue">
            <CardHeader>
              <CardTitle>Inventory & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm">Unit Price</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-2xl text-accent-blue">
                    &#8377;{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex flex-col text-[10px] text-muted-foreground uppercase font-bold mt-1">
                    {product.hsn && <span>HSN: {product.hsn}</span>}
                    {product.tax !== undefined && <span>GST: {product.tax}%</span>}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Brand</span>
                </div>
                {/* 2. SAFE RENDER of Brand Object */}
                <span className="font-medium">{getLabel(product.brand)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Category</span>
                </div>
                {/* 3. SAFE RENDER of Category Object */}
                <Badge variant="outline" className="font-normal">{getLabel(product.category)}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Stock Level</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${product.stock < 10 ? "text-red-500" : "text-green-600"}`}>
                    {product.stock} units
                  </span>
                  {product.stock < 10 && (
                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock Warning
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Created At</span>
                </div>
                <span className="text-xs font-medium">
                  {new Date(product.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}