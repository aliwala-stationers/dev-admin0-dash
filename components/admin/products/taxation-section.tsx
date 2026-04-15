import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"

interface TaxationSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function TaxationSection({ form }: TaxationSectionProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="hsn"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              HSN/SAC Code
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. 8518"
                {...field}
                className="h-10 font-mono text-xs"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tax"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              GST Rate (%)
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="18"
                  {...field}
                  className="h-10 pr-10 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  %
                </span>
              </div>
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  )
}
