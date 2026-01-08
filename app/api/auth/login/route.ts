import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming JSON
    const { email, password } = await req.json();

    // 2. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 3. Connect to the Dumpster (Database)
    await connectDB();

    // 4. Find the user (explicitly selecting password because we set select: false in schema)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 5. Check Password
    // NOTE: For this "Trojan Horse" phase, we are doing a direct string compare.
    // In Phase 3 (Security Hardening), we will wrap this with bcrypt.compare(password, user.password).
    const isMatch = (password === user.password); 

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 6. Strip the password before returning
    const userWithoutPassword = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isPremium: user.isPremium
    };

    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}