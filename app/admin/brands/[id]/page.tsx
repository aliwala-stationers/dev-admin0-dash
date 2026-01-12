"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Edit, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBrand } from "@/hooks/api/useBrands"; // Hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ViewBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: brand, isLoading } = useBrand(id);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!brand) return <div className="p-6">Brand not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/brands"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-background shadow-sm rounded-lg">
              <AvatarImage src={brand.logo} className="object-contain p-2" />
              <AvatarFallback className="rounded-lg"><Building2 className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-semibold">{brand.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={brand.status ? "default" : "secondary"}>
                  {brand.status ? "ACTIVE" : "INACTIVE"}
                </Badge>
                <span className="text-sm text-muted-foreground">/{brand.slug}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/brands/edit/${brand._id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Brand
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>About {brand.name}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{brand.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}