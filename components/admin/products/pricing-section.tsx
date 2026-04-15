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
import { TypographySmall } from "@/components/ui/typography"

interface PricingSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function MrpSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="mrp"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Retail MRP ({CURRENCY_SYMBOL})
            </FormLabel>
            <FormControl>
              <Input placeholder="0.00" {...field} className="h-10" />
            </FormControl>
            <TypographySmall className="text-[10px] text-muted-foreground">
              Maximum Retail Price for customer display
            </TypographySmall>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  )
}

export function CostPriceSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="costPrice"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Purchase Cost ({CURRENCY_SYMBOL})
            </FormLabel>
            <FormControl>
              <Input placeholder="0.00" {...field} className="h-10" />
            </FormControl>
            <TypographySmall className="text-[10px] text-muted-foreground">
              Internal landing cost for margin calculation
            </TypographySmall>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  )
}

export function B2CPriceSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-4 p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
        <div className="h-1 w-3 bg-blue-500 rounded-full" />
        Retail Pricing (B2C)
      </h3>
      <FormField
        control={form.control}
        name="b2cPrice"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold">
              Selling Price ({CURRENCY_SYMBOL})
            </FormLabel>
            <FormControl>
              <Input
                placeholder="0.00"
                {...field}
                className="h-10 bg-card/50 font-bold text-lg"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  )
}

export function B2BPriceSection({ form }: PricingSectionProps) {
  return (
    <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <div className="h-1 w-3 bg-slate-400 rounded-full" />
        Wholesale Tier (B2B)
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 items-start">
        <FormField
          control={form.control}
          name="b2bPrice"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold">
                B2B Price ({CURRENCY_SYMBOL})
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  {...field}
                  className="h-10 bg-card/50 font-bold"
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="b2bMinQty"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold">Min. Qty</FormLabel>
              <FormControl>
                <Input placeholder="1" {...field} className="h-10 bg-card/50" />
              </FormControl>
              <FormMessage className="text-[10px]" />
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
