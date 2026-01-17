import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    // --- IDENTITY ---
    name: { 
      type: String, 
      required: [true, "Product name is required"],
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true // Crucial for fast SEO lookups
    },
    sku: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true
    },
    hsn: { type: String },
    tax: { type: Number, default: 0 },
    
    // --- RELATIONS (Strict Reference) ---
    // We use ObjectId to link strictly to the Category/Brand documents
    category: { 
      type: Schema.Types.ObjectId, 
      ref: "Category", 
      required: true,
      index: true 
    },
    brand: { 
      type: Schema.Types.ObjectId, 
      ref: "Brand", 
      required: true,
      index: true
    },

    // --- DETAILS ---
    description: { type: String },
    
    // --- PRICING ---
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 }, // Optional: If set, show "Was $100, Now $80"
    
    // --- INVENTORY ---
    stock: { type: Number, required: true, default: 0, min: 0 },
    status: { type: Boolean, default: true }, // Active/Draft
    
    // --- MEDIA ---
    // Array of full URLs from your R2 storage
    images: { 
      type: [String], 
      default: [] 
    },

    // --- ATTRIBUTES (Flexible) ---
    // Allows dynamic key-values like { "Color": "Red", "RAM": "16GB" }
    specs: {
      type: Map,
      of: String,
      default: {}
    },
    
    // --- FLAGS ---
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Prevent Next.js Hot Reload Recompilation Error
const Product = models.Product || model("Product", ProductSchema);

export default Product;