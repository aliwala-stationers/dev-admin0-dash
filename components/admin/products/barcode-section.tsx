import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { X, Plus, Barcode } from "lucide-react"
import { toast } from "sonner"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"
import { TypographySmall, TypographyMuted } from "@/components/ui/typography"

interface BarcodeSectionProps {
  form: UseFormReturn<ProductFormValues>
  uploadFile?: (file: File) => Promise<string>
}

export function BarcodeSection({ form, uploadFile }: BarcodeSectionProps) {
  return (
    <FormField
      control={form.control}
      name="barcode"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormControl>
            <div className="flex flex-col items-center gap-4">
              {field.value ? (
                <div className="relative w-full aspect-3/1 border border-border/40 rounded-xl overflow-hidden group bg-white shadow-inner">
                  <img
                    src={field.value}
                    alt="barcode"
                    className="w-full h-full object-contain p-4 grayscale"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    type="button"
                    onClick={() => field.onChange("")}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!uploadFile) return
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        try {
                          const url = await uploadFile(file)
                          field.onChange(url)
                        } catch (err) {
                          toast.error("Barcode upload failed")
                        }
                      }
                    }
                    input.click()
                  }}
                  className="w-full aspect-3/1 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent-blue hover:text-accent-blue hover:bg-accent-blue/5 transition-all"
                >
                  <Barcode className="h-8 w-8 opacity-20" />
                  <div className="text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Scan or Upload Barcode
                    </span>
                    <span className="text-[9px] opacity-60">
                      PNG, JPG up to 2MB
                    </span>
                  </div>
                </button>
              )}
            </div>
          </FormControl>
          <div className="space-y-1">
            <TypographySmall className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Instructions
            </TypographySmall>
            <TypographyMuted className="text-[10px] leading-relaxed">
              Upload a clear image of the product barcode or QR code. This will
              be used for automated warehouse scanning and inventory tracking.
            </TypographyMuted>
          </div>
        </FormItem>
      )}
    />
  )
}
