import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminSession";
import {
  getEconomicsConfig,
  updateEconomicsConfig,
  validateEconomicsConfig,
} from "@/lib/economics";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/economics
 * Retrieves the current central economics configuration.
 * Requires authenticated administrator session.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const config = await getEconomicsConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("Admin economics GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve economics configuration." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/economics & PUT /api/admin/economics
 * Applies changes to the central economics configuration.
 * Requires authenticated administrator session.
 * Protects against concurrent modifications using expectedVersion.
 */
export async function PUT(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request body must be an object." },
        { status: 400 }
      );
    }

    // Concurrency protection: expectedVersion must be specified
    if (body.expectedVersion === undefined || body.expectedVersion === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'expectedVersion' for concurrency protection.",
        },
        { status: 400 }
      );
    }

    if (typeof body.expectedVersion !== "number" || !Number.isInteger(body.expectedVersion)) {
      return NextResponse.json(
        {
          success: false,
          error: "'expectedVersion' must be an integer.",
        },
        { status: 400 }
      );
    }

    // Validate economics configuration values
    const validation = validateEconomicsConfig(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Invalid economics configuration.",
        },
        { status: 400 }
      );
    }

    try {
      const updatedConfig = await updateEconomicsConfig({
        expectedVersion: body.expectedVersion,
        globalHouseEdge: validation.data.globalHouseEdge,
        games: validation.data.games,
        adminId: auth.adminId,
        reason: typeof body.reason === "string" ? body.reason : undefined,
      });

      return NextResponse.json({
        success: true,
        config: updatedConfig,
      });
    } catch (err: any) {
      if (
        err?.code === "CONFIGURATION_VERSION_CONFLICT" ||
        err?.message === "CONFIGURATION_VERSION_CONFLICT"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "CONFIGURATION_VERSION_CONFLICT",
            message:
              "The economics configuration was updated by another administrator. Please refresh and review.",
            currentVersion: err.currentVersion,
          },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Admin economics PUT/POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update economics configuration." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
