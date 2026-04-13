import { Schema, model, models } from "mongoose"

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
      // required: [false, "Email is required"],
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

const Customer = models.Customer || model("Customer", CustomerSchema)

export default Customer
