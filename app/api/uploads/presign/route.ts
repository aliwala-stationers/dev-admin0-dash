import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// Update the import to match the file we just created
import { r2 } from "@/lib/r2storage"; 

// Pull vars from env directly or the storage file if exported
const R2_BUCKET = process.env.R2_BUCKET!;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL!;

export async function POST(req: NextRequest) {
  // 1. SECURITY: Gatekeeper Check
  const token = (await cookies()).get("aliwala_admin_token");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contentType, folder = "uploads" } = await req.json();

    if (!contentType) {
      return NextResponse.json(
        { error: "Missing contentType" },
        { status: 400 }
      );
    }

    // 2. ORGANIZATION: Use folders (e.g. 'avatars/uuid', 'products/uuid')
    // We try to keep the extension if possible, or default to bin
    const ext = contentType.split('/')[1] || 'bin';
    const key = `${folder}/${randomUUID()}.${ext}`;

    // 3. GENERATE SIGNATURE
    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
        // ACL: "public-read", // Uncomment if your bucket policy requires it
      }),
      { expiresIn: 60 * 10 } // 10 min
    );

    const publicUrl = `${R2_PUBLIC_BASE_URL}/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}