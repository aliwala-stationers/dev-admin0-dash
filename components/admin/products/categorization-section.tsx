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
import { SubcategoryDrawer } from "./subcategory-drawer"
import { BrandDrawer } from "./brand-drawer"
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
  categories,
  useValue = false,
}: {
  form: UseFormReturn<ProductFormValues>
  subcategories: any[]
  selectedCategoryId?: string
  categories: any[]
  useValue?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const handleSubcategoryCreated = (subcategoryId: string) => {
    if (subcategoryId) {
      form.setValue("subcategory", subcategoryId, { shouldValidate: true })
    }
  }

  // Filter subcategories by selected category
  const filteredSubcategories = selectedCategoryId
    ? subcategories.filter(
        (sub) =>
          (typeof sub.category === "object"
            ? sub.category._id || sub.category.id
            : sub.category) === selectedCategoryId,
      )
    : subcategories

  const filteredBySearch = filteredSubcategories.filter((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedSubcategory = subcategories.find(
    (sub) => (sub._id || sub.id) === form.watch("subcategory"),
  )

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
                    {selectedSubcategory
                      ? selectedSubcategory.name
                      : "Select subcategory"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search subcategory..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No subcategory found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          form.setValue("subcategory", "", {
                            shouldValidate: true,
                          })
                          setOpen(false)
                          setSearch("")
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            !field.value ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        None
                      </CommandItem>
                      {filteredBySearch.map((sub) => (
                        <CommandItem
                          key={sub._id || sub.id}
                          value={sub.name}
                          onSelect={() => {
                            form.setValue("subcategory", sub._id || sub.id, {
                              shouldValidate: true,
                            })
                            // Auto-select parent category when subcategory is chosen
                            if (sub.category) {
                              const categoryId =
                                typeof sub.category === "object"
                                  ? sub.category._id || sub.category.id
                                  : sub.category
                              if (categoryId) {
                                form.setValue("category", categoryId, {
                                  shouldValidate: true,
                                })
                              }
                            }
                            setOpen(false)
                            setSearch("")
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              (sub._id || sub.id) === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {sub.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <SubcategoryDrawer
              onSubcategoryCreated={handleSubcategoryCreated}
              selectedCategoryId={selectedCategoryId}
              categories={categories}
            />
          </div>
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
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const handleBrandCreated = (brandId: string) => {
    if (brandId) {
      form.setValue("brand", brandId, { shouldValidate: true })
    }
  }

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedBrand = brands.find(
    (brand) => (brand._id || brand.id) === form.watch("brand"),
  )

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
                    {selectedBrand ? selectedBrand.name : "Select brand"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search brand..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No brand found.</CommandEmpty>
                    <CommandGroup>
                      {filteredBrands.map((brand) => (
                        <CommandItem
                          key={brand._id || brand.id}
                          value={brand.name}
                          onSelect={() => {
                            form.setValue("brand", brand._id || brand.id, {
                              shouldValidate: true,
                            })
                            setOpen(false)
                            setSearch("")
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              (brand._id || brand.id) === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {brand.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <BrandDrawer onBrandCreated={handleBrandCreated} />
          </div>
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
        categories={categories}
        useValue={useValue}
      />
      <BrandField form={form} brands={brands} useValue={useValue} />
      <StatusField form={form} />
    </>
  )
}
