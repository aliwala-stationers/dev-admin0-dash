// @/lib/customers/firebase/constants.ts

import type { ServiceAccount } from "firebase-admin"

/**
 * 🔐 Extract env
 */
const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY

/**
 * 🔐 Validate env
 */
if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Missing Firebase Admin environment variables")
}

/**
 * 🔥 Fix multiline key (Vercel-safe)
 */
privateKey = privateKey.replace(/\\n/g, "\n")

/**
 * 🔐 Export typed service account
 */
export const FIREBASE_SERVICE_ACCOUNT: ServiceAccount = {
  projectId,
  clientEmail,
  privateKey,
}
