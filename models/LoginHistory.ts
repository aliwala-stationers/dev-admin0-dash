import mongoose, { Schema, model, models } from "mongoose"

const LoginHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Crucial for performance when querying "Show my history"
    },
    event: {
      type: String,
      enum: ["LOGIN", "LOGOUT", "FAILED_LOGIN"],
      required: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    device: {
      type: String, // e.g., "Mozilla/5.0 (Macintosh...)"
      default: "unknown",
    },
    // Optional: Geographic location if you integrate GeoIP later
    location: {
      city: String,
      country: String,
    },
  },
  {
    timestamps: true, // Tracks 'createdAt' (Time of login)
  },
)

// Prevent model recompilation
const LoginHistory =
  models.LoginHistory || model("LoginHistory", LoginHistorySchema)

export default LoginHistory
