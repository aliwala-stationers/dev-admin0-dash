// @/lib/auth/constants.ts

/**
 * 🔐 Validate env
 */
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not defined")
}

/**
 * 🔐 Encoded secrets (jose requires Uint8Array)
 */
export const CUSTOMER_JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET,
)

export const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET,
)

/**
 * 🍪 Cookie names (centralized)
 */
export const AUTH_COOKIES = {
  ADMIN: "__admin_token",
}

/**
 * 🧾 Issuer/Audience (centralized = consistency)
 */
export const AUTH_META = {
  CUSTOMER: {
    issuer: "mobile",
    audience: "customer-app",
  },
  ADMIN: {
    issuer: "admin",
    audience: "admin-panel",
  },
}
