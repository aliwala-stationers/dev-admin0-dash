// @/app/api/uploads/presign/route.ts

import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"

import { r2 } from "@/lib/r2storage"
import { jwtVerify } from "jose"
import { CUSTOMER_JWT_SECRET, AUTH_META } from "@/lib/auth/constants"
import { AUTH_ERRORS, AuthError } from "@/lib/auth/errors"
import { verifyAdmin } from "@/lib/auth/verifyAdmin"

/**
 * 🔐 ENV
 */
const R2_BUCKET = process.env.R2_BUCKET!
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL!
const APP_ENV = process.env.APP_ENV || "dev"

/**
 * 🔒 Allowed content types (IMPORTANT)
 */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

/**
 * 🔒 Max file size (bytes) → optional enforcement (client must respect)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * 🔐 Resolve user (admin OR customer)
 */
async function resolveUser(req: NextRequest) {
  // Try admin auth first (from cookies)
  try {
    const adminPayload = await verifyAdmin()
    return {
      role: "admin" as const,
      userId: adminPayload.sub,
    }
  } catch {
    // Not admin, try customer auth
  }

  // Customer auth from Authorization header
  const authHeader = req.headers.get("authorization")

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]

    if (!token?.trim()) throw AUTH_ERRORS.UNAUTHORIZED()

    try {
      const { payload } = await jwtVerify(
        token.trim(),
        CUSTOMER_JWT_SECRET,
        AUTH_META.CUSTOMER,
      )

      return {
        role: "customer" as const,
        userId: payload.sub,
      }
    } catch {
      throw AUTH_ERRORS.INVALID_TOKEN()
    }
  }

  throw AUTH_ERRORS.UNAUTHORIZED()
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req)

    const body = await req.json()
    const { contentType, folder = "uploads", fileSize } = body

    /**
     * Step 1: Validate contentType
     */
    if (!contentType || typeof contentType !== "string") {
      return NextResponse.json(
        { error: "Invalid contentType" },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      )
    }

    /**
     * Step 2: Optional file size validation
     */
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 },
      )
    }

    /**
     * 🔒 Step 3: Folder control
     */
    let finalFolder = folder

    if (user.role === "customer") {
      finalFolder = `customers/${user.userId}`
    }

    /**
     * Step 4: Safe extension mapping
     */
    const EXT_MAP: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }

    const ext = EXT_MAP[contentType] || "bin"

    /**
     * Step 5: Generate key
     */
    const key = `${APP_ENV}/${finalFolder}/${randomUUID()}.${ext}`

    /**
     * Step 6: Generate presigned URL
     */
    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 60 * 10 },
    )

    const publicUrl = `${R2_PUBLIC_BASE_URL}/${key}`

    /**
     * Step 7: Response
     */
    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    })
  } catch (error: unknown) {
    console.error("Presign error:", error)

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 },
    )
  }
}
