"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  ChevronLeft,
  Save,
  Plus,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useState, useRef } from "react"

// HOOKS
import { useCreateSubcategory } from "@/hooks/api/useSubcategories"
import { useCategories } from "@/hooks/api/useCategories"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const subcategorySchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  status: z.boolean(),
  image: z.string().optional(),
  category: z.string().min(1, "Category is required"),
})

type SubcategoryFormValues = z.infer<typeof subcategorySchema>

export default function AddSubcategoryPage() {
  const router = useRouter()
  const createMutation = useCreateSubcategory()
  const { data: categories = [] } = useCategories()

  // State for File Upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: true,
      image: "",
      category: "",
    },
  })

  // Handle File Selection (Local Preview)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large (max 5MB)")
        return
      }

      setFileToUpload(file)

      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFileToUpload(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue("name", name, { shouldValidate: true })
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    form.setValue("slug", slug, { shouldValidate: true })
  }

  async function onSubmit(values: SubcategoryFormValues) {
    setIsUploading(true)
    try {
      let finalImageUrl = values.image

      if (fileToUpload) {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          body: JSON.stringify({
            contentType: fileToUpload.type,
            folder: "subcategories",
          }),
        })

        if (!presignRes.ok) throw new Error("Failed to get upload URL")
        const { uploadUrl, publicUrl } = await presignRes.json()

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": fileToUpload.type },
          body: fileToUpload,
        })

        if (!uploadRes.ok) throw new Error("Failed to upload image")

        finalImageUrl = publicUrl
      }

      await createMutation.mutateAsync({
        ...values,
        image: finalImageUrl,
      })

      router.push("/admin/subcategories")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save subcategory. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const isBusy = isUploading || createMutation.isPending

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/subcategories">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Add New Subcategory
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a subcategory to organize your products
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild disabled={isBusy}>
            <Link href="/admin/subcategories">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="bg-accent-blue hover:bg-accent-blue-hover"
            disabled={isBusy}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Subcategory
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subcategory Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Laptops"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            onNameChange(e)
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
                        <Input placeholder="laptops" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem
                                key={cat._id || cat.id}
                                value={cat._id || cat.id || ""}
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          placeholder="Short description about the subcategory..."
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subcategory Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative h-40 w-40 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/30 overflow-hidden group hover:bg-muted/50 transition-colors">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Subcategory Preview"
                          className="h-full w-full object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
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

                  {!imagePreview && (
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
                    onChange={handleImageChange}
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
  )
}
