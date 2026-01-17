"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Save, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useRef, useEffect, use } from "react";

// NEW HOOKS
import { useProduct, useUpdateProduct } from "@/hooks/api/useProducts";
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

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  slug: z.string().min(2, "Slug is required and must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  brand: z.string().min(1, "Please select a brand."),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format (e.g. 99.99)."),
  stock: z.string().regex(/^\d+$/, "Stock must be a whole number."),
  sku: z.string().min(3, "SKU must be at least 3 characters."),
  hsn: z.string(),
  tax: z.string(),
  status: z.boolean(),
  images: z.array(z.string()).min(1, "At least 1 image is required.").max(5, "Max 5 images."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // 1. DATA FETCHING HOOKS
  const { data: product, isLoading: isProductLoading } = useProduct(id);
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const updateMutation = useUpdateProduct();

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
      status: true,
      category: "",
      brand: "",
      images: [],
    },
  });

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
        price: product.price.toString(),
        stock: product.stock.toString(),
        status: product.status,
        // Extract _id if category/brand are populated objects, otherwise use the string
        category: typeof product.category === 'object' ? product.category._id : product.category,
        brand: typeof product.brand === 'object' ? product.brand._id : product.brand,
        images: product.images,
      });
      setPreviews(product.images);
    }
  }, [product, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImages = form.getValues("images");

    if (currentImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviews((prev) => [...prev, result]);
        form.setValue("images", [...form.getValues("images"), result], { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = form.getValues("images").filter((_, i) => i !== index);
    setPreviews(updatedImages);
    form.setValue("images", updatedImages, { shouldValidate: true });
  };

  // 3. SUBMIT WITH MUTATION
  async function onSubmit(values: ProductFormValues) {
    const payload = {
      ...values,
      hsn: values.hsn || "",
      tax: values.tax ? parseFloat(values.tax) : 0,
      price: parseFloat(values.price),
      stock: parseInt(values.stock, 10),
    };

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push("/admin/products");
        },
      }
    );
  }

  if (isProductLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-sm text-muted-foreground">Modify product details and inventory</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild disabled={updateMutation.isPending}>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>General Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Input type="text" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl><Input type="text" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Taxation Details</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Categorization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {brands.map(b => (
                            <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
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
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Images</CardTitle>
                <span className="text-xs text-muted-foreground">{previews.length}/5</span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded border overflow-hidden group">
                      <img src={url} className="object-cover w-full h-full" alt="preview" />
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
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                {form.formState.errors.images && (
                   <p className="text-xs text-destructive mt-2">{form.formState.errors.images.message}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}