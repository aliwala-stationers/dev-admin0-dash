// @/app/api/brands/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Brand from "@/models/Brand"
import Product from "@/models/Product"
import mongoose from "mongoose"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"
import { AuthError } from "@/lib/auth/errors"
import { logServerError } from "@/lib/server/errorlogs"

type RouteContext = {
  params: Promise<{ id: string }>
}

type BrandDoc = {
  _id: any
  name: string
  slug: string
  description: string
  status: boolean
  logo?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 📦 Serialize brand
 */
function serializeBrand(brand: BrandDoc) {
  return {
    id: brand._id.toString(),
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    status: brand.status,
    logo: brand.logo || "",
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  }
}

/**
 * 🔍 Validate ObjectId
 */
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * 📄 GET brand
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectDB()

    const brand = await Brand.findById(id).lean()

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      brand: serializeBrand(brand),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/brands/${id}`,
        method: "GET",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch brand"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/brands/${id}`,
      method: "GET",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ✏️ UPDATE brand
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectDB()

    const body = await req.json()

    /**
     * 🔍 Slug conflict
     */
    if (body.slug) {
      const conflict = await Brand.findOne({
        _id: { $ne: id },
        slug: body.slug,
      })

      if (conflict) {
        await logServerError({
          errorType: "duplicate",
          errorMessage: "Slug already exists",
          endpoint: `/api/brands/${id}`,
          method: "PUT",
          requestData: body,
        })
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 },
        )
      }
    }

    const updated = await Brand.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      brand: serializeBrand(updated),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/brands/${id}`,
        method: "PUT",
        requestData: await req.json().catch(() => ({})),
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to update brand"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/brands/${id}`,
      method: "PUT",
      requestData: await req.json().catch(() => ({})),
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * ❌ DELETE brand
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    await verifyAdmin()

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectDB()

    /**
     * 🔒 Prevent delete if used in products
     */
    const inUse = await Product.exists({ brand: id })

    if (inUse) {
      return NextResponse.json(
        { error: "Cannot delete brand linked to products" },
        { status: 400 },
      )
    }

    const deleted = await Brand.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Brand deleted",
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/brands/${id}`,
        method: "DELETE",
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete brand"
    await logServerError({
      errorType: "server",
      errorMessage,
      endpoint: `/api/brands/${id}`,
      method: "DELETE",
      stackTrace: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
