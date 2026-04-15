"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
  Hash,
  ToggleLeft,
  Upload,
} from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useCreateSubcategory } from "@/hooks/api/useSubcategories"
import { Check, Search } from "lucide-react"

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

interface SubcategoryDrawerProps {
  onSubcategoryCreated?: (subcategoryId: string) => void
  selectedCategoryId?: string
  categories: any[]
}

export function SubcategoryDrawer({
  onSubcategoryCreated,
  selectedCategoryId,
  categories,
}: SubcategoryDrawerProps) {
  const [open, setOpen] = useState(false)
  const [categorySearchOpen, setCategorySearchOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const createMutation = useCreateSubcategory()
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
      category: selectedCategoryId || "",
      image: "",
    },
  })

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  )

  const selectedCategory = categories.find(
    (cat) => (cat._id || cat.id) === form.watch("category"),
  )

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    form.setValue("slug", slug)
  }

  const handleImageUploadClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }
      setFileToUpload(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFileToUpload(null)
    setImagePreview(null)
  }

  async function onSubmit(values: SubcategoryFormValues) {
    setIsUploading(true)
    try {
      let finalImageUrl = values.image

      if (fileToUpload) {
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: fileToUpload.type,
            folder: "subcategories",
          }),
        })

        if (!presignRes.ok) throw new Error("Failed to get presigned URL")
        const { uploadUrl, publicUrl } = await presignRes.json()

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": fileToUpload.type },
          body: fileToUpload,
        })

        if (!uploadRes.ok) throw new Error("Failed to upload image")
        finalImageUrl = publicUrl
      }

      const finalData = {
        ...values,
        image: finalImageUrl,
        category: selectedCategoryId,
      }

      const result = await createMutation.mutateAsync(finalData)

      toast.success("Subcategory created successfully")
      form.reset()
      setFileToUpload(null)
      setImagePreview(null)
      setOpen(false)

      if (result?.subcategory?._id || result?.subcategory?.id) {
        onSubcategoryCreated?.(result.subcategory._id || result.subcategory.id)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to create subcategory")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          title="Create new subcategory"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="max-w-lg mx-auto h-[calc(100vh-4rem)] flex flex-col">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="text-2xl font-bold">
              Create New Subcategory
            </DrawerTitle>
            <DrawerDescription className="text-base">
              Add a new subcategory to organize your products
            </DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto px-6 pb-6 space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">
                        Parent Category
                      </FormLabel>
                      <Popover
                        open={categorySearchOpen}
                        onOpenChange={setCategorySearchOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={categorySearchOpen}
                              className="w-full justify-between"
                            >
                              {selectedCategory
                                ? selectedCategory.name
                                : "Select category"}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search category..."
                              value={categorySearch}
                              onValueChange={setCategorySearch}
                            />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {filteredCategories.map((cat) => (
                                  <CommandItem
                                    key={cat._id || cat.id}
                                    value={cat.name}
                                    onSelect={() => {
                                      form.setValue(
                                        "category",
                                        cat._id || cat.id,
                                        {
                                          shouldValidate: true,
                                        },
                                      )
                                      setCategorySearchOpen(false)
                                      setCategorySearch("")
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        (cat._id || cat.id) === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {cat.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 mb-2 mt-6">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Basic Information
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Subcategory Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Smartphones"
                          className="h-10"
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
                      <FormLabel className="text-sm font-medium">
                        Slug
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="smartphones"
                          className="h-10"
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
                      <FormLabel className="text-sm font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px] resize-none"
                          placeholder="Short description about the subcategory..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Subcategory Image
                  </h3>
                </div>

                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative group">
                        <div
                          className={`relative h-40 w-40 rounded-xl border-2 transition-all ${
                            imagePreview
                              ? "border-solid border-primary/20 bg-primary/5"
                              : "border-dashed border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                          } flex items-center justify-center overflow-hidden`}
                        >
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Subcategory Preview"
                                className="h-full w-full object-contain p-3"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <div
                              className="flex flex-col items-center cursor-pointer p-6"
                              onClick={handleImageUploadClick}
                            >
                              <div className="p-3 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                                <ImageIcon className="h-6 w-6 text-primary" />
                              </div>
                              <span className="text-sm text-muted-foreground font-medium text-center">
                                Click to upload
                              </span>
                              <span className="text-xs text-muted-foreground/60 mt-1">
                                PNG, JPG up to 5MB
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {!imagePreview && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleImageUploadClick}
                          className="w-full"
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
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </h3>
                </div>

                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium cursor-pointer">
                              Active Status
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Enable this subcategory to be visible in your
                              store
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="scale-110"
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
          <DrawerFooter className="px-6 pb-6 pt-4 gap-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading || createMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || createMutation.isPending}
              onClick={form.handleSubmit(onSubmit)}
              className="flex-1"
            >
              {isUploading || createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Subcategory"
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
