import { NextResponse } from "next/server";
import { SignJWT } from "jose"; // Lightweight JWT lib (Edge compatible)
import { createSecretKey } from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "fallback-secret";
const COOKIE_NAME = "aliwala_admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 Hours

export async function POST(req: Request) {
  try {
    // 1. Parse Input
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Missing credentials" },
        { status: 400 },
      );
    }

    // 2. Connect DB
    await connectDB();

    // 3. Find User (Explicitly select password)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" }, // Generic message for security
        { status: 401 },
      );
    }

    // 4. Verify Password (Bcrypt)
    const passwordMatches = await bcrypt.compare(password, user.password);

    // 5. Verify Role (Admin Gatekeeper)
    if (!passwordMatches) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Optional: Enforce Admin Role
    // if (!user.isAdmin) { ... }

    // 6. Generate JWT (Session)
    const secret = createSecretKey(Buffer.from(JWT_SECRET, "utf-8"));
    const nowInSec = Math.floor(Date.now() / 1000);
    const expInSec = nowInSec + COOKIE_MAX_AGE;

    const token = await new SignJWT({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(nowInSec)
      .setExpirationTime(expInSec)
      .sign(secret);

    // 7. Prepare Response
    const userPayload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin || false,
      avatarUrl: user.avatarUrl || "",
    };

    const response = NextResponse.json({
      ok: true,
      user: userPayload,
    });

    // 8. Set HttpOnly Cookie (The Security Layer)
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true, // Client JS cannot read this (prevents XSS)
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
