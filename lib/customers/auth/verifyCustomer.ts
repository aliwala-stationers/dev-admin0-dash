// @/lib/customers/auth/verifyCustomer.ts

import { jwtVerify, JWTPayload } from "jose"
import { JWT_SECRET } from "@/lib/customers/auth/constants"
import { AUTH_ERRORS } from "@/lib/customers/auth/errors"

/**
 * @summary Verify customer JWT from Authorization header
 */
export async function verifyCustomer(req: Request): Promise<JWTPayload> {
  const authHeader = req.headers.get("authorization")

  /**
   * Step 1: Validate header format
   */
  if (!authHeader) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  const [scheme, token] = authHeader.split(" ")

  if (scheme !== "Bearer" || !token) {
    throw AUTH_ERRORS.UNAUTHORIZED()
  }

  /**
   * Step 2: Verify token
   */
  let payload: JWTPayload

  try {
    const result = await jwtVerify(token, JWT_SECRET, {
      issuer: "mobile",
      audience: "customer-app",
    })

    payload = result.payload
  } catch {
    throw AUTH_ERRORS.INVALID_TOKEN()
  }

  /**
   * Step 3: Validate role
   */
  if (payload.role !== "customer") {
    throw AUTH_ERRORS.FORBIDDEN()
  }

  return payload
}
