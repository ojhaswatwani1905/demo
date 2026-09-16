import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, updateSiteConfig, getGeneralConfig, updateGeneralConfig, recordAdminAuditLog } from "@/lib/db";
import { authenticateAdmin } from "@/lib/adminSession";
import { publishRealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const siteConfig = await getSiteConfig();
    const generalConfig = await getGeneralConfig();
    return NextResponse.json({
      success: true,
      config: {
        telegramUrl: siteConfig.telegram_url,
        whatsappUrl: siteConfig.whatsapp_url,
        siteName: siteConfig.site_name,
        updatedAt: siteConfig.updated_at
      },
      general: generalConfig
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
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { telegramUrl, whatsappUrl, general } = body;

    let updatedSiteConfig = null;
    let updatedGeneralConfig = null;

    // 1. Handle Support Settings (telegram / whatsapp)
    if (telegramUrl !== undefined || whatsappUrl !== undefined) {
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

      const prevConfig = await getSiteConfig();
      updatedSiteConfig = await updateSiteConfig(telegramUrl, whatsappUrl);

      await recordAdminAuditLog(
        auth.adminId || "admin",
        "ADMIN_SUPPORT_UPDATE",
        "site_config",
        "1",
        { telegram: prevConfig.telegram_url, whatsapp: prevConfig.whatsapp_url },
        { telegram: updatedSiteConfig.telegram_url, whatsapp: updatedSiteConfig.whatsapp_url },
        "Admin updated support channel URLs"
      );

      publishRealtimeEvent("SUPPORT_UPDATED", {
        telegramUrl: updatedSiteConfig.telegram_url,
        whatsappUrl: updatedSiteConfig.whatsapp_url,
        siteName: updatedSiteConfig.site_name,
        updatedAt: updatedSiteConfig.updated_at
      });
    }

    // 2. Handle General Configuration
    if (general && typeof general === "object") {
      const prevGen = await getGeneralConfig();
      updatedGeneralConfig = await updateGeneralConfig(general);

      await recordAdminAuditLog(
        auth.adminId || "admin",
        "ADMIN_GENERAL_UPDATE",
        "general_config",
        "1",
        prevGen,
        updatedGeneralConfig,
        "Admin updated general platform settings"
      );

      publishRealtimeEvent("GENERAL_CONFIG_UPDATED", updatedGeneralConfig);
    }

    const currentSite = updatedSiteConfig || await getSiteConfig();
    const currentGen = updatedGeneralConfig || await getGeneralConfig();

    return NextResponse.json({
      success: true,
      config: {
        telegramUrl: currentSite.telegram_url,
        whatsappUrl: currentSite.whatsapp_url,
        siteName: currentSite.site_name,
        updatedAt: currentSite.updated_at
      },
      general: currentGen,
      message: "Configuration updated successfully and published via real-time."
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
