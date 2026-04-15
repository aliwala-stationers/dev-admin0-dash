import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"
import { CURRENCY_SYMBOL } from "@/lib/utils"

interface PricingSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function MrpSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        MRP Information
      </h3>
      <FormField
        control={form.control}
        name="mrp"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MRP ({CURRENCY_SYMBOL})</FormLabel>
            <FormControl>
              <Input placeholder="0.00" {...field} />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Maximum Retail Price for display purposes
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function CostPriceSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Cost Information
      </h3>
      <FormField
        control={form.control}
        name="costPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cost Price ({CURRENCY_SYMBOL})</FormLabel>
            <FormControl>
              <Input placeholder="0.00" {...field} />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Your purchase cost for profit calculation
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function B2CPriceSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        Selling Information (B2C)
      </h3>
      <FormField
        control={form.control}
        name="b2cPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retail Price ({CURRENCY_SYMBOL})</FormLabel>
            <FormControl>
              <Input placeholder="0.00" {...field} className="font-semibold" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function B2BPriceSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        Selling Information (B2B)
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 items-start">
        <FormField
          control={form.control}
          name="b2bPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wholesale Price ({CURRENCY_SYMBOL})</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="b2bMinQty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min. Quantity</FormLabel>
              <FormControl>
                <Input placeholder="1" {...field} />
              </FormControl>
              <FormDescription>
                Minimum order quantity for B2B pricing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export function SkuUpcSection({ form }: PricingSectionProps) {
  return (
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
  )
}
