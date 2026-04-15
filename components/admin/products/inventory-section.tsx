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

interface InventorySectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function InventorySection({ form }: InventorySectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock Quantity</FormLabel>
            <FormControl>
              <Input placeholder="0" {...field} />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Available units in inventory
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="WH-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="upc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPC</FormLabel>
              <FormControl>
                <Input placeholder="123456789012" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
