import * as z from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  slug: z
    .string()
    .min(2, "Slug is required and must be at least 2 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  subcategory: z.string().optional(),
  brand: z.string().min(1, "Please select a brand."),
  // Pricing
  costPrice: z.string().optional(),
  b2cPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid B2C price format."),
  b2bPrice: z.string().optional(),
  b2bMinQty: z.string().optional(),
  stock: z.string().regex(/^\d+$/, "Stock must be a whole number."),
  sku: z.string().min(3, "SKU must be at least 3 characters."),
  hsn: z.string(),
  tax: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid tax percentage."),
  upc: z.string().optional(),
  barcode: z.string().optional(),
  status: z.boolean(),
  // We allow strings here, but we will ensure they are valid URLs before DB save
  images: z.array(z.string()).min(1, "At least 1 image is required."),
  videoUrl: z.string().optional().nullable(),
})

export type ProductFormValues = z.infer<typeof productSchema>
