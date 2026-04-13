import mongoose, { Schema } from "mongoose"

const AddressSchema = new Schema({
  type: { type: String, enum: ["shipping", "billing", "delivery"] },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  isDefault: { type: Boolean, default: false },
})

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    avatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    orders: {
      type: Number,
      default: 0,
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
 * SYSTEMS ARCHITECT NOTE:
 * Standardization Protocol:
 * We are using the "useDb" strategy to target the 'mobile-app-dev' database.
 * This ensures customer data is isolated from the main admin/app database
 * while sharing the same connection pool for efficiency.
 */

// 1. Grab the default mongoose connection (singleton)
const defaultConn = mongoose.connection

// 2. Fork it to the specific database
const targetDB = defaultConn.useDb("mobile-app-dev", { useCache: true })

// 3. Register the model on the TARGET database
const Customer = targetDB.model("customers", CustomerSchema)

export default Customer
