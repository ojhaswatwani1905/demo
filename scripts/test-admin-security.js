/**
 * BETADRiX Administrator Security Verification Suite
 *
 * Strict automated security & authorization test suite verifying:
 * 1. Unauthenticated /admin renders dedicated login with no public navigation
 * 2. Unauthenticated /admin/dashboard redirects to /admin
 * 3. Wrong credentials return generic "Invalid administrator credentials."
 * 4. Correct credentials authenticate and establish secure session
 * 5. Session cookie has HttpOnly, SameSite=Lax, Path=/, and Secure in production
 * 6. Unauthenticated requests to all admin endpoints return 401 Unauthorized
 * 7. Unauthenticated mutation attempts (POST/PUT/PATCH/DELETE) return 401 Unauthorized
 * 8. Normal user session (betadrix_session) cannot access admin dashboard or APIs
 * 9. Authenticated admin requests succeed with 200 OK and no secret leakage
 * 10. Logout invalidates server-side session (reusing original cookie returns 401)
 * 11. Public casino pages load cleanly with zero admin links
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// Automatically load environment variables from gitignored .env.local if present
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvLocal();

const TEST_ADMIN_ID = process.env.ADMIN_ID || "admin";
const TEST_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!TEST_ADMIN_PASSWORD) {
  console.error("FATAL: ADMIN_PASSWORD environment variable is not defined.");
  console.error("Please configure ADMIN_PASSWORD in your environment or .env.local file.");
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "localhost";

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const opts = { ...options, headers: { ...(options.headers || {}) } };
    let bodyStr = null;
    if (postData !== undefined && postData !== null) {
      bodyStr = typeof postData === "string" ? postData : JSON.stringify(postData);
      opts.headers["Content-Length"] = Buffer.byteLength(bodyStr);
    }
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json: json,
        });
      });
    });
    req.on("error", reject);
    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

async function runSecuritySuite() {
  console.log("==================================================");
  console.log("BETADRiX ADMIN COMPREHENSIVE SECURITY TEST SUITE");
  console.log("==================================================\n");

  const results = {};
  let originalAdminCookie = "";
  const normalUserCookie =
    'betadrix_session={"id":1,"name":"Regular User","email":"regular@example.com"}';

  try {
    // ----------------------------------------------------
    // TEST 1: Unauthenticated /admin
    // ----------------------------------------------------
    console.log("[1/11] Testing Unauthenticated /admin...");
    const res1 = await request({
      hostname: HOST,
      port: PORT,
      path: "/admin",
      method: "GET",
    });
    const hasAdminLogin =
      res1.body.includes("BETADRiX ADMIN") || res1.body.includes("Admin ID");
    const hasPublicNavbar =
      res1.body.includes("Open Games Lobby") && res1.body.includes("GAMES");
    if (res1.statusCode === 200 && hasAdminLogin && !hasPublicNavbar) {
      results["Unauthenticated /admin"] = true;
      console.log("  ✓ /admin renders dedicated Admin Login with NO public navigation");
    } else {
      results["Unauthenticated /admin"] = false;
      console.error("  ✗ Failed: /admin rendered incorrectly or leaked public navigation");
    }

    // ----------------------------------------------------
    // TEST 2: Unauthenticated /admin/dashboard
    // ----------------------------------------------------
    console.log("[2/11] Testing Unauthenticated /admin/dashboard...");
    const res2 = await request({
      hostname: HOST,
      port: PORT,
      path: "/admin/dashboard",
      method: "GET",
    });
    const isRedirect =
      res2.statusCode === 307 || res2.statusCode === 308 || res2.statusCode === 302;
    const redirectLocation = res2.headers.location;
    if (isRedirect && redirectLocation && redirectLocation.includes("/admin")) {
      results["Unauthenticated /admin/dashboard"] = true;
      console.log(
        `  ✓ /admin/dashboard immediately returned HTTP ${res2.statusCode} redirect to ${redirectLocation}`
      );
    } else {
      results["Unauthenticated /admin/dashboard"] = false;
      console.error(
        `  ✗ Failed: /admin/dashboard returned status ${res2.statusCode} instead of redirect to /admin`
      );
    }

    // ----------------------------------------------------
    // TEST 3: Wrong Credentials Handling
    // ----------------------------------------------------
    console.log("[3/11] Testing Wrong Credentials Handling...");
    const wrongIdRes = await request(
      {
        hostname: HOST,
        port: PORT,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { adminId: "nonexistent_admin", password: "SomeRandomWrongPassword99!" }
    );

    const wrongPassRes = await request(
      {
        hostname: HOST,
        port: PORT,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { adminId: TEST_ADMIN_ID, password: "IncorrectPassword123!" }
    );

    const emptyIdRes = await request(
      {
        hostname: HOST,
        port: PORT,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { adminId: "", password: "SomePassword123!" }
    );

    const emptyPassRes = await request(
      {
        hostname: HOST,
        port: PORT,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { adminId: TEST_ADMIN_ID, password: "" }
    );

    const bothEmptyRes = await request(
      {
        hostname: HOST,
        port: PORT,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { adminId: "", password: "" }
    );

    const genericErrorMsg = "Invalid administrator credentials.";
    const wrongIdOk =
      wrongIdRes.statusCode === 401 && wrongIdRes.json?.error === genericErrorMsg;
    const wrongPassOk =
      wrongPassRes.statusCode === 401 && wrongPassRes.json?.error === genericErrorMsg;
    const emptyIdOk =
      (emptyIdRes.statusCode === 400 || emptyIdRes.statusCode === 401) &&
      emptyIdRes.json?.error === genericErrorMsg;
    const emptyPassOk =
      (emptyPassRes.statusCode === 400 || emptyPassRes.statusCode === 401) &&
      emptyPassRes.json?.error === genericErrorMsg;
    const bothEmptyOk =
      (bothEmptyRes.statusCode === 400 || bothEmptyRes.statusCode === 401) &&
      bothEmptyRes.json?.error === genericErrorMsg;

    if (wrongIdOk && wrongPassOk && emptyIdOk && emptyPassOk && bothEmptyOk) {
      results["Wrong credentials"] = true;
      console.log(
        "  ✓ Wrong ID, wrong password, and empty submissions correctly rejected with generic error"
      );
    } else {
      results["Wrong credentials"] = false;
      console.error(
        "  ✗ Failed: Wrong credentials did not yield expected generic rejection",
        {
          wrongIdOk,
          wrongPassOk,
          emptyIdOk,
          emptyPassOk,
          bothEmptyOk,
        }
      );
    }

    // ----------------------------------------------------
    // TEST 4: Correct Credentials & Session Establishment
    // ----------------------------------------------------
    console.log("[4/11] Testing Correct Credentials Login...");
    const loginRes = await request(
      {
        hostname: HOST,
        port: PORT,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { adminId: TEST_ADMIN_ID, password: TEST_ADMIN_PASSWORD }
    );

    const rawSetCookie = loginRes.headers["set-cookie"];
    const cookieHeaderStr = Array.isArray(rawSetCookie)
      ? rawSetCookie.join(";")
      : rawSetCookie || "";

    if (
      loginRes.statusCode === 200 &&
      loginRes.json?.success &&
      cookieHeaderStr.includes("betadrix_admin_session=")
    ) {
      results["Correct credentials"] = true;
      originalAdminCookie = cookieHeaderStr
        .split(";")
        .find((s) => s.trim().startsWith("betadrix_admin_session="))
        .trim();
      console.log("  ✓ Correct credentials successfully authenticated");
    } else {
      results["Correct credentials"] = false;
      console.error(
        "  ✗ Failed: Admin login with valid credentials failed",
        loginRes.json
      );
    }

    // ----------------------------------------------------
    // TEST 5: Secure Session Cookie Attributes
    // ----------------------------------------------------
    console.log("[5/11] Verifying Session Cookie Security Attributes...");
    const hasHttpOnly = /httponly/i.test(cookieHeaderStr);
    const hasSameSite = /samesite=lax/i.test(cookieHeaderStr);
    const hasPath = /path=\//i.test(cookieHeaderStr);
    const hasMaxAge = /max-age=\d+/i.test(cookieHeaderStr);
    const isProd = process.env.NODE_ENV === "production";
    const secureFlagOk = !isProd || /secure/i.test(cookieHeaderStr);

    if (hasHttpOnly && hasSameSite && hasPath && hasMaxAge && secureFlagOk) {
      results["Secure session cookie"] = true;
      console.log(
        "  ✓ Session cookie attributes verified: HttpOnly, SameSite=Lax, Path=/, Max-Age present" +
          (isProd ? ", Secure flag active" : "")
      );
    } else {
      results["Secure session cookie"] = false;
      console.error("  ✗ Failed: Session cookie missing critical security flags", {
        hasHttpOnly,
        hasSameSite,
        hasPath,
        hasMaxAge,
        secureFlagOk,
      });
    }

    // ----------------------------------------------------
    // TEST 6: Unauthenticated Admin APIs
    // ----------------------------------------------------
    console.log("[6/11] Testing All Admin APIs Without Authentication...");
    const adminApiEndpoints = [
      { path: "/api/admin/config", method: "GET" },
      { path: "/api/admin/users", method: "GET" },
      { path: "/api/admin/stats", method: "GET" },
      { path: "/api/admin/activity", method: "GET" },
      { path: "/api/admin/auth/session", method: "GET" },
    ];

    let allUnauthBlocked = true;
    for (const ep of adminApiEndpoints) {
      const res = await request({
        hostname: HOST,
        port: PORT,
        path: ep.path,
        method: ep.method,
      });
      if (res.statusCode !== 401) {
        console.error(
          `  ✗ Endpoint ${ep.path} returned ${res.statusCode} instead of 401 Unauthorized`
        );
        allUnauthBlocked = false;
      }
    }

    if (allUnauthBlocked) {
      results["Unauthenticated admin APIs"] = true;
      console.log(
        "  ✓ All admin APIs strictly reject unauthenticated requests with 401 Unauthorized"
      );
    } else {
      results["Unauthenticated admin APIs"] = false;
    }

    // ----------------------------------------------------
    // TEST 7: Unauthenticated Admin Mutations
    // ----------------------------------------------------
    console.log("[7/11] Testing Unauthenticated Admin Mutation Endpoints...");
    const mutationAttempts = [
      {
        path: "/api/admin/config",
        method: "POST",
        data: {
          telegramUrl: "https://t.me/malicious_takeover_link",
          whatsappUrl: "https://wa.me/999999999",
        },
      },
      {
        path: "/api/admin/config",
        method: "PUT",
        data: { telegramUrl: "https://t.me/malicious_takeover_link" },
      },
      {
        path: "/api/admin/config",
        method: "PATCH",
        data: { promotions: "malicious_promo" },
      },
      {
        path: "/api/admin/config",
        method: "DELETE",
      },
      {
        path: "/api/admin/users",
        method: "POST",
        data: { role: "admin", email: "attacker@example.com" },
      },
      {
        path: "/api/admin/stats",
        method: "POST",
        data: { wipe: true },
      },
      {
        path: "/api/admin/activity",
        method: "POST",
        data: { forged: true },
      },
    ];

    let allMutationsBlocked = true;
    for (const mut of mutationAttempts) {
      const mutRes = await request(
        {
          hostname: HOST,
          port: PORT,
          path: mut.path,
          method: mut.method,
          headers: { "Content-Type": "application/json" },
        },
        mut.data
      );

      if (mutRes.statusCode !== 401) {
        console.error(
          `  ✗ Mutation ${mut.method} ${mut.path} returned ${mutRes.statusCode} instead of 401`
        );
        allMutationsBlocked = false;
      }
    }

    // Verify config in database was not altered
    const publicConfigRes = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/config",
      method: "GET",
    });
    const isConfigClean = !publicConfigRes.body.includes("malicious_takeover_link");

    if (allMutationsBlocked && isConfigClean) {
      results["Unauthenticated admin mutations"] = true;
      console.log(
        "  ✓ All admin mutation endpoints reject unauthenticated requests with 401; DB unaffected"
      );
    } else {
      results["Unauthenticated admin mutations"] = false;
      console.error("  ✗ Failed: Unauthenticated mutation was not properly blocked");
    }

    // ----------------------------------------------------
    // TEST 8: Normal User ≠ Admin Enforcement
    // ----------------------------------------------------
    console.log("[8/11] Testing Normal User ≠ Admin Enforcement...");
    const normalUserEndpoints = [
      { path: "/api/admin/config", method: "GET" },
      { path: "/api/admin/users", method: "GET" },
      { path: "/api/admin/stats", method: "GET" },
      { path: "/api/admin/activity", method: "GET" },
      { path: "/api/admin/auth/session", method: "GET" },
    ];

    let normalUserApisBlocked = true;
    for (const ep of normalUserEndpoints) {
      const normalRes = await request({
        hostname: HOST,
        port: PORT,
        path: ep.path,
        method: ep.method,
        headers: { Cookie: normalUserCookie },
      });
      if (normalRes.statusCode !== 401) {
        console.error(
          `  ✗ Normal user cookie allowed access to ${ep.path} (status: ${normalRes.statusCode})`
        );
        normalUserApisBlocked = false;
      }
    }

    const normalUserDashboardRes = await request({
      hostname: HOST,
      port: PORT,
      path: "/admin/dashboard",
      method: "GET",
      headers: { Cookie: normalUserCookie },
    });
    const normalUserDashboardBlocked =
      normalUserDashboardRes.statusCode === 307 ||
      normalUserDashboardRes.statusCode === 308;

    if (normalUserApisBlocked && normalUserDashboardBlocked) {
      results["Normal user cannot access admin"] = true;
      console.log(
        "  ✓ Normal user session cannot access admin dashboard or APIs (rejected with 401/307)"
      );
    } else {
      results["Normal user cannot access admin"] = false;
      console.error("  ✗ Failed: Normal user session leaked administrator privileges");
    }

    // ----------------------------------------------------
    // TEST 9: Authenticated Admin APIs
    // ----------------------------------------------------
    console.log("[9/11] Testing Authenticated Admin APIs...");
    const authConfigRes = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/config",
      method: "GET",
      headers: { Cookie: originalAdminCookie },
    });
    const authUsersRes = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/users",
      method: "GET",
      headers: { Cookie: originalAdminCookie },
    });
    const authStatsRes = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/stats",
      method: "GET",
      headers: { Cookie: originalAdminCookie },
    });

    const hasNoPasswords =
      !authUsersRes.body.includes("password_hash") &&
      !authUsersRes.body.includes("$2b$");

    const authApisWork =
      authConfigRes.statusCode === 200 &&
      authUsersRes.statusCode === 200 &&
      authStatsRes.statusCode === 200 &&
      hasNoPasswords;

    if (authApisWork) {
      results["Authenticated admin APIs"] = true;
      console.log(
        "  ✓ Authenticated admin APIs return 200 with zero password hash exposure"
      );
    } else {
      results["Authenticated admin APIs"] = false;
      console.error(
        "  ✗ Failed: Authenticated admin APIs failed or exposed credentials",
        {
          configStatus: authConfigRes.statusCode,
          usersStatus: authUsersRes.statusCode,
          statsStatus: authStatsRes.statusCode,
          hasNoPasswords,
        }
      );
    }

    // ----------------------------------------------------
    // TEST 10: Logout Invalidates Original Session (Mandatory)
    // ----------------------------------------------------
    console.log(
      "[10/11] Testing True Server-Side Session Invalidation on Logout..."
    );
    // 1. Verify original cookie is currently authorized
    const preLogoutCheck = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/auth/session",
      method: "GET",
      headers: { Cookie: originalAdminCookie },
    });

    // 2. Call logout with original cookie
    const logoutRes = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/auth/logout",
      method: "POST",
      headers: { Cookie: originalAdminCookie },
    });

    // 3. Reuse the SAME ORIGINAL cookie on authenticated admin endpoints
    const postLogoutSession = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/auth/session",
      method: "GET",
      headers: { Cookie: originalAdminCookie },
    });
    const postLogoutStats = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/stats",
      method: "GET",
      headers: { Cookie: originalAdminCookie },
    });
    const postLogoutConfig = await request({
      hostname: HOST,
      port: PORT,
      path: "/api/admin/config",
      method: "GET",
      headers: { Cookie: originalAdminCookie },
    });

    const logoutInvalidated =
      preLogoutCheck.statusCode === 200 &&
      logoutRes.statusCode === 200 &&
      postLogoutSession.statusCode === 401 &&
      postLogoutStats.statusCode === 401 &&
      postLogoutConfig.statusCode === 401;

    if (logoutInvalidated) {
      results["Logout invalidates original session"] = true;
      console.log(
        "  ✓ Original session cookie was invalidated server-side: reuse rejected with 401 Unauthorized"
      );
    } else {
      results["Logout invalidates original session"] = false;
      console.error(
        "  ✗ Failed: Reusing original cookie after logout was not rejected with 401",
        {
          pre: preLogoutCheck.statusCode,
          logout: logoutRes.statusCode,
          postSession: postLogoutSession.statusCode,
          postStats: postLogoutStats.statusCode,
          postConfig: postLogoutConfig.statusCode,
        }
      );
    }

    // ----------------------------------------------------
    // TEST 11: Public UI Contains No Admin Links
    // ----------------------------------------------------
    console.log(
      "[11/11] Testing Public Casino Routes and Admin Link Absence..."
    );
    const publicRoutes = [
      "/",
      "/games",
      "/promotions",
      "/vip",
      "/bonus",
      "/fair",
      "/sign-in",
      "/sign-up",
    ];
    let publicUiClean = true;

    for (const route of publicRoutes) {
      const pubRes = await request({
        hostname: HOST,
        port: PORT,
        path: route,
        method: "GET",
      });
      if (pubRes.statusCode !== 200) {
        console.error(
          `  ✗ Public route ${route} returned status ${pubRes.statusCode}`
        );
        publicUiClean = false;
      }
      if (
        pubRes.body.includes('href="/admin"') ||
        pubRes.body.includes("href='/admin'")
      ) {
        console.error(`  ✗ Public route ${route} leaked an admin link`);
        publicUiClean = false;
      }
    }

    if (publicUiClean) {
      results["Public UI contains no Admin links"] = true;
      console.log(
        "  ✓ All 8 public routes load cleanly (200 OK) with ZERO admin links/buttons"
      );
    } else {
      results["Public UI contains no Admin links"] = false;
    }
  } catch (err) {
    console.error("Test execution error:", err);
  }

  // ----------------------------------------------------
  // SUMMARY REPORT (Exact format required)
  // ----------------------------------------------------
  console.log("\n==================================================");
  console.log("ADMIN SECURITY TEST RESULTS");
  console.log("==================================================");

  let allPassed = true;
  const expectedTests = [
    "Unauthenticated /admin",
    "Unauthenticated /admin/dashboard",
    "Wrong credentials",
    "Correct credentials",
    "Secure session cookie",
    "Unauthenticated admin APIs",
    "Unauthenticated admin mutations",
    "Normal user cannot access admin",
    "Authenticated admin APIs",
    "Logout invalidates original session",
    "Public UI contains no Admin links",
  ];

  for (const name of expectedTests) {
    const passed = results[name] === true;
    if (passed) {
      console.log(`[PASS] ${name}`);
    } else {
      console.log(`[FAIL] ${name}`);
      allPassed = false;
    }
  }

  console.log("==================================================");
  if (allPassed && Object.keys(results).length === expectedTests.length) {
    console.log("ALL SECURITY TESTS PASSED");
    console.log("==================================================");
    process.exit(0);
  } else {
    console.error("SECURITY TESTS FAILED: One or more checks did not pass.");
    console.log("==================================================");
    process.exit(1);
  }
}

runSecuritySuite();
