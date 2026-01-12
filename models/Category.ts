import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    // Future proofing: You might want a parent category for sub-categories later
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || model("Category", CategorySchema);
export default Category;