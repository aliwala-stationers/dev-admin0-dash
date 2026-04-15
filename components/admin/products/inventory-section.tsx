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
import { Package } from "lucide-react"

interface InventorySectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function InventorySection({ form }: InventorySectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Available Inventory
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="0"
                  {...field}
                  className="h-10 pl-10 font-bold"
                />
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              </div>
            </FormControl>
            <p className="text-[10px] text-muted-foreground">
              Current quantity available for order fulfillment
            </p>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Stock Keeping Unit (SKU)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="WH-001"
                  {...field}
                  className="h-10 uppercase font-mono text-xs"
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="upc"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Global Identifier (UPC/EAN)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="123456789012"
                  {...field}
                  className="h-10 font-mono text-xs"
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
