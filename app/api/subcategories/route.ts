// @/app/api/subcategories/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subcategory from "@/models/Subcategory"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import mongoose from "mongoose"

type SubcategoryDoc = {
  _id: any
  name: string
  slug: string
  description?: string
  status: string
  image?: string
  category?: any
  productCount?: number
  createdAt: Date
}

/**
 *  Serialize subcategory
 */
function serializeSubcategory(subcategory: SubcategoryDoc) {
  return {
    id: subcategory._id.toString(),
    name: subcategory.name,
    slug: subcategory.slug,
    description: subcategory.description || "",
    status: subcategory.status,
    image: subcategory.image || "",
    category: subcategory.category?.toString?.() || null,
    productCount: subcategory.productCount || 0,
    createdAt: subcategory.createdAt,
  }
}

/**
 * 📄 GET subcategories (admin)
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin()
    await connectDB()

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")

    const matchStage: any = {}
    if (categoryId) {
      matchStage.category = new mongoose.Types.ObjectId(categoryId)
    }

    const pipeline: any[] = [
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "subcategory",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]

    if (Object.keys(matchStage).length > 0) {
      pipeline.unshift({ $match: matchStage })
    }

    const subcategories = await Subcategory.aggregate(pipeline)

    return NextResponse.json({
      success: true,
      data: subcategories.map(serializeSubcategory),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 },
    )
  }
}

/**
 * ➕ POST subcategory (admin)
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin()
    await connectDB()

    const body = await req.json()
    const { name, slug, description, status, image, category } = body

    /**
     * 🔐 Validate
     */
    if (!name || !slug || !category) {
      return NextResponse.json(
        { error: "Name, slug, and category are required" },
        { status: 400 },
      )
    }

    /**
     * 🔍 Slug uniqueness
     */
    const exists = await Subcategory.findOne({ slug })

    if (exists) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 },
      )
    }

    /**
     * 🔗 Validate category
     */
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    /**
     * ➕ Create
     */
    const created = await Subcategory.create({
      name: String(name).trim(),
      slug: String(slug).trim(),
      description: description?.trim() || "",
      status: status === false ? false : true,
      image: image || "",
      category,
    })

    return NextResponse.json(
      {
        success: true,
        subcategory: serializeSubcategory(created.toObject()),
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 },
    )
  }
}
