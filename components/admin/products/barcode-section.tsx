import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"

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
        <FormItem>
          <FormControl>
            <div className="flex flex-col items-center gap-4">
              {field.value ? (
                <div className="relative w-full aspect-3/1 border rounded-lg overflow-hidden group">
                  <img
                    src={field.value}
                    alt="barcode"
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => field.onChange("")}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  className="w-full aspect-3/1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent-blue hover:text-accent-blue transition-colors"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">Upload Barcode</span>
                </button>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
