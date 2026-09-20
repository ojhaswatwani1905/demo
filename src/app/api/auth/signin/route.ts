import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { verifyCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, captchaToken, captchaAnswer } = body;

    // 1. Form validation
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your password." },
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

    // 3. Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    // 4. Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    // 5. Establish demo session
    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      message: "Authentication successful."
    });

    res.cookies.set({
      name: "betadrix_session",
      value: JSON.stringify({ id: user.id, name: user.name, email: user.email }),
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return res;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { success: false, error: "A server error occurred during sign in. Please try again." },
      { status: 500 }
    );
  }
}
