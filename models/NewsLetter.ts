import mongoose, { Schema, model, models } from "mongoose";

const NewsletterSchema = new Schema(
  {
    // --- IDENTITY ---
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true // Crucial for preventing duplicate subscriptions
    },

    // --- METADATA ---
    // structured object for tracking origin (e.g. landing-page, footer, popup)
    meta: {
      source: {
        type: String,
        default: "landing-page",
        trim: true
      },
    },

    // --- STATUS ---
    // Useful for soft unsubscribes without deleting the record
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Next.js Hot Reload Recompilation Error
const Newsletter = models.Newsletter || model("Newsletter", NewsletterSchema);

export default Newsletter;