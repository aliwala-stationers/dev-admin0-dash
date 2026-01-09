"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  Building2, 
  Package, 
  Clock,
  ExternalLink,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useData, Brand } from "@/lib/data-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ViewBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getBrand, products } = useData();
  const [brand, setBrand] = useState<Brand | undefined>(undefined);

  useEffect(() => {
    setBrand(getBrand(id));
  }, [id, getBrand]);

  if (!brand) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Brand not found</h2>
        <Button variant="link" asChild>
          <Link href="/admin/brands">Back to brands</Link>
        </Button>
      </div>
    );
  }

  // Get products for this brand
  const brandProducts = products.filter(p => p.brand === brand.name);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/brands">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-background shadow-sm rounded-lg">
              <AvatarImage src={brand.logo} className="object-contain p-2" />
              <AvatarFallback className="rounded-lg">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-semibold">{brand.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={brand.status ? "default" : "secondary"}>
                  {brand.status ? "ACTIVE" : "INACTIVE"}
                </Badge>
                <span className="text-sm text-muted-foreground">Slug: /{brand.slug}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/brands/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Brand
            </Link>
          </Button>
          <Button className="bg-accent-blue hover:bg-accent-blue-hover">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Products
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {brand.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {brand.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products by {brand.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brandProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No products associated with this brand yet.
                  </p>
                ) : (
                  brandProducts.slice(0, 5).map((product) => (
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Total Products</span>
                </div>
                <span className="font-semibold">{brandProducts.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Partner Since</span>
                </div>
                <span className="text-xs">{brand.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}