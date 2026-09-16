import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({
      success: true,
      config: {
        telegramUrl: config.telegram_url,
        whatsappUrl: config.whatsapp_url,
        siteName: config.site_name,
        updatedAt: config.updated_at
      }
    });
  } catch (error) {
    console.error("Config API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch site configuration" },
      { status: 500 }
    );
  }
}
