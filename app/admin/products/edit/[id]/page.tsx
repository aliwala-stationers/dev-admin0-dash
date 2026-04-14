"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft, Save, Plus, X, Loader2, Video, Film } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  slug: z
    .string()
    .min(2, "Slug is required and must be at least 2 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  subcategory: z.string().optional(),
  brand: z.string().min(1, "Please select a brand."),
  // Pricing
  costPrice: z.string().optional(),
  b2cPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid B2C price format."),
  b2bPrice: z.string().optional(),
  b2bMinQty: z.string().optional(),
  stock: z.string().regex(/^\d+$/, "Stock must be a whole number."),
  sku: z.string().min(3, "SKU must be at least 3 characters."),
  hsn: z.string(),
  tax: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid tax percentage."),
  upc: z.string().optional(),
  barcode: z.string().optional(),
  status: z.boolean(),
  images: z
    .array(z.string())
    .min(1, "At least 1 image is required.")
    .max(5, "Max 5 images."),
  videoUrl: z.string().optional().nullable(),
})

type ProductFormValues = z.infer<typeof productSchema>

// Profit & Margin Calculator Component
function ProfitMarginCalculator({ form }: { form: any }) {
  const costPrice = form.watch("costPrice")
  const b2cPrice = form.watch("b2cPrice")
  const b2bPrice = form.watch("b2bPrice")

  const cost = parseFloat(costPrice) || 0
  const b2c = parseFloat(b2cPrice) || 0
  const b2b = parseFloat(b2bPrice) || 0

  const b2cProfit = b2c - cost
  const b2cMargin = cost > 0 ? ((b2cProfit / cost) * 100).toFixed(2) : "0.00"
  const b2bProfit = b2b - cost
  const b2bMargin = cost > 0 ? ((b2bProfit / cost) * 100).toFixed(2) : "0.00"

  const b2cProfitClass = b2cProfit >= 0 ? "text-green-600" : "text-red-600"
  const b2bProfitClass = b2bProfit >= 0 ? "text-green-600" : "text-red-600"
  const b2cMarginClass =
    parseFloat(b2cMargin) >= 0 ? "text-green-600" : "text-red-600"
  const b2bMarginClass =
    parseFloat(b2bMargin) >= 0 ? "text-green-600" : "text-red-600"

  return (
    <div className="space-y-4">
      {cost > 0 ? (
        <>
          {/* B2C Analysis */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                B2C (Retail) Analysis
              </h4>
              <span className="text-xs text-muted-foreground">Per Unit</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit</p>
                <p className={`text-xl font-bold ${b2cProfitClass}`}>
                  &#8377;{b2cProfit.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Margin</p>
                <p className={`text-xl font-bold ${b2cMarginClass}`}>
                  {b2cMargin}%
                </p>
              </div>
            </div>
          </div>

          {/* B2B Analysis */}
          {b2b > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
                  B2B (Wholesale) Analysis
                </h4>
                <span className="text-xs text-muted-foreground">Per Unit</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Profit</p>
                  <p className={`text-xl font-bold ${b2bProfitClass}`}>
                    &#8377;{b2bProfit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Margin</p>
                  <p className={`text-xl font-bold ${b2bMarginClass}`}>
                    {b2bMargin}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comparison */}
          {b2b > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                Price Comparison
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">B2C Price:</span>
                  <span className="font-semibold">&#8377;{b2c.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">B2B Price:</span>
                  <span className="font-semibold">&#8377;{b2b.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-purple-200 dark:border-purple-800">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className="font-semibold">
                    {b2c > b2b
                      ? `+&#8377;${(b2c - b2b).toFixed(2)}`
                      : `-&#8377;${(b2b - b2c).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">B2B Discount:</span>
                  <span className="font-semibold text-green-600">
                    {b2c > 0
                      ? `${(((b2c - b2b) / b2c) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Enter a cost price to see profit and margin calculations
          </p>
        </div>
      )}
    </div>
  )
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  // const [previews, setPreviews] = useState<string[]>([])
  // const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [newImageFiles, setNewImageFiles] = useState<
    { index: number; file: File }[]
  >([])
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)

  // 1. DATA FETCHING HOOKS
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

  // 2. SYNC DB DATA TO FORM
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
        // Extract _id if category/brand are populated objects, otherwise use the string
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

  // useEffect(() => {
  //   if (product) {
  //     setPreviews(product.images)
  //     setVideoPreview(product.videoUrl || null)
  //   }
  // }, [product])

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

        // setPreviews((prev) => [...prev, result])

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
    const url = URL.createObjectURL(file)
    // setVideoPreview(url)
    form.setValue("videoUrl", "pending-upload", { shouldValidate: true })
  }

  const removeImage = (index: number) => {
    const updatedImages = form.getValues("images").filter((_, i) => i !== index)
    // setPreviews(updatedImages)
    form.setValue("images", updatedImages, { shouldValidate: true })

    // Also remove from newImageFiles if it was a newly added one
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
    // setVideoPreview(null)
    form.setValue("videoUrl", null, { shouldValidate: true })
  }

  // 3. SUBMIT WITH MUTATION
  async function onSubmit(values: ProductFormValues) {
    setIsUploading(true)
    try {
      // A. Upload new images
      const currentImages = [...values.images]
      for (const item of newImageFiles) {
        // If the preview at this index is still a Base64 string, upload it
        if (currentImages[item.index].startsWith("data:")) {
          const url = await uploadFile(item.file)
          currentImages[item.index] = url
        }
      }

      // B. Upload new video
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
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cost Price Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Cost Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price (&#8377;)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Your purchase cost for profit calculation
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* B2C Pricing Section */}
                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    B2C Pricing (Retail)
                  </h3>
                  <FormField
                    control={form.control}
                    name="b2cPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retail Price (&#8377;)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.00"
                            {...field}
                            className="font-semibold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* B2B Pricing Section */}
                <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    B2B Pricing (Wholesale)
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="b2bPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wholesale Price (&#8377;)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="b2bMinQty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min. Quantity</FormLabel>
                          <FormControl>
                            <Input placeholder="1" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Minimum order quantity for B2B pricing
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SKU & UPC */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="WH-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="upc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPC</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profit & Margin Calculator */}
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
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Available units in inventory
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxation Details</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST (%)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categorization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c._id} value={c._id || ""}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {subcategories.map((sub) => (
                            <SelectItem key={sub._id} value={sub._id || ""}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b._id} value={b._id || ""}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between border rounded-lg p-3">
                      <FormLabel>Active Status</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Barcode Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-col items-center gap-4">
                          {field.value ? (
                            <div className="relative w-full aspect-[3/1] border rounded-lg overflow-hidden group">
                              <img
                                src={field.value}
                                alt="barcode"
                                className="w-full h-full object-contain p-2"
                              />
                              <button
                                type="button"
                                onClick={() => field.onChange("")}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = "image/*"
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement)
                                    .files?.[0]
                                  if (file) {
                                    try {
                                      const url = await uploadFile(file)
                                      field.onChange(url)
                                    } catch (err) {
                                      toast.error("Barcode upload failed")
                                    }
                                  }
                                }
                                input.click()
                              }}
                              className="w-full aspect-[3/1] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted"
                            >
                              <Plus className="h-5 w-5 mb-1" />
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Upload Barcode
                              </span>
                            </button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <div className="grid grid-cols-2 gap-2">
                  {previews.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded border overflow-hidden group"
                    >
                      <img
                        src={url}
                        className="object-cover w-full h-full"
                        alt="preview"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed rounded flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
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
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4" />
                  Product Video (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {videoPreview ? (
                  <div className="relative aspect-video border rounded-lg overflow-hidden group bg-black">
                    <video
                      src={videoPreview}
                      className="w-full h-full"
                      controls
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Film className="h-8 w-8 mb-2 opacity-20" />
                    <span className="text-sm font-medium">Upload Video</span>
                    <span className="text-[10px] mt-1 text-muted-foreground/60 uppercase font-bold tracking-wider">
                      MP4, WebM (Max 50MB)
                    </span>
                  </button>
                )}
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
