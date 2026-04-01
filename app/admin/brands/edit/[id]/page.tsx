"use client"

import { use, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft, Save, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useBrand, useUpdateBrand } from "@/hooks/api/useBrands" // Hooks

// ... (Imports: UI Components same as above)
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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  status: z.boolean(),
  logo: z.string().optional(),
})
type BrandFormValues = z.infer<typeof brandSchema>

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  // React Query: Fetch Data
  const { data: brand, isLoading } = useBrand(id)
  const updateMutation = useUpdateBrand()

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: true,
      logo: "",
    },
  })

  // Sync DB data to Form
  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        status: brand.status,
        logo: brand.logo || "",
      })
      setLogoPreview(brand.logo || null)
    }
  }, [brand, form])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileToUpload(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(values: BrandFormValues) {
    try {
      let finalLogoUrl = values.logo

      // Only upload if a NEW file was selected
      if (fileToUpload) {
        setIsUploading(true)
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          body: JSON.stringify({
            contentType: fileToUpload.type,
            folder: "brands",
          }),
        })
        const { uploadUrl, publicUrl } = await presignRes.json()

        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": fileToUpload.type },
          body: fileToUpload,
        })

        finalLogoUrl = publicUrl
      }

      await updateMutation.mutateAsync({
        id,
        data: { ...values, logo: finalLogoUrl },
      })

      toast.success("Brand updated")
      router.push("/admin/brands")
    } catch (error) {
      toast.error("Failed to update brand")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/brands">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold">Edit Brand</h1>
        </div>
        <Button
          className="bg-accent-blue hover:bg-accent-blue-hover"
          type="button"
          disabled={isUploading}
          onClick={form.handleSubmit(onSubmit)}
        >
          <Save className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Update Brand"}
        </Button>
      </div>

      {/* Form Body (Same Structure) */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Brand Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div
                className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <Plus className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleLogoChange}
              />
            </CardContent>
          </Card>

          <Card>
            {/* Same text fields as Add Page */}
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>Active Status</FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
