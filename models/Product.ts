// @/models/Products

import { Schema, model, models } from "mongoose"

const ProductSchema = new Schema(
  {
    // --- IDENTITY ---
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true, // Crucial for fast SEO lookups
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    hsn: { type: String },
    tax: { type: Number, default: 0 },
    upc: { type: String },
    barcode: { type: String }, // URL to barcode image

    // --- RELATIONS (Strict Reference) ---
    // We use ObjectId to link strictly to the Category/Brand/Subcategory documents
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      index: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    // --- DETAILS ---
    description: { type: String },

    // --- PRICING ---
    price: { type: Number, required: true, min: 0 }, // Main price (backward compatibility)
    costPrice: { type: Number, min: 0 }, // Cost price for profit calculations
    mrp: { type: Number, min: 0 }, // Maximum Retail Price
    b2cPrice: { type: Number, min: 0 }, // B2C (retail) price
    b2bPrice: { type: Number, min: 0 }, // B2B (wholesale) price
    b2bMinQty: { type: Number, min: 1, default: 1 }, // Minimum quantity for B2B pricing
    salePrice: { type: Number, min: 0 }, // Optional: If set, show "Was $100, Now $80"

    // --- INVENTORY ---
    stock: { type: Number, required: true, default: 0, min: 0, index: true }, // Indexed for analytics queries
    status: { type: Boolean, default: true }, // Active/Draft

    // --- MEDIA ---
    // Array of full URLs from your R2 storage
    images: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      default: null,
    },

    // --- ATTRIBUTES (Flexible) ---
    // Allows dynamic key-values like { "Color": "Red", "RAM": "16GB" }
    specs: {
      type: Map,
      of: String,
      default: {},
    },

    // --- FLAGS ---
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

// Compound indexes for analytics query optimization
// Moved from schema options (indexes: [] is invalid) to Schema.index() calls

// Partial index for active products only - optimizes for real query pattern
// Since analytics only queries status: true, this reduces index size by excluding inactive products
// This replaces the compound index (stock, status) to avoid wasted space
ProductSchema.index({ stock: 1 }, { partialFilterExpression: { status: true } })

// Future: ProductSchema.index({ store: 1, status: 1 }) for multi-tenant analytics

// Prevent Next.js Hot Reload Recompilation Error
const Product = models.Product || model("Product", ProductSchema)

export default Product
