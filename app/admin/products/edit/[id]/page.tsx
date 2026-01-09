"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Save, Plus, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useRef, useEffect, use } from "react";
import { useData } from "@/lib/data-context";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  brand: z.string().min(1, {
    message: "Please select a brand.",
  }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Invalid price format.",
  }),
  stock: z.string().regex(/^\d+$/, {
    message: "Stock must be a positive integer.",
  }),
  sku: z.string().min(3, {
    message: "SKU must be at least 3 characters.",
  }),
  status: z.boolean(),
  images: z.array(z.string()).min(2, {
    message: "At least 2 images are required.",
  }).max(5, {
    message: "Maximum 5 images allowed.",
  }),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getProduct, updateProduct, categories, brands } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const product = getProduct(id);
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        status: product.status,
        category: product.category,
        brand: product.brand,
        images: product.images,
      });
      setPreviews(product.images);
      setIsLoading(false);
    } else {
      router.push("/admin/products");
    }
  }, [id, getProduct, form, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = form.getValues("images");
    if (currentImages.length + files.length > 5) {
      toast.error("Limit exceeded", {
        description: "You can only upload a maximum of 5 images.",
      });
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviews((prev) => [...prev, result]);
        const updatedImages = [...form.getValues("images"), result];
        form.setValue("images", updatedImages, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    const updatedImages = currentImages.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    setPreviews(updatedPreviews);
    form.setValue("images", updatedImages, { shouldValidate: true });
  };

  function onSubmit(values: ProductFormValues) {
    updateProduct(id, values);
    toast.success("Product updated", {
      description: `${values.name} has been successfully updated.`,
    });
    router.push("/admin/products");
  }

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Edit Product</h1>
            <p className="text-muted-foreground mt-1">
              Update details for {form.getValues("name")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button 
            className="bg-accent-blue hover:bg-accent-blue-hover"
            type="button"
            onClick={form.handleSubmit(onSubmit)}
          >
            <Save className="mr-2 h-4 w-4" />
            Update Product
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Wireless Headphones" {...field} />
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
                            placeholder="Describe your product in detail..." 
                            className="min-h-[150px]"
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
                  <CardTitle>Inventory & Pricing</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
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
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="99.99" {...field} />
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
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="100" {...field} />
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
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.name}>
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Product Status</FormLabel>
                        </div>
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
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Product Images</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {previews.length}/5
                  </span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              {previews.map((url, index) => (
                                <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                                  <img 
                                    src={url} 
                                    alt={`Preview ${index}`} 
                                    className="h-full w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              {previews.length < 5 && (
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="aspect-square rounded-md border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                                >
                                  <Plus className="h-6 w-6" />
                                  <span className="text-[10px] mt-1 uppercase font-semibold">Upload</span>
                                </button>
                              )}
                            </div>
                            
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}