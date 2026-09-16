import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const challenge = generateCaptcha();
    return NextResponse.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error("CAPTCHA generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate CAPTCHA challenge" },
      { status: 500 }
    );
  }
}
