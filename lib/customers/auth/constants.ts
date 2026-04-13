// @/lib/customers/auth/constants.ts

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
