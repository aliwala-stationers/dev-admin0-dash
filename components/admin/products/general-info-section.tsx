import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"

interface GeneralInfoSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function GeneralInfoSection({ form }: GeneralInfoSectionProps) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Product Name</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g. Ultra Wireless Headphones"
              {...field}
              onChange={(e) => {
                field.onChange(e)
                // Auto-generate slug if it's empty or matches the previous name's slug
                const name = e.target.value
                const currentSlug = form.getValues("slug")
                const generatedSlug = name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")

                if (
                  !currentSlug ||
                  currentSlug ===
                    name
                      .slice(0, -1)
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                ) {
                  form.setValue("slug", generatedSlug, {
                    shouldValidate: true,
                  })
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function SlugField({
  form,
}: {
  form: UseFormReturn<ProductFormValues>
}) {
  return (
    <FormField
      control={form.control}
      name="slug"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Slug</FormLabel>
          <FormControl>
            <Input placeholder="ultra-wireless-headphones" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function DescriptionField({
  form,
}: {
  form: UseFormReturn<ProductFormValues>
}) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              className="min-h-[150px]"
              placeholder="Product highlights..."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
