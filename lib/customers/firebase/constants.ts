// @/lib/customers/firebase/constants.ts

import type admin from "firebase-admin"

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Missing Firebase Admin environment variables")
}

export const FIREBASE_SERVICE_ACCOUNT: admin.ServiceAccount = {
  projectId,
  clientEmail,
  privateKey: privateKey.replace(/\\n/g, "\n"),
}
