"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ChevronLeft,
  Save,
  Plus,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useRef } from "react";

// HOOKS
import { useCreateBrand } from "@/hooks/api/useBrands";

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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Validation Schema
const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters."),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes."),
  description: z.string().optional(),
  status: z.boolean(),
  logo: z.string().optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export default function AddBrandPage() {
  const router = useRouter();
  const createMutation = useCreateBrand();

  // State for File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: true,
      logo: "",
    },
  });

  // Handle File Selection (Local Preview)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size/type if needed
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large (max 5MB)");
        return;
      }

      setFileToUpload(file);

      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFileToUpload(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Auto-generate slug from name
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name, { shouldValidate: true });

    // Simple slugify logic
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    form.setValue("slug", slug, { shouldValidate: true });
  };

  // Main Submit Logic
  async function onSubmit(values: BrandFormValues) {
    setIsUploading(true);
    try {
      let finalLogoUrl = values.logo;

      // 1. Upload Image if exists
      if (fileToUpload) {
        // A. Get Presigned URL
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          body: JSON.stringify({
            contentType: fileToUpload.type,
            folder: "brands",
          }),
        });

        if (!presignRes.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, publicUrl } = await presignRes.json();

        // B. Upload File to R2/S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": fileToUpload.type },
          body: fileToUpload,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");

        finalLogoUrl = publicUrl;
      }

      // 2. Save Brand to DB
      await createMutation.mutateAsync({
        ...values,
        logo: finalLogoUrl,
      });

      router.push("/admin/brands");
    } catch (error) {
      console.error(error);
      // Toast error is handled by the hook's onError usually,
      // but if the upload fails, we catch it here.
      toast.error("Failed to save brand. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  const isBusy = isUploading || createMutation.isPending;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/brands">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Brand</h1>
            <p className="text-sm text-muted-foreground">
              Create a brand to organize your products
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild disabled={isBusy}>
            <Link href="/admin/brands">Cancel</Link>
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
            Save Brand
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-6 md:grid-cols-3">
          {/* LEFT COLUMN: Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Sony"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e); // Update react-hook-form
                            onNameChange(e); // Update slug
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
                        <Input placeholder="sony" {...field} />
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
                          className="min-h-[120px]"
                          placeholder="Short description about the brand..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Logo & Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative h-40 w-40 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/30 overflow-hidden group hover:bg-muted/50 transition-colors">
                    {logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="h-full w-full object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Click to upload
                        </span>
                      </div>
                    )}
                  </div>

                  {!logoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between border rounded-lg p-3">
                      <FormLabel className="m-0 text-sm font-medium">
                        Active
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
          </div>
        </form>
      </Form>
    </div>
  );
}
