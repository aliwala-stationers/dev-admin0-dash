// @/lib/auth/verifyAdmin.ts

import { jwtVerify, JWTPayload } from "jose"
import { cookies } from "next/headers"
import { ADMIN_JWT_SECRET, AUTH_COOKIES, AUTH_META } from "@/lib/auth/constants"
import { AUTH_ERRORS } from "@/lib/auth/errors"

/**
 * 🔐 Strongly-typed payload
 */
export type AdminJWTPayload = JWTPayload & {
  sub: string
  email: string
  role: "admin"
}

/**
 * @summary Verify admin JWT from cookie
 */
export async function verifyAdmin(): Promise<AdminJWTPayload> {
  /**
   * Step 1: Read cookie
   */
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIES.ADMIN)?.value

  if (!token?.trim()) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  /**
   * Step 2: Verify JWT
   */
  let payload: JWTPayload

  try {
    const result = await jwtVerify(token.trim(), ADMIN_JWT_SECRET, {
      issuer: AUTH_META.ADMIN.issuer,
      audience: AUTH_META.ADMIN.audience,
    })

    payload = result.payload
  } catch (err: any) {
    /**
     * 🔥 Optional: differentiate expiry
     */
    if (err?.code === "ERR_JWT_EXPIRED") {
      throw AUTH_ERRORS.TOKEN_EXPIRED()
    }

    throw AUTH_ERRORS.INVALID_TOKEN()
  }

  /**
   * Step 3: Validate payload shape
   */
  if (!payload.sub || payload.role !== "admin") {
    throw AUTH_ERRORS.INVALID_PAYLOAD()
  }

  return payload as AdminJWTPayload
}
