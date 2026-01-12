import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "aliwala_admin_token";

export async function POST() {
  const cookieStore = cookies();
  
  // Nuke the cookie
  (await cookieStore).delete(COOKIE_NAME);

  return NextResponse.json({ success: true });
}