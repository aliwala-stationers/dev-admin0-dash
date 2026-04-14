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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [newImageFiles, setNewImageFiles] = useState<
    { index: number; file: File }[]
  >([])
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)

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

  const previews = form.watch("images")
  const videoPreview = form.watch("videoUrl")

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
          typeof product.category === "object"
            ? product.category._id
            : product.category,
        brand:
          typeof product.brand === "object" ? product.brand._id : product.brand,
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentImages = form.getValues("images")

    if (currentImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        const currentImages = form.getValues("images")
        const newIndex = currentImages.length

        form.setValue("images", [...currentImages, result], {
          shouldValidate: true,
        })
        setNewImageFiles((prev) => [...prev, { index: newIndex, file }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video too large (max 50MB)")
      return
    }

    setNewVideoFile(file)
    form.setValue("videoUrl", "pending-upload", { shouldValidate: true })
  }

  const removeImage = (index: number) => {
    const updatedImages = form.getValues("images").filter((_, i) => i !== index)
    form.setValue("images", updatedImages, { shouldValidate: true })

    setNewImageFiles((prev) =>
      prev
        .filter((item) => item.index !== index)
        .map((item) => {
          if (item.index > index) return { ...item, index: item.index - 1 }
          return item
        }),
    )
  }

  const removeVideo = () => {
    setNewVideoFile(null)
    form.setValue("videoUrl", null, { shouldValidate: true })
  }

  async function onSubmit(values: ProductFormValues) {
    setIsUploading(true)
    try {
      const currentImages = [...values.images]
      for (const item of newImageFiles) {
        if (currentImages[item.index].startsWith("data:")) {
          const url = await uploadFile(item.file)
          currentImages[item.index] = url
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
        costPrice: values.costPrice ? parseFloat(values.costPrice) : 0,
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
          onSuccess: () => {
            router.push("/admin/products")
          },
          onError: () => {
            setIsUploading(false)
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
            onClick={form.handleSubmit(onSubmit)}
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Images</CardTitle>
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
                  <p className="text-xs text-destructive mt-2">
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
