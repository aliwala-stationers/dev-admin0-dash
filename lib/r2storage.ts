import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto" // Native Node.js crypto, no extra package needed

// 1. ENVIRONMENT & CONSTANTS
// We export these so API routes can use them without re-typing process.env...
export const R2_BUCKET = process.env.R2_BUCKET!
export const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL!
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

// Safety Check: Warn in Dev, but don't crash until we try to use it
if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET
) {
  console.warn(
    "⚠️ R2 Storage environment variables are missing. File uploads will fail.",
  )
}

// 2. CLIENT INITIALIZATION
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
})

// --- HELPER FUNCTIONS ---

/**
 * A. GENERATE PRESIGNED URL (Preferred Method)
 * Generates a direct-upload URL for the frontend.
 * The frontend uploads DIRECTLY to R2. The server never touches the file.
 * * @param folder - e.g. "avatars", "products"
 * @param contentType - e.g. "image/png"
 */
export async function getPresignedUploadUrl(
  folder: string,
  contentType: string,
) {
  try {
    // Generate unique filename: "folder/uuid-random.ext"
    const ext = contentType.split("/")[1] || "bin"
    const key = `${folder}/${randomUUID()}.${ext}`

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      // ACL: "public-read", // Uncomment if your bucket isn't public by default
    })

    // Valid for 10 minutes (600s)
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 })

    return {
      uploadUrl, // The hidden PUT url
      publicUrl: `${R2_PUBLIC_BASE_URL}/${key}`, // The final display URL
      key, // The storage key (for deletion later)
    }
  } catch (error) {
    console.error("Presign Error:", error)
    throw new Error("Failed to sign URL")
  }
}

/**
 * B. DELETE FILE
 * Deletes a file from R2 using its full URL or Key
 * @param fileKeyOrUrl - Can be "https://.../key.jpg" or just "key.jpg"
 */
export async function deleteFile(fileKeyOrUrl: string) {
  try {
    // Clean input: If it's a full URL, strip the domain to get the Key
    const key = fileKeyOrUrl.replace(`${R2_PUBLIC_BASE_URL}/`, "")

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })

    await r2.send(command)
    return true
  } catch (error) {
    console.error("R2 Delete Error:", error)
    return false
  }
}

/**
 * C. SERVER-SIDE UPLOAD (Fallback Method)
 * Use only for small files if Presigning is impossible.
 * Uploads a buffer directly from the Next.js server.
 */
export async function uploadFileServerSide(
  buffer: Buffer | Uint8Array,
  filename: string,
  contentType: string,
) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  })

  try {
    await r2.send(command)
    return `${R2_PUBLIC_BASE_URL}/${filename}`
  } catch (error) {
    console.error("R2 Server-Side Upload Error:", error)
    throw new Error("Failed to upload file")
  }
}
