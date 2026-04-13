// @/lib/customers/auth/verifyCustomer.ts

import { jwtVerify, JWTPayload } from "jose"
import { CUSTOMER_JWT_SECRET, AUTH_META } from "@/lib/auth/constants"
import { AUTH_ERRORS } from "@/lib/auth/errors"

/**
 * 🔐 Strongly-typed payload (recommended)
 */
export type CustomerJWTPayload = JWTPayload & {
  sub: string
  phone: string
  role: "customer"
}

/**
 * @summary Verify customer JWT from Authorization header
 */
export async function verifyCustomer(
  req: Request,
): Promise<CustomerJWTPayload> {
  const authHeader = req.headers.get("authorization")

  /**
   * Step 1: Validate header
   */
  if (!authHeader) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token?.trim()) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  /**
   * Step 2: Verify token
   */
  let payload: JWTPayload

  try {
    const result = await jwtVerify(token.trim(), CUSTOMER_JWT_SECRET, {
      issuer: AUTH_META.CUSTOMER.issuer,
      audience: AUTH_META.CUSTOMER.audience,
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
  if (!payload.sub || payload.role !== "customer") {
    throw AUTH_ERRORS.INVALID_PAYLOAD()
  }

  return payload as CustomerJWTPayload
}
