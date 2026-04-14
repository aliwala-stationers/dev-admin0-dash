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
  )
}
