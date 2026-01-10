import mongoose, { Schema } from "mongoose";

// 1. Define the Schema
// (Adjust fields based on what your enquiry form actually collects)
const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
    status: { 
      type: String, 
      enum: ["new", "read", "contacted"],
      default: "new" 
    }
  },
  {
    timestamps: true,
  }
);

/**
 * 2. The Context Switcher (Sidecar)
 * This function ensures we get the model attached to 'user-website-enquiry'
 * NOT the default 'admin-dashboard'.
 */
export const getEnquiryModel = () => {
  // Safety check: Ensure connection is alive
  if (!mongoose.connection.readyState) {
    throw new Error("Mongoose is not connected. Call connectDB() first.");
  }

  // Switch context to the secondary database
  // useCache: true prevents memory leaks by reusing the connection object
  const enquiryDb = mongoose.connection.useDb("user-website-enquiry", {
    useCache: true,
  });

  // Return the model from that specific DB instance
  return (
    enquiryDb.models.Enquiry || enquiryDb.model("Enquiry", EnquirySchema)
  );
};