// @/models/Customer.ts

import mongoose, { Schema } from "mongoose"

/**
 * @schema AddressSchema
 * @description Represents customer address (shipping/billing/delivery)
 */
const AddressSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["shipping", "billing", "delivery"],
      default: "shipping",
    },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }, // prevent unnecessary subdoc ids
)

/**
 * @schema CustomerSchema
 * @description Represents mobile app customer entity
 */
const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Optional email (NOT primary identity)
     */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // ✅ allows multiple nulls safely
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is invalid"],
    },

    /**
     * Primary identity (OTP-based login)
     */
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    /**
     * Derived fields (system-controlled)
     */
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    orders: {
      type: Number,
      default: 0,
      min: 0,
    },

    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

/**
 * 🔐 Normalize phone before saving
 */
CustomerSchema.pre("save", async function () {
  if (this.isModified("phone")) {
    this.phone = this.phone.replace(/\s+/g, "")
  }
})

/**
 * 🔐 Hide internal fields
 */
CustomerSchema.set("toJSON", {
  transform: (_, ret: Record<string, any>) => {
    delete ret.__v
    return ret
  },
})

/**
 * 🔥 Indexes (critical for scale)
 */
CustomerSchema.index({ phone: 1 }, { unique: true })
CustomerSchema.index({ email: 1 }, { sparse: true })
CustomerSchema.index({ createdAt: -1 })

/**
 * SYSTEM ARCHITECTURE:
 * Separate DB for mobile app customers
 */
const defaultConn = mongoose.connection
const targetDB = defaultConn.useDb("mobile-app-dev", { useCache: true })

const Customer =
  targetDB.models.Customer || targetDB.model("Customer", CustomerSchema)

export default Customer
