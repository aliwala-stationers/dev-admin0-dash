import { Schema, model, models } from "mongoose"

const SubcategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    image: { type: String }, // URL from R2
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

const Subcategory =
  models.Subcategory || model("Subcategory", SubcategorySchema)
export default Subcategory
