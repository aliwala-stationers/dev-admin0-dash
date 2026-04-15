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
import { Switch } from "@/components/ui/switch"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"
import { useEffect } from "react"
import { CategoryDrawer } from "./category-drawer"

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
  const handleCategoryCreated = (categoryId: string) => {
    if (categoryId) {
      form.setValue("category", categoryId, { shouldValidate: true })
      onCategoryChange?.(categoryId)
    }
  }

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value)
              onCategoryChange?.(value)
            }}
            value={useValue ? field.value : undefined}
            defaultValue={useValue ? undefined : field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem
                  key={cat._id || cat.id}
                  value={cat._id || cat.id || ""}
                >
                  {cat.name}
                </SelectItem>
              ))}
              <CategoryDrawer
                onCategoryCreated={handleCategoryCreated}
                asDropdownItem
              />
            </SelectContent>
          </Select>
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
        <FormItem>
          <FormLabel>Subcategory (Optional)</FormLabel>
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
              <SelectTrigger>
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
        <FormItem>
          <FormLabel>Brand</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={useValue ? field.value : undefined}
            defaultValue={useValue ? undefined : field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
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
        <FormItem className="flex items-center justify-between border rounded-lg p-3">
          <FormLabel className="m-0 text-sm">Active Status</FormLabel>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
