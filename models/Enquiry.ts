import mongoose, { Schema } from "mongoose"

const EnquirySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true, // Optimization for looking up user history
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "contacted"],
      default: "new",
      index: true, // Optimization for dashboard filtering
    },
  },
  {
    timestamps: true,
  },
)

/**
 * SYSTEMS ARCHITECT NOTE:
 * Standardization Protocol:
 * Replicating the "useDb" fork strategy to target 'user-website-enquiry'.
 * * This maintains connection pooling efficiency while strictly isolating
 * the enquiry data from the main application/admin DB.
 */

// 1. Grab the default mongoose connection (singleton)
const defaultConn = mongoose.connection

// 2. Fork it to the specific database
// { useCache: true } prevents memory leaks by reusing the connection instance
const targetDB = defaultConn.useDb("user-website-enquiry", { useCache: true })

// 3. Register the model on the TARGET database
// Explicitly naming the collection 'enquiries' to match the snake_case/plural convention
const Enquiry = targetDB.model("contact_messages", EnquirySchema)

export default Enquiry
