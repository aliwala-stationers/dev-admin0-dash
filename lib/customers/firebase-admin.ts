// @/lib/customers/firebase-admin.ts

import admin from "firebase-admin"
import { FIREBASE_SERVICE_ACCOUNT } from "@/lib/customers/firebase/constants"

/**
 * 🔥 Singleton app instance
 */
const app =
  admin.apps.length > 0
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT),
      })

export default admin
export { app }
