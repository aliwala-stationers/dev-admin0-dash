import { Schema, model, models } from "mongoose"

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, index: true }, // Index for lookup performance
    slug: { type: String, required: true, unique: true }, // unique creates index automatically
    description: { type: String },
    status: { type: Boolean, default: true },
    image: { type: String }, // URL from R2
  },
  {
    timestamps: true,
  },
)

const Category = models.Category || model("Category", CategorySchema)
export default Category
