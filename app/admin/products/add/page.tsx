"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ChevronLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useState, useEffect } from "react"

// YOUR HOOKS
import { useCreateProduct } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useBrands } from "@/hooks/api/useBrands"
import { useSubcategories } from "@/hooks/api/useSubcategories"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// SHARED COMPONENTS
import {
  productSchema,
  ProductFormValues,
} from "@/components/admin/products/product-schema"
import { ProfitMarginCalculator } from "@/components/admin/products/profit-margin-calculator"
import {
  GeneralInfoSection,
  SlugField,
  DescriptionField,
} from "@/components/admin/products/general-info-section"
import {
  CostPriceSection,
  B2CPriceSection,
  B2BPriceSection,
  SkuUpcSection,
} from "@/components/admin/products/pricing-section"
import { InventorySection } from "@/components/admin/products/inventory-section"
import { TaxationSection } from "@/components/admin/products/taxation-section"
import { CategorizationSection } from "@/components/admin/products/categorization-section"
import { BarcodeSection } from "@/components/admin/products/barcode-section"
import {
  ProductImageUploader,
  ImageUploadCard,
  VideoUploadCard,
} from "@/components/admin/products/product-image-uploader"

export default function AddProductPage() {
  const router = useRouter()
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()
  const { data: subcategories = [] } = useSubcategories()

  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sku: "",
      costPrice: "",
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

  // Use shared image uploader hook
  const imageUploader = ProductImageUploader({ form, mode: "add" })
  const {
    fileInputRef,
    videoInputRef,
    previews,
    videoPreview,
    filesToUpload,
    videoFile,
    handleImageChange,
    handleVideoChange,
    removeImage,
    removeVideo,
  } = imageUploader

  // UPLOAD HELPER FUNCTION
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

  // MAIN SUBMIT
  async function onSubmit(values: ProductFormValues) {
    if (!filesToUpload || filesToUpload.length === 0) {
      toast.error("Please select at least one image")
      return
    }

    setIsUploading(true)
    try {
      const uploadedUrls = await Promise.all(
        filesToUpload.map((file) => uploadFile(file)),
      )

      let uploadedVideoUrl = null
      if (videoFile) {
        uploadedVideoUrl = await uploadFile(videoFile)
      }

      const finalProductData = {
        ...values,
        hsn: values.hsn || "",
        tax: values.tax ? parseFloat(values.tax) : 0,
        costPrice: values.costPrice ? parseFloat(values.costPrice) : 0,
        b2cPrice: parseFloat(values.b2cPrice),
        b2bPrice: values.b2bPrice ? parseFloat(values.b2bPrice) : 0,
        b2bMinQty: values.b2bMinQty ? parseInt(values.b2bMinQty, 10) : 1,
        stock: parseInt(values.stock, 10),
        images: uploadedUrls,
        videoUrl: uploadedVideoUrl,
      }

      createProduct(finalProductData, {
        onSuccess: () => {
          router.push("/admin/products")
        },
        onError: (err) => {
          console.error(err)
        },
      })
    } catch (error) {
      console.error("Upload Error:", error)
      toast.error(
        "Image upload failed. Check your connection or CORS settings.",
      )
    } finally {
      setIsUploading(false)
    }
  }

  const isBusy = isUploading || isCreating

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Add New Product</h1>
            <p className="text-sm text-muted-foreground">
              Fill in the details to list a new item
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild disabled={isBusy}>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button
            className="bg-accent-blue hover:bg-accent-blue-hover"
            disabled={isBusy}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Uploading Files..." : "Save Product"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GeneralInfoSection form={form} />
                <SlugField form={form} />
                <DescriptionField form={form} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CostPriceSection form={form} />
                <B2CPriceSection form={form} />
                <B2BPriceSection form={form} />
                <SkuUpcSection form={form} />
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
                <CardTitle>Organization</CardTitle>
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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Product Images</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {previews.length}/5
                </span>
              </CardHeader>
              <CardContent>
                <ImageUploadCard
                  previews={previews}
                  fileInputRef={fileInputRef}
                  handleImageChange={handleImageChange}
                  removeImage={removeImage}
                />
                {form.formState.errors.images && (
                  <p className="text-xs text-red-500 mt-2">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Video</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoUploadCard
                  videoPreview={videoPreview}
                  videoInputRef={videoInputRef}
                  handleVideoChange={handleVideoChange}
                  removeVideo={removeVideo}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
