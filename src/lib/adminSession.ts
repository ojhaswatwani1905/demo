import crypto from "crypto";
import { findAdminByAdminId } from "./db";

export const ADMIN_COOKIE_NAME = "betadrix_admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

// Server-only session secret
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "betadrix_internal_admin_session_key_2026_super_secure";

interface TokenPayload {
  adminId: string;
  iat: number;
  exp: number;
}

/**
 * Generates an HMAC-SHA256 signed session token for an authenticated administrator.
 */
export function signAdminToken(adminId: string): string {
  const payload: TokenPayload = {
    adminId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies the integrity and validity of an admin session token.
 */
export function verifyAdminToken(token: string): { valid: boolean; adminId?: string; error?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing session token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid token format" };
  }

  const [payloadBase64, signature] = parts;

  // Verify HMAC signature in constant time
  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, error: "Invalid token signature" };
  }

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "Your admin session has expired." };
    }

    if (!payload.adminId) {
      return { valid: false, error: "Malformed session payload" };
    }

    return { valid: true, adminId: payload.adminId };
  } catch (err) {
    return { valid: false, error: "Failed to parse session token" };
  }
}

/**
 * Extracts and verifies the admin session from an incoming HTTP Request.
 * Also checks that the admin account is still valid and active in the database.
 */
export async function authenticateAdmin(req: Request): Promise<{ authenticated: boolean; adminId?: string; error?: string }> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return { authenticated: false, error: "No session cookie found" };
  }

  // Parse cookies
  const cookies = cookieHeader.split(";").reduce<Record<string, string>>((acc, pair) => {
    const [k, ...v] = pair.trim().split("=");
    if (k && v.length > 0) {
      acc[k] = decodeURIComponent(v.join("="));
    }
    return acc;
  }, {});

  const token = cookies[ADMIN_COOKIE_NAME];
  if (!token) {
    return { authenticated: false, error: "Admin session required" };
  }

  const tokenResult = verifyAdminToken(token);
  if (!tokenResult.valid || !tokenResult.adminId) {
    return { authenticated: false, error: tokenResult.error || "Invalid session" };
  }

  // Cross-reference with database to verify active administrator
  const adminUser = await findAdminByAdminId(tokenResult.adminId);
  if (!adminUser || !adminUser.is_active) {
    return { authenticated: false, error: "Administrator account inactive or removed" };
  }

  return { authenticated: true, adminId: adminUser.admin_id };
}

/**
 * Generates the Set-Cookie header string for establishing an authenticated admin session.
 */
export function buildAdminCookie(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${secureFlag}`;
}

/**
 * Generates the Set-Cookie header string for logging out and clearing the admin session.
 */
export function buildLogoutCookie(): string {
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
}
