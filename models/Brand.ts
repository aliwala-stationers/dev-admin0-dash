import { Schema, model, models } from "mongoose"

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, index: true }, // Index for lookup performance
    slug: { type: String, required: true, unique: true }, // unique creates index automatically
    description: { type: String },
    status: { type: Boolean, default: true },
    logo: { type: String }, // URL from R2
  },
  {
    timestamps: true,
  },
)

const Brand = models.Brand || model("Brand", BrandSchema)
export default Brand
