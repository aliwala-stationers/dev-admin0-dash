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
  Zap,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Master Category
          </FormLabel>
          <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-10 flex-1 justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedCategory
                        ? selectedCategory.name
                        : "Select category"}
                    </span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search category..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
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
                            className={cn(
                              "mr-2 h-4 w-4",
                              (cat._id || cat.id) === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
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
          <FormMessage className="text-[10px]" />
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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            Classification (Sub)
            <span className="text-[9px] font-normal lowercase italic text-muted-foreground/60">
              optional
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
                    className="h-10 flex-1 justify-between font-normal"
                    disabled={!selectedCategoryId}
                  >
                    <span className="truncate">
                      {selectedSubcategory
                        ? selectedSubcategory.name
                        : "Select sub-category"}
                    </span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search sub-category..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
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
                          className={cn(
                            "mr-2 h-4 w-4",
                            !field.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        None (Clear)
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
                            className={cn(
                              "mr-2 h-4 w-4",
                              (sub._id || sub.id) === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
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
          <FormMessage className="text-[10px]" />
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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-foreground">
            Brand Line
          </FormLabel>
          <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-10 flex-1 justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedBrand ? selectedBrand.name : "Select brand"}
                    </span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search brand..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
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
                            className={cn(
                              "mr-2 h-4 w-4",
                              (brand._id || brand.id) === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
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
          <FormMessage className="text-[10px]" />
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
        <FormItem className="flex items-center justify-between border rounded-xl p-5 bg-muted/20 border-border/40">
          <div className="space-y-0.5">
            <FormLabel className="text-xs font-bold uppercase tracking-wider m-0 cursor-pointer text-foreground flex items-center gap-2">
              <Zap
                className={cn(
                  "h-3.5 w-3.5",
                  field.value
                    ? "text-emerald-500 fill-current"
                    : "text-muted-foreground",
                )}
              />
              Visibility Status
            </FormLabel>
            <p className="text-[10px] text-muted-foreground">
              Enable this product to make it live in your store
            </p>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="scale-100 data-[state=checked]:bg-emerald-500"
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
