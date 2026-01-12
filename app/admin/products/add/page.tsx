"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Save, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useRef } from "react";

// DATA HOOKS
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
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  brand: z.string().min(1, "Please select a brand."),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format (e.g., 29.99)."),
  stock: z.string().regex(/^\d+$/, "Stock must be a whole number."),
  sku: z.string().min(3, "SKU must be at least 3 characters."),
  status: z.boolean(),
  // We allow blob URLs initially, then replace with real URLs on submit
  images: z.array(z.string()).min(1, "At least 1 image is required.").max(5, "Maximum 5 images."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
  
  // Data & Mutation
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: "",
      stock: "",
      status: true,
      category: "",
      brand: "",
      images: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validation: Max 5 images total
    if (selectedFiles.length + files.length > 5) {
      toast.error("Limit exceeded", { description: "You can only upload a maximum of 5 images." });
      return;
    }

    // 1. Generate Previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    
    // 2. Update State
    setPreviews((prev) => [...prev, ...newPreviews]);
    setSelectedFiles((prev) => [...prev, ...files]);

    // 3. Update Form (so Zod knows we have images)
    // We combine existing form images + new preview URLs
    const currentFormImages = form.getValues("images");
    form.setValue("images", [...currentFormImages, ...newPreviews], { shouldValidate: true });
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    setPreviews(updatedPreviews);
    setSelectedFiles(updatedFiles);
    
    // Update form state matches the preview array
    form.setValue("images", updatedPreviews, { shouldValidate: true });
  };

  async function onSubmit(values: ProductFormValues) {
    setIsUploading(true);
    try {
      // 1. UPLOAD IMAGES (Parallel)
      // We map over selectedFiles and upload each one
      const uploadPromises = selectedFiles.map(async (file) => {
        // Step A: Get Presigned URL
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          body: JSON.stringify({ 
            contentType: file.type, 
            folder: "products" // Organize in a subfolder
          }),
        });
        
        if (!presignRes.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, publicUrl } = await presignRes.json();

        // Step B: Upload File
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name}`);
        
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // 2. PREPARE FINAL DATA
      const formattedProduct = {
        ...values,
        price: parseFloat(values.price),
        stock: parseInt(values.stock, 10),
        images: uploadedUrls, // Replace blob URLs with real S3 URLs
      };

      // 3. CREATE PRODUCT IN DB
      createProduct(formattedProduct, {
        onSuccess: () => {
          // Cleanup previews
          previews.forEach(url => URL.revokeObjectURL(url));
          router.push("/admin/products");
        },
        onError: (err) => {
           console.error(err);
           // Toast handled by hook usually, but ensure user knows
        }
      });

    } catch (error) {
      console.error(error);
      toast.error("Upload failed", { description: "Some images could not be uploaded." });
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
            <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-sm text-muted-foreground">Fill in the details to list a new item</p>
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
            {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isUploading ? "Uploading Images..." : isCreating ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-6 md:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Ultra Wireless Headphones" {...field} /></FormControl>
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
                      <FormControl><Textarea className="min-h-[150px]" placeholder="Product highlights..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pricing & Stock</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl><Input placeholder="WH-001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl><Input placeholder="0.00" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                      <FormLabel className="m-0 text-sm">Active Status</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Media</CardTitle>
                <span className="text-xs text-muted-foreground">{previews.length}/5</span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square border rounded group overflow-hidden">
                      <img src={url} alt="upload" className="w-full h-full object-cover" />
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
                      className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
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
                  <p className="text-xs text-red-500 mt-2">{form.formState.errors.images.message}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}