import { Schema, model, models } from "mongoose"

const ErrorLogSchema = new Schema(
  {
    errorType: {
      type: String,
      required: true,
      enum: ["validation", "duplicate", "server", "network", "unknown"],
    },
    errorMessage: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    requestData: {
      type: Schema.Types.Mixed,
      required: false,
    },
    stackTrace: {
      type: String,
      required: false,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const ErrorLog = models.ErrorLog || model("ErrorLog", ErrorLogSchema)
export default ErrorLog
