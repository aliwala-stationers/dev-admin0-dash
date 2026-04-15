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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Product Display Name
          </FormLabel>
          <FormControl>
            <Input
              placeholder="e.g. Ultra Wireless Headphones"
              className="h-10"
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
          <FormMessage className="text-[10px]" />
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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            SEO Handle (Slug)
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xs">
                /
              </span>
              <Input
                placeholder="ultra-wireless-headphones"
                {...field}
                className="pl-6 h-10 font-mono text-xs"
              />
            </div>
          </FormControl>
          <FormMessage className="text-[10px]" />
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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Detailed Narrative
          </FormLabel>
          <FormControl>
            <Textarea
              className="min-h-[120px] bg-card/50"
              placeholder="Tell your customers more about this item..."
              {...field}
            />
          </FormControl>
          <FormMessage className="text-[10px]" />
        </FormItem>
      )}
    />
  )
}
