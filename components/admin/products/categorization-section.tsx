import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"
import { CategoryDrawer } from "./category-drawer"
import {
  Building2,
  Tag,
  Layers,
  ShieldCheck,
  Check,
  Search,
} from "lucide-react"
import { useState } from "react"

interface CategorizationSectionProps {
  form: UseFormReturn<ProductFormValues>
  categories: any[]
  subcategories: any[]
  brands: any[]
  useValue?: boolean
}

export function CategoryField({
  form,
  categories,
  useValue = false,
  onCategoryChange,
}: {
  form: UseFormReturn<ProductFormValues>
  categories: any[]
  useValue?: boolean
  onCategoryChange?: (categoryId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const handleCategoryCreated = (categoryId: string) => {
    if (categoryId) {
      form.setValue("category", categoryId, { shouldValidate: true })
      onCategoryChange?.(categoryId)
    }
  }

  const selectedCategory = categories.find(
    (cat) => (cat._id || cat.id) === form.watch("category"),
  )

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Category
          </FormLabel>
          <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-10 flex-1 justify-between"
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
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCategories.map((cat) => (
                        <CommandItem
                          key={cat._id || cat.id}
                          value={cat.name}
                          onSelect={() => {
                            form.setValue("category", cat._id || cat.id, {
                              shouldValidate: true,
                            })
                            onCategoryChange?.(cat._id || cat.id)
                            setOpen(false)
                            setSearch("")
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
            <CategoryDrawer onCategoryCreated={handleCategoryCreated} />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function SubcategoryField({
  form,
  subcategories,
  selectedCategoryId,
  useValue = false,
}: {
  form: UseFormReturn<ProductFormValues>
  subcategories: any[]
  selectedCategoryId?: string
  useValue?: boolean
}) {
  // Filter subcategories by selected category
  const filteredSubcategories = selectedCategoryId
    ? subcategories.filter(
        (sub) =>
          (typeof sub.category === "object"
            ? sub.category._id || sub.category.id
            : sub.category) === selectedCategoryId,
      )
    : subcategories

  return (
    <FormField
      control={form.control}
      name="subcategory"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="flex items-center gap-2 text-sm font-medium">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Subcategory{" "}
            <span className="text-muted-foreground font-normal">
              (Optional)
            </span>
          </FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value)
              // Auto-select parent category when subcategory is chosen
              if (value && value !== "none" && value !== "") {
                const selectedSub = subcategories.find(
                  (sub) => (sub._id || sub.id) === value,
                )
                if (selectedSub && selectedSub.category) {
                  const categoryId =
                    typeof selectedSub.category === "object"
                      ? selectedSub.category._id || selectedSub.category.id
                      : selectedSub.category
                  if (categoryId) {
                    form.setValue("category", categoryId, {
                      shouldValidate: true,
                    })
                  }
                }
              }
            }}
            value={useValue ? field.value : undefined}
            defaultValue={useValue ? undefined : field.value}
          >
            <FormControl>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={useValue ? "" : "none"}>None</SelectItem>
              {filteredSubcategories.map((sub) => (
                <SelectItem
                  key={sub._id || sub.id}
                  value={sub._id || sub.id || ""}
                >
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function BrandField({
  form,
  brands,
  useValue = false,
}: {
  form: UseFormReturn<ProductFormValues>
  brands: any[]
  useValue?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name="brand"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Brand
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={useValue ? field.value : undefined}
            defaultValue={useValue ? undefined : field.value}
          >
            <FormControl>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem
                  key={brand._id || brand.id}
                  value={brand._id || brand.id || ""}
                >
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function StatusField({
  form,
}: {
  form: UseFormReturn<ProductFormValues>
}) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
          <div className="space-y-0.5">
            <FormLabel className="flex items-center gap-2 text-sm font-medium m-0 cursor-pointer">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Active Status
            </FormLabel>
            <p className="text-xs text-muted-foreground">
              Enable this product to be visible in your store
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
  )
}

export function CategorizationSection({
  form,
  categories,
  subcategories,
  brands,
  useValue = false,
}: CategorizationSectionProps) {
  const selectedCategoryId = form.watch("category")

  // Reset subcategory when category changes
  const handleCategoryChange = (categoryId: string) => {
    const currentSubcategory = form.getValues("subcategory")
    if (currentSubcategory) {
      const sub = subcategories.find(
        (s) => (s._id || s.id) === currentSubcategory,
      )
      if (sub) {
        const subCategoryId =
          typeof sub.category === "object"
            ? sub.category._id || sub.category.id
            : sub.category
        // Only reset if the subcategory doesn't belong to the new category
        if (subCategoryId !== categoryId) {
          form.setValue("subcategory", "", { shouldValidate: true })
        }
      }
    }
  }

  return (
    <>
      <CategoryField
        form={form}
        categories={categories}
        useValue={useValue}
        onCategoryChange={handleCategoryChange}
      />
      <SubcategoryField
        form={form}
        subcategories={subcategories}
        selectedCategoryId={selectedCategoryId}
        useValue={useValue}
      />
      <BrandField form={form} brands={brands} useValue={useValue} />
      <StatusField form={form} />
    </>
  )
}
