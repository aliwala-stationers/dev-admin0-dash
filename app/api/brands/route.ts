// @/app/api/brands/route.ts

import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Brand from "@/models/Brand"
import mongoose from "mongoose"
import { jwtVerify, JWTPayload } from "jose"
import { ADMIN_JWT_SECRET, AUTH_META } from "@/lib/auth/constants"
import { AUTH_ERRORS, AuthError } from "@/lib/auth/errors"

/**
 * 🧾 Types
 */
type AdminJWTPayload = JWTPayload & {
  sub: string
  role: "admin"
}

type BrandDoc = {
  _id: any
  name: string
  slug: string
  logo?: string
  createdAt: Date
}

/**
 * 🔐 Verify admin
 */
async function verifyAdmin(req: NextRequest): Promise<AdminJWTPayload> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader) throw AUTH_ERRORS.UNAUTHORIZED()

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token?.trim()) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  const { payload } = await jwtVerify(token.trim(), ADMIN_JWT_SECRET, {
    issuer: AUTH_META.ADMIN.issuer,
    audience: AUTH_META.ADMIN.audience,
  })

  if (!payload.sub || payload.role !== "admin") {
    throw AUTH_ERRORS.FORBIDDEN()
  }

  return payload as AdminJWTPayload
}

/**
 * 📦 Serialize brand
 */
function serializeBrand(brand: BrandDoc) {
  return {
    id: brand._id.toString(),
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo || "",
    createdAt: brand.createdAt,
  }
}

/**
 * 📄 GET brands (admin)
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)
    await connectDB()

    const brands = await Brand.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: brands.map(serializeBrand),
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 },
    )
  }
}

/**
 * ➕ POST brand (admin)
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req)
    await connectDB()

    const body = await req.json()
    const { name, slug, logo } = body

    /**
     * 🔐 Validate
     */
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      )
    }

    /**
     * 🔍 Slug uniqueness
     */
    const exists = await Brand.findOne({ slug })

    if (exists) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 },
      )
    }

    /**
     * ➕ Create
     */
    const created = await Brand.create({
      name: String(name).trim(),
      slug: String(slug).trim(),
      logo: logo || "",
    })

    return NextResponse.json(
      {
        success: true,
        brand: serializeBrand(created.toObject()),
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

    /**
     * Handle duplicate index fallback (race condition)
     */
    if (error instanceof mongoose.Error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: "Brand already exists" },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 },
    )
  }
}
