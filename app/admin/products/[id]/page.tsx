"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
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
  Video,
  Star,
  Info,
  BadgePercent,
  TrendingUp,
  Truck,
  FileText,
  Boxes,
  Zap,
  Play,
  Image as ImageIcon,
  IndianRupee,
  Barcode,
  ShoppingBag,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatCurrency,
  formatProfitMargin,
  formatDiscount,
  cn,
} from "@/lib/utils"
import { useProduct } from "@/hooks/api/useProducts"
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
  TypographyMuted,
  TypographySmall,
  TypographyLead,
} from "@/components/ui/typography"

export default function ViewProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: product, isLoading } = useProduct(id)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"images" | "video">("images")

  // Helper to handle populated objects or ID strings
  const getLabel = (field: any) =>
    typeof field === "object" && field !== null ? field.name : field

  // --- CALCULATIONS ---
  const b2cPrice = product?.b2cPrice || product?.price || 0
  const savings = useMemo(() => {
    if (!product?.mrp || !b2cPrice || product.mrp <= b2cPrice) return null
    return formatDiscount(product.mrp, b2cPrice)
  }, [product, b2cPrice])

  const b2cMargin = useMemo(() => {
    if (!product?.costPrice || !b2cPrice) return null
    return formatProfitMargin(product.costPrice, b2cPrice)
  }, [product, b2cPrice])

  const b2bMargin = useMemo(() => {
    if (!product?.costPrice || !product?.b2bPrice) return null
    return formatProfitMargin(product.costPrice, product.b2bPrice)
  }, [product])

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent-blue" />
        <TypographyMuted>Loading product details...</TypographyMuted>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="bg-muted p-6 rounded-full">
          <Package className="h-12 w-12 text-muted-foreground opacity-40" />
        </div>
        <div className="text-center space-y-2">
          <TypographyH3>Product not found</TypographyH3>
          <TypographyMuted>
            The product you're looking for might have been removed or doesn't
            exist.
          </TypographyMuted>
        </div>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/products">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    )
  }

  const images = product.images || []
  const hasImages = images.length > 0
  const activeImage = hasImages ? images[activeImageIndex] : null
  const hasVideo = !!product.videoUrl

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6">
        <div className="flex items-start gap-5">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="shrink-0 h-10 w-10"
          >
            <Link href="/admin/products">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <TypographyH1 className="text-3xl lg:text-4xl">
                {product.name}
              </TypographyH1>
              {product.isFeatured && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-600 border-amber-200 gap-1.5 py-1"
                >
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Featured
                </Badge>
              )}
              <Badge
                variant={product.status ? "success" : "secondary"}
                className="py-1"
              >
                {product.status ? "ACTIVE" : "DRAFT"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <TypographySmall className="text-muted-foreground uppercase tracking-wider font-bold">
                  SKU:
                </TypographySmall>
                <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">
                  {product.sku}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <TypographySmall className="text-muted-foreground uppercase tracking-wider font-bold">
                  URL:
                </TypographySmall>
                <TypographyMuted className="font-mono text-xs">
                  /{product.slug}
                </TypographyMuted>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-accent-blue hover:bg-accent-blue/90 h-11 px-6 shadow-sm"
            asChild
          >
            <Link href={`/admin/products/edit/${product._id || product.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* --- LEFT COLUMN: MEDIA & DETAILS --- */}
        <div className="lg:col-span-7 space-y-8">
          {/* Combined Gallery & Video Card */}
          <Card className="border-border/50 shadow-none overflow-hidden">
            <CardHeader className="border-b bg-muted/5 py-3 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-accent-blue" />
                <CardTitle className="text-base font-semibold">
                  Media Showcase
                </CardTitle>
              </div>
              {hasVideo && (
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as any)}
                  className="w-auto"
                >
                  <TabsList className="h-8 bg-muted/50 p-0.5">
                    <TabsTrigger
                      value="images"
                      className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-card"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Images
                    </TabsTrigger>
                    <TabsTrigger
                      value="video"
                      className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-card"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Video
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>
            <div className="p-6">
              <div className="aspect-square rounded-xl border bg-muted/30 overflow-hidden relative flex items-center justify-center group bg-slate-950/5">
                {viewMode === "images" ? (
                  <>
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={product.name}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Package className="h-20 w-20" />
                        <TypographyLead>No Product Images</TypographyLead>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full w-full bg-black flex items-center justify-center">
                    <video
                      src={product.videoUrl!}
                      className="h-full w-full"
                      controls
                      autoPlay
                      muted
                      preload="metadata"
                    />
                  </div>
                )}

                {product.status && viewMode === "images" && activeImage && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 backdrop-blur-md text-[10px]">
                      Live Preview
                    </Badge>
                  </div>
                )}
              </div>

              {(hasImages || hasVideo) && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {hasImages &&
                    images.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setViewMode("images")
                          setActiveImageIndex(idx)
                        }}
                        className={cn(
                          "h-20 w-20 rounded-lg border-2 overflow-hidden transition-all",
                          viewMode === "images" && activeImageIndex === idx
                            ? "border-accent-blue ring-2 ring-accent-blue/10 scale-105 shadow-md"
                            : "border-border/50 hover:border-accent-blue/50 opacity-70 hover:opacity-100",
                        )}
                      >
                        <img
                          src={url}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  {hasVideo && (
                    <button
                      onClick={() => setViewMode("video")}
                      className={cn(
                        "h-20 w-20 rounded-lg border-2 overflow-hidden transition-all relative group/vid",
                        viewMode === "video"
                          ? "border-accent-blue ring-2 ring-accent-blue/10 scale-105 shadow-md"
                          : "border-border/50 hover:border-accent-blue/50 opacity-70 hover:opacity-100",
                      )}
                    >
                      <video
                        src={`${product.videoUrl}#t=0.1`}
                        className="h-full w-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/vid:bg-black/20 transition-colors">
                        <Play
                          className={cn(
                            "h-5 w-5 fill-current transition-transform duration-300",
                            viewMode === "video"
                              ? "text-accent-blue scale-110"
                              : "text-white",
                          )}
                        />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-white">
                          Video
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Description Card */}
          <Card className="border-border/50 shadow-none">
            <CardHeader className="border-b bg-muted/10 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent-blue" />
                <CardTitle className="text-base font-semibold">
                  Product Narrative
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-base">
                  {product.description ||
                    "The merchant has not provided a detailed description for this product."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Specifications Card */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <Card className="border-border/50 shadow-none">
              <CardHeader className="border-b bg-muted/10 py-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Technical Specifications
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid sm:grid-cols-2 divide-x divide-y border-t">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-card/50"
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        {key}
                      </span>
                      <span className="text-sm font-semibold">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* --- RIGHT COLUMN: PRICING & INVENTORY --- */}
        <div className="lg:col-span-5 space-y-6">
          {/* --- REFINED PRICING DASHBOARD --- */}
          <Card className="border-border/50 shadow-none overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgePercent className="h-5 w-5 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Pricing Dashboard
                  </CardTitle>
                </div>
                {product.salePrice && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 border-none text-[10px] font-bold">
                    ON SALE
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* B2C & B2B Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-y sm:divide-y-0">
                {/* B2C Section */}
                <div className="p-6 space-y-4 bg-blue-50/20 dark:bg-blue-900/10">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Consumer (B2C)
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl font-bold tracking-tight">
                        {formatCurrency(b2cPrice)}
                      </span>
                      {b2cMargin && (
                        <Badge
                          variant="outline"
                          className="h-5 border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5"
                        >
                          {b2cMargin} Margin
                        </Badge>
                      )}
                    </div>
                    {product.mrp && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through">
                          MRP {formatCurrency(product.mrp)}
                        </span>
                        {savings && (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            Save {savings}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* B2B Section */}
                <div
                  className={cn(
                    "p-6 space-y-4",
                    product.b2bPrice
                      ? "bg-slate-50/50 dark:bg-slate-800/20"
                      : "bg-muted/10 opacity-50",
                  )}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Wholesale (B2B)
                    </span>
                  </div>
                  {product.b2bPrice ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-bold tracking-tight">
                          {formatCurrency(product.b2bPrice)}
                        </span>
                        {b2bMargin && (
                          <Badge
                            variant="outline"
                            className="h-5 border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5"
                          >
                            {b2bMargin} Margin
                          </Badge>
                        )}
                      </div>
                      <TypographyMuted className="text-[10px] font-bold uppercase">
                        Min. Order: {product.b2bMinQty || 1} Units
                      </TypographyMuted>
                    </div>
                  ) : (
                    <div className="flex items-center h-10">
                      <TypographyMuted className="text-xs italic">
                        Not configured for B2B
                      </TypographyMuted>
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Cost & MRP Footer Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x border-t border-b bg-muted/5">
                <div className="p-4 space-y-1">
                  <TypographyMuted className="text-[9px] uppercase font-bold tracking-tighter">
                    Cost Basis
                  </TypographyMuted>
                  <TypographySmall className="font-bold">
                    {product.costPrice
                      ? formatCurrency(product.costPrice)
                      : "—"}
                  </TypographySmall>
                </div>
                <div className="p-4 space-y-1">
                  <TypographyMuted className="text-[9px] uppercase font-bold tracking-tighter">
                    Retail MRP
                  </TypographyMuted>
                  <TypographySmall className="font-bold">
                    {product.mrp ? formatCurrency(product.mrp) : "—"}
                  </TypographySmall>
                </div>
                <div className="p-4 space-y-1">
                  <TypographyMuted className="text-[9px] uppercase font-bold tracking-tighter">
                    GST Rate
                  </TypographyMuted>
                  <TypographySmall className="font-bold">
                    {product.tax}%
                  </TypographySmall>
                </div>
                <div className="p-4 space-y-1">
                  <TypographyMuted className="text-[9px] uppercase font-bold tracking-tighter">
                    HSN Code
                  </TypographyMuted>
                  <TypographySmall className="font-mono font-bold">
                    {product.hsn || "—"}
                  </TypographySmall>
                </div>
              </div>

              {/* Identity Footer */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-4 bg-muted/10">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <TypographyMuted className="text-[9px] uppercase font-bold">
                      UPC / Barcode
                    </TypographyMuted>
                    <div className="flex items-center gap-1.5">
                      <Barcode className="h-3 w-3 text-muted-foreground" />
                      <TypographySmall className="font-mono text-[10px] leading-none">
                        {product.upc || "None"}
                      </TypographySmall>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold bg-white/50 border-border/40"
                  >
                    R2 STORAGE
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold bg-white/50 border-border/40"
                  >
                    TAX-INCL
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Card */}
          <Card className="border-border/50 shadow-none">
            <CardHeader className="border-b bg-muted/10 py-4">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-accent-blue" />
                <CardTitle className="text-base font-semibold">
                  Stock & Fulfillment
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <TypographyMuted className="text-xs font-bold uppercase tracking-wider">
                    Current Inventory
                  </TypographyMuted>
                  <div className="flex items-center gap-3">
                    <TypographyH3
                      className={cn(
                        "text-3xl font-extrabold m-0",
                        (product.stock ?? 0) === 0
                          ? "text-destructive"
                          : (product.stock ?? 0) < 10
                            ? "text-amber-500"
                            : "text-emerald-600",
                      )}
                    >
                      {product.stock ?? 0}
                    </TypographyH3>
                    <TypographyLead className="text-muted-foreground text-sm font-medium">
                      Units available
                    </TypographyLead>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-full border-4 border-muted flex items-center justify-center">
                  <Package
                    className={cn(
                      "h-6 w-6",
                      (product.stock ?? 0) === 0
                        ? "text-destructive"
                        : (product.stock ?? 0) < 10
                          ? "text-amber-500"
                          : "text-emerald-600",
                    )}
                  />
                </div>
              </div>

              {(product.stock ?? 0) < 10 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="space-y-1">
                    <TypographySmall className="text-amber-700 dark:text-amber-500 font-bold block">
                      Low Stock Warning
                    </TypographySmall>
                    <TypographyMuted className="text-amber-600 dark:text-amber-500/70 text-[10px]">
                      Inventory is below the threshold. Consider restocking to
                      prevent order fulfillment delays.
                    </TypographyMuted>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">Brand Partnership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {getLabel(product.brand)}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                      Verified
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span className="text-sm">Categorization</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="secondary"
                      className="font-bold text-[10px]"
                    >
                      {getLabel(product.category)}
                    </Badge>
                    {product.subcategory && (
                      <TypographyMuted className="text-[10px]">
                        {getLabel(product.subcategory)}
                      </TypographyMuted>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card className="border-border/50 shadow-none">
            <CardHeader className="border-b bg-muted/10 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Audit Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">First Published</span>
                </div>
                <TypographySmall className="text-[10px] font-mono">
                  {new Date(product.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TypographySmall>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">Last Synchronized</span>
                </div>
                <TypographySmall className="text-[10px] font-mono">
                  {new Date(product.updatedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TypographySmall>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Preview */}
          {product.barcode && (
            <Card className="border-border/50 shadow-none">
              <CardHeader className="border-b bg-muted/10 py-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Logistics & Barcode
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-inner w-full flex justify-center">
                  <img
                    src={product.barcode}
                    alt="Product Barcode"
                    className="max-h-24 object-contain grayscale"
                  />
                </div>
                <TypographyMuted className="text-[10px]">
                  Scannable EAN/UPC identifier for warehouse automation
                </TypographyMuted>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
