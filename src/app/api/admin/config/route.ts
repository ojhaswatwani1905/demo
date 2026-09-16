import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, updateSiteConfig } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Verify authenticated admin session
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

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
    console.error("Admin config GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // 1. Verify authenticated admin session
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { telegramUrl, whatsappUrl } = body;

    // Validate URL formats if provided
    if (telegramUrl && typeof telegramUrl === "string" && telegramUrl.trim() !== "") {
      try {
        new URL(telegramUrl.trim());
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid Telegram URL format. Must be a valid http/https URL." },
          { status: 400 }
        );
      }
    }

    if (whatsappUrl && typeof whatsappUrl === "string" && whatsappUrl.trim() !== "") {
      try {
        new URL(whatsappUrl.trim());
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid WhatsApp URL format. Must be a valid http/https URL." },
          { status: 400 }
        );
      }
    }

    const updated = await updateSiteConfig(telegramUrl, whatsappUrl);

    return NextResponse.json({
      success: true,
      config: {
        telegramUrl: updated.telegram_url,
        whatsappUrl: updated.whatsapp_url,
        siteName: updated.site_name,
        updatedAt: updated.updated_at
      },
      message: "Site configuration updated successfully in PostgreSQL."
    });
  } catch (error) {
    console.error("Admin config POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update configuration in database" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }
  return NextResponse.json(
    { success: false, error: "Configuration reset not allowed" },
    { status: 405 }
  );
}

