"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { useCreateBrand } from "@/hooks/api/useBrands"; // Hook

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const brandSchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  status: z.boolean(),
  logo: z.string().optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export default function AddBrandPage() {
  const router = useRouter();
  const createMutation = useCreateBrand();
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", slug: "", description: "", status: true, logo: "" },
  });

  // Handle Local Preview Only
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file); // Save for upload later
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name, { shouldValidate: true });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    form.setValue("slug", slug, { shouldValidate: true });
  };

  async function onSubmit(values: BrandFormValues) {
    try {
      let finalLogoUrl = values.logo;

      // 1. Upload to R2 if a file is selected
      if (fileToUpload) {
        setIsUploading(true);
        // Step A: Get Presigned URL
        const presignRes = await fetch("/api/uploads/presign", {
            method: "POST",
            body: JSON.stringify({ contentType: fileToUpload.type, folder: "brands" }),
        });
        const { uploadUrl, publicUrl } = await presignRes.json();

        // Step B: Upload File
        await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": fileToUpload.type },
            body: fileToUpload,
        });

        finalLogoUrl = publicUrl;
      }

      // 2. Submit Data to DB
      await createMutation.mutateAsync({ ...values, logo: finalLogoUrl });
      
      toast.success("Brand created successfully");
      router.push("/admin/brands");
    } catch (error) {
      toast.error("Failed to save brand");
    } finally {
        setIsUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/brands"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-3xl font-semibold">Add New Brand</h1>
        </div>
        <Button 
            className="bg-accent-blue hover:bg-accent-blue-hover"
            type="button"
            disabled={isUploading}
            onClick={form.handleSubmit(onSubmit)}
          >
            <Save className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Save Brand"}
          </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Same Logo Card UI */}
             <Card>
              <CardHeader><CardTitle>Brand Logo</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div 
                  className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer group hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} className="h-full w-full object-contain p-2" />
                  ) : (
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoChange} />
              </CardContent>
            </Card>

            {/* Same Details Card UI */}
            <Card>
              <CardHeader><CardTitle>Brand Details</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {/* Form Fields... (Same as your code) */}
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
                            field.onChange(e);
                            onNameChange(e);
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
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel>Active Status</FormLabel>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
        </form>
      </Form>
    </div>
  );
}