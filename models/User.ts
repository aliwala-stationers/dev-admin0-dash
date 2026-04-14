// @/models/User.ts

import { Schema, model, models } from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      default: "User",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// ✅ FIXED: async middleware (no next)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

// ✅ FIXED: safe transform
UserSchema.set("toJSON", {
  transform: (_: any, ret: Record<string, any>) => {
    delete ret.password
    return ret
  },
})

const User = models.User || model("User", UserSchema)

export default User
