import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "@/lib/db";
import { verifyCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword, captchaToken, captchaAnswer } = body;

    // 1. Form validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // CAPTCHA verification disabled for now
    if (captchaToken && captchaAnswer) {
      const isCaptchaValid = verifyCaptcha(captchaToken, captchaAnswer);
      if (!isCaptchaValid) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired CAPTCHA. Please try again." },
          { status: 400 }
        );
      }
    }

    // 3. Check if email already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 4. Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 5. Save user to database
    const newUser = await createUser(name, email, passwordHash);

    // 6. Establish demo session response (never expose password hash)
    const res = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.created_at
      },
      message: "Sign up successful! Welcome to BETADRiX DEMO."
    });

    // Set demo session cookie
    res.cookies.set({
      name: "betadrix_session",
      value: JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email }),
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return res;
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { success: false, error: "A server error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
