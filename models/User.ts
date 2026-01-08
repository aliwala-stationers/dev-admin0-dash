import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Security: Do not return password by default in queries
    },
    name: {
      type: String,
      default: "User",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // The "Razorpay" Hook
    isPremium: {
      type: Boolean,
      default: false,
    },
    // The "R2" Hook (for profile pics/uploads later)
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt
  }
);

// Prevent model recompilation error in Next.js
const User = models.User || model("User", UserSchema);

export default User;