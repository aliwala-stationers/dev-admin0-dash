"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
import { useCreateCategory } from "@/hooks/api/useCategories"

const categorySchema = z.object({
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
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryDrawerProps {
  onCategoryCreated?: (categoryId: string) => void
  asDropdownItem?: boolean
  onDrawerOpen?: () => void
}

export function CategoryDrawer({
  onCategoryCreated,
  asDropdownItem = false,
  onDrawerOpen,
}: CategoryDrawerProps) {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateCategory()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: true,
      image: "",
    },
  })

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

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFileToUpload(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleImageUploadClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // POC Patch: Delayed causality pushes the OS dialog to the next event loop tick,
    // bypassing Radix's synchronous focus-trap checks that cause the drawer to close.
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
  }

  const handleDrawerOpen = () => {
    console.log("CategoryDrawer: handleDrawerOpen called")
    onDrawerOpen?.()
    console.log("CategoryDrawer: Select should be closed now")
    // Small delay to allow select to close before opening drawer
    setTimeout(() => {
      setOpen(true)
      console.log("CategoryDrawer: Drawer open state set to true after delay")
    }, 50)
  }

  async function onSubmit(values: CategoryFormValues) {
    setIsUploading(true)
    try {
      let finalImageUrl = values.image

      if (fileToUpload) {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          body: JSON.stringify({
            contentType: fileToUpload.type,
            folder: "categories",
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

      const result = await createMutation.mutateAsync({
        ...values,
        image: finalImageUrl,
      })

      form.reset()
      setFileToUpload(null)
      setImagePreview(null)
      onCategoryCreated?.(
        result.category?._id ||
          result.category?.id ||
          result.data?._id ||
          result.data?.id,
      )

      // POC Patch: Explicit state mutation to close the drawer on success.
      setOpen(false)
      toast.success("Category created successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create category")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      {asDropdownItem ? (
        <div
          className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          onClick={() => {
            console.log(
              "CategoryDrawer: Dropdown item clicked, calling handleDrawerOpen",
            )
            handleDrawerOpen()
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create new category
        </div>
      ) : (
        <Drawer
          open={open}
          onOpenChange={(newOpen) => {
            console.log("CategoryDrawer: onOpenChange called with", newOpen)
            setOpen(newOpen)
          }}
          direction="right"
          shouldScaleBackground={false}
        >
          <DrawerTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col">
              <DrawerHeader>
                <DrawerTitle>Create New Category</DrawerTitle>
                <DrawerDescription>
                  Add a new category to organize your products
                </DrawerDescription>
              </DrawerHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex-1 overflow-y-auto p-4 space-y-4 border-t border-b shadow-inner"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Electronics"
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
                          <Input placeholder="electronics" {...field} />
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
                            className="min-h-[80px]"
                            placeholder="Short description about the category..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Category Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/30 overflow-hidden group hover:bg-muted/50 transition-colors">
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Category Preview"
                                className="h-full w-full object-contain p-2"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <div
                              className="flex flex-col items-center cursor-pointer"
                              onClick={handleImageUploadClick}
                            >
                              <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
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
                            onClick={handleImageUploadClick}
                          >
                            <Plus className="mr-2 h-3 w-3" />
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
                      <CardTitle className="text-sm">Status</CardTitle>
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
                </form>
              </Form>
              <DrawerFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isUploading || createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || createMutation.isPending}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isUploading || createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
      {asDropdownItem && (
        <Drawer
          open={open}
          onOpenChange={(newOpen) => {
            console.log("CategoryDrawer: onOpenChange called with", newOpen)
            setOpen(newOpen)
          }}
          direction="right"
          shouldScaleBackground={false}
        >
          <DrawerContent>
            <div className="max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col">
              <DrawerHeader>
                <DrawerTitle>Create New Category</DrawerTitle>
                <DrawerDescription>
                  Add a new category to organize your products
                </DrawerDescription>
              </DrawerHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex-1 overflow-y-auto p-4 space-y-4 border-t border-b shadow-inner"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Electronics"
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
                          <Input placeholder="electronics" {...field} />
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
                            className="min-h-[80px]"
                            placeholder="Short description about the category..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Category Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/30 overflow-hidden group hover:bg-muted/50 transition-colors">
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Category Preview"
                                className="h-full w-full object-contain p-2"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <div
                              className="flex flex-col items-center cursor-pointer"
                              onClick={handleImageUploadClick}
                            >
                              <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
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
                            onClick={handleImageUploadClick}
                          >
                            <Plus className="mr-2 h-3 w-3" />
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
                      <CardTitle className="text-sm">Status</CardTitle>
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
                </form>
              </Form>
              <DrawerFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isUploading || createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || createMutation.isPending}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isUploading || createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
