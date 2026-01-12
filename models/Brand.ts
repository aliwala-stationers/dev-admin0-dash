import { Schema, model, models } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    logo: { type: String }, // URL from R2
  },
  {
    timestamps: true,
  }
);

const Brand = models.Brand || model("Brand", BrandSchema);
export default Brand;