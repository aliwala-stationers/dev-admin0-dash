"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Save, Plus, X, Loader2, Video, Film } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useRef } from "react";

// YOUR HOOKS
import { useCreateProduct } from "@/hooks/api/useProducts";
import { useCategories } from "@/hooks/api/useCategories";
import { useBrands } from "@/hooks/api/useBrands";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Validation Schema
const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  slug: z.string().min(2, "Slug is required and must be at least 2 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  brand: z.string().min(1, "Please select a brand."),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format."),
  stock: z.string().regex(/^\d+$/, "Stock must be a whole number."),
  sku: z.string().min(3, "SKU must be at least 3 characters."),
  hsn: z.string(),
  tax: z.string(),
  upc: z.string().optional(),
  barcode: z.string().optional(),
  status: z.boolean(),
  // We allow strings here, but we will ensure they are valid URLs before DB save
  images: z.array(z.string()).min(1, "At least 1 image is required."),
  videoUrl: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  // STATE: Keep track of raw files separately from form values
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]); // Base64 strings for UI
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sku: "",
      price: "",
      stock: "",
      hsn: "",
      tax: "0",
      upc: "",
      barcode: "",
      status: true,
      category: "",
      brand: "",
      images: [],
      videoUrl: null,
    },
  });

  // 1. HANDLE IMAGE SELECTION
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (filesToUpload.length + files.length > 5) {
      toast.error("Limit exceeded", {
        description: "Maximum 5 images allowed.",
      });
      return;
    }

    // Add actual files to state for later upload
    setFilesToUpload((prev) => [...prev, ...files]);

    // Generate Base64 previews for UI
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Update local preview state
        setPreviews((prev) => [...prev, base64String]);

        // Update form validation state (so Zod knows we have "something")
        const currentImages = form.getValues("images");
        form.setValue("images", [...currentImages, base64String], {
          shouldValidate: true,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // HANDLE VIDEO SELECTION
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Invalid file type", {
        description: "Please select a video file.",
      });
      return;
    }

    // Limit video size (e.g., 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Video size should be less than 50MB.",
      });
      return;
    }

    setVideoFile(file);

    // Generate preview
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    // Update form state
    form.setValue("videoUrl", "pending-upload", { shouldValidate: true });
  };

  // 2. REMOVE IMAGE
  const removeImage = (index: number) => {
    // Remove from Files array
    const updatedFiles = filesToUpload.filter((_, i) => i !== index);
    setFilesToUpload(updatedFiles);

    // Remove from Previews array
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);

    // Sync with Form
    form.setValue("images", updatedPreviews, { shouldValidate: true });
  };

  // REMOVE VIDEO
  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    form.setValue("videoUrl", null, { shouldValidate: true });
  };

  // 3. UPLOAD HELPER FUNCTION
  const uploadFile = async (file: File) => {
    // A. Get Presigned URL
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        folder: "products",
      }),
    });

    if (!presignRes.ok) throw new Error("Failed to get presigned URL");
    const { uploadUrl, publicUrl } = await presignRes.json();

    // B. Upload to R2/S3
    // IMPORTANT: 'Content-Type' must match exactly what was sent to presign
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`);
    return publicUrl;
  };

  // 4. MAIN SUBMIT
  async function onSubmit(values: ProductFormValues) {
    if (filesToUpload.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsUploading(true);
    try {
      // Step A: Upload all images in parallel
      const uploadedUrls = await Promise.all(
        filesToUpload.map((file) => uploadFile(file)),
      );

      // Step B: Upload video if exists
      let uploadedVideoUrl = null;
      if (videoFile) {
        uploadedVideoUrl = await uploadFile(videoFile);
      }

      // Step C: Replace the Base64 strings in form values with real URLs
      const finalProductData = {
        ...values,
        hsn: values.hsn || "",
        tax: values.tax ? parseFloat(values.tax) : 0,
        price: parseFloat(values.price),
        stock: parseInt(values.stock, 10),
        images: uploadedUrls,
        videoUrl: uploadedVideoUrl,
      };

      // Step D: Save to Database
      createProduct(finalProductData, {
        onSuccess: () => {
          toast.success("Product created successfully");
          router.push("/admin/products");
        },
        onError: (err) => {
          console.error(err);
          toast.error("Failed to save product to database.");
        },
      });
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(
        "Image upload failed. Check your connection or CORS settings.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const isBusy = isUploading || isCreating;

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
            <h1 className="text-2xl font-bold tracking-tight">
              Add New Product
            </h1>
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
            className="bg-blue-600 hover:bg-blue-700"
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
          {/* LEFT COL */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Ultra Wireless Headphones"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-generate slug if it's empty or matches the previous name's slug
                            const name = e.target.value;
                            const currentSlug = form.getValues("slug");
                            const generatedSlug = name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "");
                            
                            if (!currentSlug || currentSlug === name.slice(0, -1).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) {
                              form.setValue("slug", generatedSlug, { shouldValidate: true });
                            }
                          }}
                        />
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
                        <Input
                          placeholder="ultra-wireless-headphones"
                          {...field}
                        />
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
                        <Textarea
                          className="min-h-[150px]"
                          placeholder="Product highlights..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
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
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (&#8377;)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
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
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 8518" {...field} />
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
                        <Input placeholder="18" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COL */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.name}
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
                      <FormLabel className="m-0 text-sm">
                        Active Status
                      </FormLabel>
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
                              <img src={field.value} alt="barcode" className="w-full h-full object-contain p-2" />
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
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    setIsUploading(true);
                                    try {
                                      const url = await uploadFile(file);
                                      field.onChange(url);
                                    } catch (err) {
                                      toast.error("Barcode upload failed");
                                    } finally {
                                      setIsUploading(false);
                                    }
                                  }
                                };
                                input.click();
                              }}
                              className="w-full aspect-[3/1] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted"
                            >
                              <Plus className="h-5 w-5 mb-1" />
                              <span className="text-xs font-bold uppercase tracking-wider">Upload Barcode</span>
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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Media</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {previews.length}/5
                </span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {previews.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square border rounded group overflow-hidden"
                    >
                      {/* PREVIEW IMAGE (Base64) */}
                      <img
                        src={url}
                        alt="upload"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
                    >
                      <Plus className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-bold">ADD</span>
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
                  <p className="text-xs text-red-500 mt-2">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* VIDEO SECTION */}
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
                    <span className="text-[10px] mt-1 text-muted-foreground/60 uppercase font-bold tracking-wider">MP4, WebM (Max 50MB)</span>
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
  );
}
