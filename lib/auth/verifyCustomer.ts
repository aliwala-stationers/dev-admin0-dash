// @/lib/auth/verifyCustomer.ts

import { jwtVerify } from "jose"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

/**
 * Verify customer JWT from Authorization header
 */
export async function verifyCustomer(req: Request) {
  const authHeader = req.headers.get("authorization")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null

  if (!token) {
    throw new Error("UNAUTHORIZED")
  }

  const { payload } = await jwtVerify(token, SECRET, {
    issuer: "mobile",
    audience: "customer-app",
  })

  if (!payload || payload.role !== "customer") {
    throw new Error("FORBIDDEN")
  }

  return payload // contains sub (customerId)
}
