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
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="hsn"
        render={({ field }) => (
          <FormItem>
            <FormLabel>HSN Code</FormLabel>
            <FormControl>
              <Input placeholder="e.g. 8518" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tax"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GST (%)</FormLabel>
            <FormControl>
              <Input placeholder="18" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
