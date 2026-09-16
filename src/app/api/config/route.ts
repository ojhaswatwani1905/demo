import { NextResponse } from "next/server";
import { getSiteConfig, getGeneralConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getSiteConfig();
    const general = await getGeneralConfig();
    return NextResponse.json({
      success: true,
      config: {
        telegramUrl: config.telegram_url,
        whatsappUrl: config.whatsapp_url,
        siteName: config.site_name,
        updatedAt: config.updated_at
      },
      general: {
        platformName: general.platform_name,
        demoMode: general.demo_mode,
        defaultDemoBalance: general.default_demo_balance,
        currencySymbol: general.currency_symbol,
        maintenanceMode: general.maintenance_mode,
        registrationEnabled: general.registration_enabled,
        signinEnabled: general.signin_enabled,
        topupEnabled: general.topup_enabled,
        maxDemoBalance: general.max_demo_balance
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
