"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ChevronLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useState, useRef, useEffect, use } from "react"

// NEW HOOKS
import { useProduct, useUpdateProduct } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useBrands } from "@/hooks/api/useBrands"
import { useSubcategories } from "@/hooks/api/useSubcategories"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// SHARED COMPONENTS
import {
  productSchema,
  ProductFormValues,
} from "@/components/admin/products/product-schema"
import { ProfitMarginCalculator } from "@/components/admin/products/profit-margin-calculator"
import {
  SlugField,
  DescriptionField,
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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [isUploading, setIsUploading] = useState(false)

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
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Product</h1>
            <p className="text-sm text-muted-foreground">
              Modify product details and inventory
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            asChild
            disabled={isUploading || updateMutation.isPending}
          >
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit, onFormError)}
            className="bg-accent-blue hover:bg-accent-blue-hover"
            disabled={isUploading || updateMutation.isPending}
          >
            {isUploading || updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Uploading Files..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SlugField form={form} />
                <DescriptionField form={form} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MrpSection form={form} />
                <CostPriceSection form={form} />
                <B2CPriceSection form={form} />
                <B2BPriceSection form={form} />
              </CardContent>
            </Card>

            <Card className="border-2 border-accent-blue/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Profit & Margin Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfitMarginCalculator form={form} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <InventorySection form={form} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <TaxationSection form={form} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categorization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategorizationSection
                  form={form}
                  categories={categories}
                  subcategories={subcategories}
                  brands={brands}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Barcode Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BarcodeSection form={form} uploadFile={uploadFile} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images and Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Images</h3>
                  <div className="flex flex-row items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      {previews.length}/5
                    </span>
                  </div>
                  <ImageUploadCard
                    previews={previews}
                    fileInputRef={fileInputRef}
                    handleImageChange={handleImageChange}
                    removeImage={removeImage}
                  />
                  {form.formState.errors.images && (
                    <p className="text-xs text-destructive mt-2">
                      {form.formState.errors.images.message}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Videos</h3>
                  <VideoUploadCard
                    videoPreview={videoPreview}
                    videoInputRef={videoInputRef}
                    handleVideoChange={handleVideoChange}
                    removeVideo={removeVideo}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
