import mongoose, { Schema, models } from "mongoose";

const NewsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true 
    },
    meta: {
      source: {
        type: String,
        default: "landing-page",
        trim: true
      },
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  {
    timestamps: true,
  }
);

/**
 * SYSTEMS ARCHITECT NOTE:
 * We are using the "useDb" strategy here.
 * Instead of creating a whole new connection (expensive), we fork the 
 * existing default connection to target the 'user-website-enquiry' database.
 * * This shares the underlying socket pool (efficient) but isolates the data.
 */

// 1. Grab the default mongoose connection (singleton)
const defaultConn = mongoose.connection;

// 2. Fork it to the specific database
// { useCache: true } ensures we reuse the connection object if called multiple times
const targetDB = defaultConn.useDb("user-website-enquiry", { useCache: true });

// 3. Register the model on the TARGET database, not the default one
const Newsletter =  targetDB.model("newsletter_subscribers", NewsletterSchema);

export default Newsletter;