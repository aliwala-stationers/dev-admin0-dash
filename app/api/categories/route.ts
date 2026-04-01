import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
// We don't import Product here because the database does the joining

export async function GET() {
  await connectDB()

  const categories = await Category.aggregate([
    {
      $lookup: {
        from: "products", // The collection name in MongoDB
        localField: "_id", // <--- CHANGED: Match Category ID
        foreignField: "category", // <--- CHANGED: Match Product's category ref
        as: "products",
      },
    },
    {
      $addFields: {
        productCount: { $size: "$products" }, // Count the matches
      },
    },
    {
      $project: {
        products: 0, // Remove the heavy array, keep only the count
      },
    },
    { $sort: { createdAt: -1 } },
  ])

  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const { name, slug, description, status, image, parentId } =
      await req.json()

    const exists = await Category.findOne({ slug })
    if (exists) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 },
      )
    }

    const category = await Category.create({
      name,
      slug,
      description,
      status,
      image,
      parentId,
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
