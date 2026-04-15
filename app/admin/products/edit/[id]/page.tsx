"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  ChevronLeft,
  Save,
  Loader2,
  Building2,
  LayoutGrid,
  FileText,
  BadgePercent,
  TrendingUp,
  Boxes,
  Zap,
  Image as ImageIcon,
  Barcode,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useState, useEffect, use } from "react"

// NEW HOOKS
import { useProduct, useUpdateProduct } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useBrands } from "@/hooks/api/useBrands"
import { useSubcategories } from "@/hooks/api/useSubcategories"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// SHARED COMPONENTS
import {
  productSchema,
  ProductFormValues,
} from "@/components/admin/products/product-schema"
import { ProfitMarginCalculator } from "@/components/admin/products/profit-margin-calculator"
import {
  SlugField,
  DescriptionField,
  GeneralInfoSection,
} from "@/components/admin/products/general-info-section"
import {
  MrpSection,
  CostPriceSection,
  B2CPriceSection,
  B2BPriceSection,
} from "@/components/admin/products/pricing-section"
import { InventorySection } from "@/components/admin/products/inventory-section"
import { TaxationSection } from "@/components/admin/products/taxation-section"
import { CategorizationSection } from "@/components/admin/products/categorization-section"
import { BarcodeSection } from "@/components/admin/products/barcode-section"
import {
  useProductImageUploader,
  ImageUploadCard,
  VideoUploadCard,
} from "@/components/admin/products/product-image-uploader"
import {
  TypographyH1,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography"

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [isUploading, setIsUploading] = useState(false)
  const [activeMediaTab, setActiveMediaTab] = useState("images")

  const { data: product, isLoading: isProductLoading } = useProduct(id)
  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()
  const { data: subcategories = [] } = useSubcategories()
  const updateMutation = useUpdateProduct()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sku: "",
      costPrice: "",
      mrp: "",
      b2cPrice: "",
      b2bPrice: "",
      b2bMinQty: "1",
      stock: "",
      hsn: "",
      tax: "0",
      upc: "",
      barcode: "",
      status: true,
      category: "",
      subcategory: "",
      brand: "",
      images: [],
      videoUrl: null,
    },
  })

  // Use shared image uploader hook for edit mode
  const imageUploader = useProductImageUploader({ form, mode: "edit" })
  const {
    fileInputRef,
    videoInputRef,
    previews,
    videoPreview,
    newImageFiles,
    newVideoFile,
    handleImageChange,
    handleVideoChange,
    removeImage,
    removeVideo,
  } = imageUploader

  // Handle form validation errors
  const onFormError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      toast.error(firstError.message)
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description,
        sku: product.sku,
        hsn: product.hsn || "",
        tax: (product.tax ?? 0).toString(),
        upc: product.upc || "",
        barcode: product.barcode || "",
        costPrice: ((product as any).costPrice ?? "").toString(),
        mrp: ((product as any).mrp ?? "").toString(),
        b2cPrice: (
          (product as any).b2cPrice ||
          (product as any).price ||
          ""
        ).toString(),
        b2bPrice: ((product as any).b2bPrice ?? "").toString(),
        b2bMinQty: ((product as any).b2bMinQty ?? 1).toString(),
        stock: (product.stock ?? 0).toString(),
        status: product.status,
        category:
          product.category && typeof product.category === "object"
            ? (product.category as any)._id || (product.category as any).id
            : product.category,
        subcategory:
          product.subcategory && typeof product.subcategory === "object"
            ? (product.subcategory as any)._id ||
              (product.subcategory as any).id
            : product.subcategory || "",
        brand:
          product.brand && typeof product.brand === "object"
            ? (product.brand as any)._id || (product.brand as any).id
            : product.brand,
        images: product.images,
        videoUrl: product.videoUrl || null,
      })
    }
  }, [product, form])

  const uploadFile = async (file: File) => {
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        folder: "products",
      }),
    })

    if (!presignRes.ok) throw new Error("Failed to get presigned URL")
    const { uploadUrl, publicUrl } = await presignRes.json()

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })

    if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`)
    return publicUrl
  }

  async function onSubmit(values: ProductFormValues) {
    setIsUploading(true)
    try {
      const currentImages = [...values.images]
      if (newImageFiles) {
        for (const item of newImageFiles) {
          if (currentImages[item.index].startsWith("data:")) {
            const url = await uploadFile(item.file)
            currentImages[item.index] = url
          }
        }
      }

      let finalVideoUrl = values.videoUrl
      if (newVideoFile) {
        finalVideoUrl = await uploadFile(newVideoFile)
      }

      const payload = {
        ...values,
        hsn: values.hsn || "",
        tax: values.tax ? parseFloat(values.tax) : 0,
        price: parseFloat(values.b2cPrice), // Map b2cPrice to price for backward compatibility
        costPrice: values.costPrice ? parseFloat(values.costPrice) : 0,
        mrp: values.mrp ? parseFloat(values.mrp) : 0,
        b2cPrice: parseFloat(values.b2cPrice),
        b2bPrice: values.b2bPrice ? parseFloat(values.b2bPrice) : 0,
        b2bMinQty: values.b2bMinQty ? parseInt(values.b2bMinQty, 10) : 1,
        stock: parseInt(values.stock, 10),
        images: currentImages,
        videoUrl: finalVideoUrl,
      }

      updateMutation.mutate(
        { id, data: payload },
        {
          onSuccess: (result) => {
            setIsUploading(false)
            if (result && (result as any).error) {
              toast.error((result as any).error)
            } else {
              toast.success("Product updated successfully")
              router.push(`/admin/products/${id}`)
            }
          },
          onError: () => {
            setIsUploading(false)
            toast.error("Failed to update product")
          },
        },
      )
    } catch (error) {
      console.error(error)
      toast.error("File upload failed")
      setIsUploading(false)
    }
  }

  if (isProductLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent-blue" />
        <TypographyMuted>Loading product data...</TypographyMuted>
      </div>
    )
  }

  const isBusy = isUploading || updateMutation.isPending

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6">
        <div className="flex items-start gap-5">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="shrink-0 h-10 w-10"
          >
            <Link href={`/admin/products/${id}`}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-1">
            <TypographyH1 className="text-3xl lg:text-3xl font-extrabold text-foreground">
              Edit Catalog Item
            </TypographyH1>
            <TypographyMuted>
              Modify specifications, pricing tiers, and media assets for this
              product.
            </TypographyMuted>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            disabled={isBusy}
            className="h-11 px-6"
          >
            <Link href={`/admin/products/${id}`}>Cancel</Link>
          </Button>
          <Button
            className="bg-accent-blue hover:bg-accent-blue/90 h-11 px-6 shadow-sm"
            disabled={isBusy}
            onClick={form.handleSubmit(onSubmit, onFormError)}
          >
            {isBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Syncing..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-8 lg:grid-cols-12">
          {/* --- LEFT COLUMN: MAIN INFO --- */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-border/40 shadow-none">
              <CardHeader className="border-b bg-muted/10 py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    General Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <GeneralInfoSection form={form} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <SlugField form={form} />
                </div>
                <DescriptionField form={form} />
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-none overflow-hidden">
              <CardHeader className="bg-muted/10 border-b py-4">
                <div className="flex items-center gap-2">
                  <BadgePercent className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Pricing Configuration
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <MrpSection form={form} />
                  <CostPriceSection form={form} />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <B2CPriceSection form={form} />
                  <B2BPriceSection form={form} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent-blue/20 bg-accent-blue/5 shadow-none">
              <CardHeader className="py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent-blue" />
                  Profit & Margin Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <ProfitMarginCalculator form={form} />
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-none">
              <CardHeader className="border-b bg-muted/10 py-4">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Inventory & Logistics
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <InventorySection form={form} />
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-none">
              <CardHeader className="border-b bg-muted/10 py-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Taxation & Compliance
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TaxationSection form={form} />
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT COLUMN: ORG & MEDIA --- */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-border/40 shadow-none">
              <CardHeader className="border-b bg-muted/10 py-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Product Organization
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <CategorizationSection
                  form={form}
                  categories={categories}
                  subcategories={subcategories}
                  brands={brands}
                />
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-none overflow-hidden">
              <CardHeader className="border-b bg-muted/10 py-3 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Media Assets
                  </CardTitle>
                </div>
                <Tabs
                  value={activeMediaTab}
                  onValueChange={setActiveMediaTab}
                  className="w-auto"
                >
                  <TabsList className="h-8 bg-muted/50 p-0.5">
                    <TabsTrigger
                      value="images"
                      className="h-7 px-3 text-[10px] uppercase font-bold gap-1.5 data-[state=active]:bg-card"
                    >
                      Photos
                    </TabsTrigger>
                    <TabsTrigger
                      value="video"
                      className="h-7 px-3 text-[10px] uppercase font-bold gap-1.5 data-[state=active]:bg-card"
                    >
                      Video
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={activeMediaTab} className="w-full">
                  <TabsContent value="images" className="m-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <TypographySmall className="text-muted-foreground font-bold">
                        Product Gallery
                      </TypographySmall>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold"
                      >
                        {previews.length}/5
                      </Badge>
                    </div>
                    <ImageUploadCard
                      previews={previews}
                      fileInputRef={fileInputRef}
                      handleImageChange={handleImageChange}
                      removeImage={removeImage}
                    />
                    {form.formState.errors.images && (
                      <p className="text-[10px] font-bold text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {form.formState.errors.images.message}
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="video" className="m-0 space-y-4">
                    <TypographySmall className="text-muted-foreground font-bold">
                      Marketing Video
                    </TypographySmall>
                    <VideoUploadCard
                      videoPreview={videoPreview}
                      videoInputRef={videoInputRef}
                      handleVideoChange={handleVideoChange}
                      removeVideo={removeVideo}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-none">
              <CardHeader className="border-b bg-muted/10 py-4">
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-accent-blue" />
                  <CardTitle className="text-base font-semibold">
                    Barcode Assets
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <BarcodeSection form={form} uploadFile={uploadFile} />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
