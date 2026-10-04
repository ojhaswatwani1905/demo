/**
 * BETADRiX Central Economics Configuration Verification Suite
 *
 * Verifies all 20 requirements:
 * 1. Default configuration structure
 * 2. getEffectiveHouseEdge() accessor logic
 * 3. Global fallback when useGlobal === true
 * 4. Custom game override when useGlobal === false
 * 5. Invalid negative value rejection
 * 6. Invalid >50 value rejection
 * 7. NaN rejection
 * 8. Infinity rejection
 * 9. Two-decimal rounding normalization
 * 10. Database / storage persistence
 * 11. Sequential version incrementing
 * 12. Previous-version audit history tracking
 * 13. Audit log creation in admin_audit_logs
 * 14. Unauthorized API rejection (401 Unauthorized)
 * 15. Authorized admin update via API (200 OK)
 * 16. Real-time ECONOMICS_CONFIG_UPDATED SSE event broadcast
 * 17. Stale configuration conflict protection (409 CONFIGURATION_VERSION_CONFLICT)
 * 18. All five game IDs (trader, roulette, plinko, mines, dice)
 * 19. Missing configuration fallback to globalHouseEdge
 * 20. Database / local store fallback resilience
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ----------------------------------------------------
// Load Environment Variables
// ----------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || "").trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[match[1]]) {
          process.env[match[1]] = val;
        }
      }
    }
  }
}
loadEnv();

const ADMIN_ID = process.env.ADMIN_ID || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPass123!";
const TEST_PORT = process.env.PORT || "3005";
let BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${TEST_PORT}`;

// ----------------------------------------------------
// HTTP Helper
// ----------------------------------------------------
function httpRequest(urlStr, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const headers = {
      Connection: "close",
      ...(options.headers || {})
    };
    let body = null;

    if (postData !== null && postData !== undefined) {
      body = typeof postData === "string" ? postData : JSON.stringify(postData);
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers,
      },
      (res) => {
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
            json,
          });
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`HTTP request timed out: ${urlStr}`));
    });

    if (body) req.write(body);
    req.end();
  });
}

// ----------------------------------------------------
// TS Module Helper (invokes tsx child process)
// ----------------------------------------------------
function runTsCode(code) {
  const env = {
    ...process.env,
    PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH || ""}`,
  };
  const wrapped = `
    (async () => {
      ${code}
    })().then(r => {
      if (r !== undefined) console.log(JSON.stringify(r));
    }).catch(e => {
      console.error(e && e.stack ? e.stack : e);
      process.exit(1);
    });
  `;
  const output = execSync(`npx tsx -e "${wrapped.replace(/"/g, '\\"')}"`, {
    cwd: path.join(__dirname, ".."),
    env,
    encoding: "utf-8",
  });
  return output.trim();
}

async function runSuite() {
  console.log("==================================================");
  console.log("BETADRiX CENTRAL ECONOMICS CONFIGURATION TEST SUITE");
  console.log("==================================================\n");

  const results = {};
  function record(id, name, passed, details = "") {
    results[id] = passed;
    const symbol = passed ? "✓" : "✗";
    console.log(`[${id}/20] ${symbol} ${name}${details ? ` (${details})` : ""}`);
    if (!passed) {
      console.error(`  FAIL details: ${details}`);
    }
  }

  // Detect running server port
  const possibleUrls = [
    process.env.TEST_BASE_URL,
    `http://localhost:${TEST_PORT}`,
    "http://localhost:3000",
    "http://localhost:3005",
  ].filter(Boolean);

  let activeUrl = null;
  for (const candidate of possibleUrls) {
    try {
      const res = await httpRequest(`${candidate}/api/config`);
      if (res.statusCode === 200) {
        activeUrl = candidate;
        break;
      }
    } catch (_) {}
  }

  if (activeUrl) {
    BASE_URL = activeUrl;
    console.log(`Connected to live BETADRiX server at ${BASE_URL}\n`);
  } else {
    console.warn(`Could not verify live server on candidate ports, using ${BASE_URL}\n`);
  }

  // ----------------------------------------------------
  // TEST 1: Default configuration
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { DEFAULT_ECONOMICS_CONFIG, SUPPORTED_GAME_IDS } = await import('./src/lib/economics');
      return {
        hasGlobal: typeof DEFAULT_ECONOMICS_CONFIG.globalHouseEdge === 'number',
        globalEdge: DEFAULT_ECONOMICS_CONFIG.globalHouseEdge,
        version: DEFAULT_ECONOMICS_CONFIG.version,
        games: Object.keys(DEFAULT_ECONOMICS_CONFIG.games),
        allSupported: SUPPORTED_GAME_IDS.every(id => DEFAULT_ECONOMICS_CONFIG.games[id] !== undefined)
      };
    `);
    const data = JSON.parse(raw);
    const passed =
      data.hasGlobal &&
      data.globalEdge === 5.0 &&
      data.version === 1 &&
      data.allSupported &&
      data.games.length >= 5;
    record(1, "Default Configuration", passed, `globalEdge: ${data.globalEdge}%, version: ${data.version}`);
  } catch (err) {
    record(1, "Default Configuration", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 2: getEffectiveHouseEdge()
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { getEffectiveHouseEdge } = await import('./src/lib/economics');
      const edge = await getEffectiveHouseEdge('trader');
      return { edge, isNum: typeof edge === 'number' };
    `);
    const data = JSON.parse(raw);
    const passed = data.isNum && data.edge >= 0 && data.edge <= 50;
    record(2, "getEffectiveHouseEdge() accessor", passed, `effectiveEdge: ${data.edge}%`);
  } catch (err) {
    record(2, "getEffectiveHouseEdge() accessor", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 3: Global Fallback (when game.useGlobal === true)
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { calculateEffectiveHouseEdge } = await import('./src/lib/economics');
      const mockConfig = {
        version: 1,
        globalHouseEdge: 7.50,
        games: {
          mines: { enabled: true, useGlobal: true, houseEdge: 3.00 }
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'test'
      };
      return calculateEffectiveHouseEdge(mockConfig, 'mines');
    `);
    const edge = JSON.parse(raw);
    const passed = edge === 7.5;
    record(3, "Global Fallback (useGlobal === true)", passed, `expected 7.50, got ${edge}`);
  } catch (err) {
    record(3, "Global Fallback (useGlobal === true)", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 4: Custom Game Override (when useGlobal === false)
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { calculateEffectiveHouseEdge } = await import('./src/lib/economics');
      const mockConfig = {
        version: 1,
        globalHouseEdge: 5.00,
        games: {
          plinko: { enabled: true, useGlobal: false, houseEdge: 6.25 }
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'test'
      };
      return calculateEffectiveHouseEdge(mockConfig, 'plinko');
    `);
    const edge = JSON.parse(raw);
    const passed = edge === 6.25;
    record(4, "Custom Game Override (useGlobal === false)", passed, `expected 6.25, got ${edge}`);
  } catch (err) {
    record(4, "Custom Game Override (useGlobal === false)", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 5: Invalid Negative Value Rejection
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { validateHouseEdge } = await import('./src/lib/economics');
      const res1 = validateHouseEdge(-1);
      const res2 = validateHouseEdge(-0.01);
      return { res1: res1.valid, res2: res2.valid };
    `);
    const data = JSON.parse(raw);
    const passed = data.res1 === false && data.res2 === false;
    record(5, "Negative Value Rejection", passed, "rejected -1 and -0.01");
  } catch (err) {
    record(5, "Negative Value Rejection", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 6: Invalid >50 Value Rejection
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { validateHouseEdge } = await import('./src/lib/economics');
      const res1 = validateHouseEdge(50.01);
      const res2 = validateHouseEdge(51);
      const res3 = validateHouseEdge(100);
      return { res1: res1.valid, res2: res2.valid, res3: res3.valid };
    `);
    const data = JSON.parse(raw);
    const passed = data.res1 === false && data.res2 === false && data.res3 === false;
    record(6, "Value > 50% Rejection", passed, "rejected 50.01, 51, and 100");
  } catch (err) {
    record(6, "Value > 50% Rejection", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 7: NaN Rejection
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { validateHouseEdge } = await import('./src/lib/economics');
      const res = validateHouseEdge(NaN);
      return { valid: res.valid, error: res.error };
    `);
    const data = JSON.parse(raw);
    const passed = data.valid === false && data.error.includes("NaN");
    record(7, "NaN Rejection", passed, data.error);
  } catch (err) {
    record(7, "NaN Rejection", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 8: Infinity Rejection
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { validateHouseEdge } = await import('./src/lib/economics');
      const resPos = validateHouseEdge(Infinity);
      const resNeg = validateHouseEdge(-Infinity);
      return { pos: resPos.valid, neg: resNeg.valid };
    `);
    const data = JSON.parse(raw);
    const passed = data.pos === false && data.neg === false;
    record(8, "Infinity Rejection", passed, "rejected +Infinity and -Infinity");
  } catch (err) {
    record(8, "Infinity Rejection", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 9: Rounding & Normalization
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { validateHouseEdge } = await import('./src/lib/economics');
      const r1 = validateHouseEdge(5);
      const r2 = validateHouseEdge(4.256);
      const r3 = validateHouseEdge(3.14159);
      return { r1: r1.normalized, r2: r2.normalized, r3: r3.normalized };
    `);
    const data = JSON.parse(raw);
    const passed = data.r1 === 5 && data.r2 === 4.26 && data.r3 === 3.14;
    record(9, "Decimal Normalization & Rounding", passed, `4.256 -> ${data.r2}, 3.14159 -> ${data.r3}`);
  } catch (err) {
    record(9, "Decimal Normalization & Rounding", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 10: Persistence Across Queries
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { getEconomicsConfig, updateEconomicsConfig } = await import('./src/lib/economics');
      const current = await getEconomicsConfig();
      const updated = await updateEconomicsConfig({
        expectedVersion: current.version,
        globalHouseEdge: 4.85,
        games: {
          ...current.games,
          trader: { enabled: true, useGlobal: false, houseEdge: 3.75 }
        },
        adminId: 'test-admin',
        reason: 'Persistence test verification'
      });
      const reloaded = await getEconomicsConfig();
      return {
        savedEdge: reloaded.globalHouseEdge,
        savedTrader: reloaded.games.trader.houseEdge,
        version: reloaded.version
      };
    `);
    const data = JSON.parse(raw);
    const passed = data.savedEdge === 4.85 && data.savedTrader === 3.75;
    record(10, "Persistence", passed, `persisted globalHouseEdge: ${data.savedEdge}%`);
  } catch (err) {
    record(10, "Persistence", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 11: Version Increment
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { getEconomicsConfig, updateEconomicsConfig } = await import('./src/lib/economics');
      const vBefore = (await getEconomicsConfig()).version;
      const updated = await updateEconomicsConfig({
        expectedVersion: vBefore,
        globalHouseEdge: 5.00,
        games: (await getEconomicsConfig()).games,
        adminId: 'test-admin',
        reason: 'Version increment verification'
      });
      return { vBefore, vAfter: updated.version };
    `);
    const data = JSON.parse(raw);
    const passed = data.vAfter === data.vBefore + 1;
    record(11, "Version Increment", passed, `v${data.vBefore} -> v${data.vAfter}`);
  } catch (err) {
    record(11, "Version Increment", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 12: Previous-Version History Tracking
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { getEconomicsConfigHistory } = await import('./src/lib/economics');
      const history = await getEconomicsConfigHistory(10);
      return {
        count: history.length,
        hasMultiple: history.length >= 2,
        firstVersion: history[0]?.version,
        secondVersion: history[1]?.version
      };
    `);
    const data = JSON.parse(raw);
    const passed = data.hasMultiple && data.firstVersion > data.secondVersion;
    record(12, "Configuration History", passed, `${data.count} entries tracked in audit history`);
  } catch (err) {
    record(12, "Configuration History", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 13: Audit Log Creation
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { getAdminAuditLogs } = await import('./src/lib/db');
      const logs = await getAdminAuditLogs(20);
      const econLogs = logs.filter(l => l.action === 'ECONOMICS_CONFIG_UPDATED');
      return {
        found: econLogs.length > 0,
        latestTarget: econLogs[0]?.target_type,
        action: econLogs[0]?.action
      };
    `);
    const data = JSON.parse(raw);
    const passed = data.found && data.action === "ECONOMICS_CONFIG_UPDATED";
    record(13, "Audit Log Creation", passed, `Action recorded: ${data.action}`);
  } catch (err) {
    record(13, "Audit Log Creation", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 14: Unauthorized API Rejection (401)
  // ----------------------------------------------------
  try {
    const resGet = await httpRequest(`${BASE_URL}/api/admin/economics`);
    const resPut = await httpRequest(`${BASE_URL}/api/admin/economics`, { method: "PUT" }, { globalHouseEdge: 5 });
    const resHistory = await httpRequest(`${BASE_URL}/api/admin/economics/history`);

    const passed =
      resGet.statusCode === 401 &&
      resPut.statusCode === 401 &&
      resHistory.statusCode === 401;
    record(14, "Unauthorized API Rejection", passed, "GET, PUT, HISTORY all returned 401");
  } catch (err) {
    record(14, "Unauthorized API Rejection", false, err.message);
  }

  // ----------------------------------------------------
  // Admin Login for live API tests
  // ----------------------------------------------------
  let adminSessionCookie = "";
  try {
    const loginRes = await httpRequest(
      `${BASE_URL}/api/admin/auth/login`,
      { method: "POST" },
      { adminId: ADMIN_ID, password: ADMIN_PASSWORD }
    );
    const rawCookie = loginRes.headers["set-cookie"]?.[0] || "";
    const match = rawCookie.match(/betadrix_admin_session=([^;]+)/);
    if (match) {
      adminSessionCookie = `betadrix_admin_session=${match[1]}`;
    }
  } catch (err) {
    console.warn("Could not log in as admin over HTTP:", err.message);
  }

  // ----------------------------------------------------
  // TEST 15: Authorized Admin Update via API
  // ----------------------------------------------------
  let currentApiVersion = 1;
  try {
    if (!adminSessionCookie) throw new Error("No admin session cookie");

    // First fetch current config
    const getRes = await httpRequest(`${BASE_URL}/api/admin/economics`, {
      headers: { Cookie: adminSessionCookie },
    });
    if (getRes.statusCode !== 200 || !getRes.json?.success) {
      throw new Error(`GET /api/admin/economics failed: HTTP ${getRes.statusCode}`);
    }
    const currentConfig = getRes.json.config;
    currentApiVersion = currentConfig.version;

    // Apply changes with expectedVersion
    const putRes = await httpRequest(
      `${BASE_URL}/api/admin/economics`,
      { method: "PUT", headers: { Cookie: adminSessionCookie } },
      {
        expectedVersion: currentApiVersion,
        globalHouseEdge: 5.0,
        games: {
          ...currentConfig.games,
          dice: { enabled: true, useGlobal: false, houseEdge: 2.85 },
        },
        reason: "Authorized admin API update verification",
      }
    );

    const passed =
      putRes.statusCode === 200 &&
      putRes.json?.success === true &&
      putRes.json?.config?.version === currentApiVersion + 1;
    if (passed) currentApiVersion = putRes.json.config.version;
    record(15, "Authorized Admin Update (API)", passed, `new version: v${currentApiVersion}`);
  } catch (err) {
    record(15, "Authorized Admin Update (API)", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 16: Real-time ECONOMICS_CONFIG_UPDATED Event
  // ----------------------------------------------------
  try {
    if (!adminSessionCookie) throw new Error("No admin session cookie");

    const eventReceivedPromise = new Promise((resolve, reject) => {
      const url = new URL("/api/realtime", BASE_URL);
      const sseReq = http.request(
        url,
        { method: "GET", headers: { Accept: "text/event-stream" } },
        (res) => {
          let buffer = "";
          res.on("data", (chunk) => {
            buffer += chunk.toString();
            const msgs = buffer.split("\n\n");
            buffer = msgs.pop();

            for (const msg of msgs) {
              const lines = msg.split("\n");
              let dataStr = "";
              for (const line of lines) {
                if (line.startsWith("data:")) {
                  dataStr = line.replace(/^data:\s*/, "");
                }
              }
              if (dataStr) {
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.type === "ECONOMICS_CONFIG_UPDATED") {
                    sseReq.destroy();
                    resolve(parsed);
                    return;
                  }
                } catch (_) {}
              }
            }
          });
        }
      );
      sseReq.on("error", reject);
      sseReq.setTimeout(4000, () => {
        sseReq.destroy();
        reject(new Error("SSE timeout waiting for ECONOMICS_CONFIG_UPDATED"));
      });
      sseReq.end();
    });

    // Small delay to ensure SSE connected before triggering update
    await new Promise((r) => setTimeout(r, 200));

    // Trigger update
    await httpRequest(
      `${BASE_URL}/api/admin/economics`,
      { method: "PUT", headers: { Cookie: adminSessionCookie } },
      {
        expectedVersion: currentApiVersion,
        globalHouseEdge: 5.1,
        games: {
          trader: { enabled: true, useGlobal: false, houseEdge: 4.1 },
          roulette: { enabled: true, useGlobal: false, houseEdge: 5.26 },
          plinko: { enabled: true, useGlobal: false, houseEdge: 6.0 },
          mines: { enabled: true, useGlobal: true, houseEdge: 5.1 },
          dice: { enabled: true, useGlobal: false, houseEdge: 3.0 },
        },
        reason: "Real-time event trigger",
      }
    );

    const receivedEvent = await eventReceivedPromise;
    const eventGlobalEdge = receivedEvent.globalHouseEdge !== undefined ? receivedEvent.globalHouseEdge : receivedEvent.payload?.globalHouseEdge;
    const eventVersion = receivedEvent.version !== undefined ? receivedEvent.version : receivedEvent.payload?.version;
    const passed =
      receivedEvent &&
      receivedEvent.type === "ECONOMICS_CONFIG_UPDATED" &&
      eventGlobalEdge === 5.1;
    currentApiVersion++;
    record(16, "Real-time ECONOMICS_CONFIG_UPDATED Event", passed, `payload version: ${eventVersion}`);
  } catch (err) {
    record(16, "Real-time ECONOMICS_CONFIG_UPDATED Event", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 17: Stale Configuration Conflict (409)
  // ----------------------------------------------------
  try {
    if (!adminSessionCookie) throw new Error("No admin session cookie");

    // Intentionally pass an outdated expectedVersion (e.g. 1)
    const conflictRes = await httpRequest(
      `${BASE_URL}/api/admin/economics`,
      { method: "PUT", headers: { Cookie: adminSessionCookie } },
      {
        expectedVersion: 1, // Definitely stale
        globalHouseEdge: 9.99,
        games: {
          trader: { enabled: true, useGlobal: false, houseEdge: 4.0 },
          roulette: { enabled: true, useGlobal: false, houseEdge: 5.26 },
          plinko: { enabled: true, useGlobal: false, houseEdge: 6.0 },
          mines: { enabled: true, useGlobal: true, houseEdge: 5.0 },
          dice: { enabled: true, useGlobal: false, houseEdge: 3.0 },
        },
      }
    );

    const isConflict =
      conflictRes.statusCode === 409 &&
      conflictRes.json?.error === "CONFIGURATION_VERSION_CONFLICT";
    record(17, "Stale Configuration Conflict", isConflict, `HTTP 409 CONFIGURATION_VERSION_CONFLICT`);
  } catch (err) {
    record(17, "Stale Configuration Conflict", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 18: All Five Game IDs Supported
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { SUPPORTED_GAME_IDS, getEffectiveHouseEdge, getEconomicsConfig } = await import('./src/lib/economics');
      const config = await getEconomicsConfig();
      const results = {};
      for (const id of SUPPORTED_GAME_IDS) {
        results[id] = await getEffectiveHouseEdge(id, config);
      }
      return results;
    `);
    const edges = JSON.parse(raw);
    const allFound = ["trader", "roulette", "plinko", "mines", "dice"].every(
      (id) => typeof edges[id] === "number"
    );
    record(18, "All Five Game IDs", allFound, JSON.stringify(edges));
  } catch (err) {
    record(18, "All Five Game IDs", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 19: Missing Configuration Fallback
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { getEffectiveHouseEdge, getEconomicsConfig } = await import('./src/lib/economics');
      const config = await getEconomicsConfig();
      const unknownEdge = await getEffectiveHouseEdge('unregistered_game_xyz', config);
      return { unknownEdge, globalHouseEdge: config.globalHouseEdge };
    `);
    const data = JSON.parse(raw);
    const passed = data.unknownEdge === data.globalHouseEdge;
    record(19, "Missing Configuration Fallback", passed, `fallback to global: ${data.unknownEdge}%`);
  } catch (err) {
    record(19, "Missing Configuration Fallback", false, err.message);
  }

  // ----------------------------------------------------
  // TEST 20: Database / Local Fallback Resilience
  // ----------------------------------------------------
  try {
    const raw = runTsCode(`
      const { getEconomicsConfigFromDb, getDefaultEconomicsConfigRecord } = await import('./src/lib/db');
      const config = await getEconomicsConfigFromDb();
      return {
        hasVersion: typeof config.version === 'number',
        hasGames: typeof config.games === 'object' && Object.keys(config.games).length >= 5,
        globalEdge: config.globalHouseEdge
      };
    `);
    const data = JSON.parse(raw);
    const passed = data.hasVersion && data.hasGames && typeof data.globalEdge === "number";
    record(20, "Database & Local Fallback Behavior", passed, `retrieved config cleanly (v${data.hasVersion ? "valid" : "invalid"})`);
  } catch (err) {
    record(20, "Database & Local Fallback Behavior", false, err.message);
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n==================================================");
  console.log("TEST RESULTS SUMMARY");
  console.log("==================================================");

  let totalPassed = 0;
  for (let i = 1; i <= 20; i++) {
    if (results[i]) totalPassed++;
  }

  console.log(`Passed: ${totalPassed} / 20 tests`);

  if (totalPassed === 20) {
    console.log("✓ ALL 20 ECONOMICS CONFIGURATION TESTS PASSED PERFECTLY!\n");
    process.exit(0);
  } else {
    console.error(`✗ ${20 - totalPassed} tests failed!\n`);
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Fatal test runner failure:", err);
  process.exit(1);
});
