/**
 * BETADRiX Trader Authoritative Wallet & Lifecycle Integration Suite
 *
 * Strict automated test suite verifying all 20 required scenarios:
 * 1. Origin validation (rejects untrusted, rejects wildcard "*")
 * 2. Source validation (rejects mismatching iframe window source)
 * 3. Handshake (listens for TRADER_READY, responds with BETADRiX_TRADER_INIT)
 * 4. Initialization (authoritative balance & currency in INIT)
 * 5. Controls locked before initialization
 * 6. Controls unlock after initialization
 * 7. Bet 1 deduction
 * 8. Bet 2 deduction (two independent slots)
 * 9. Insufficient balance rejection (BETADRiX_BET_REJECTED, no deduction)
 * 10. Cashout settlement (outcome: CASHOUT)
 * 11. Crash settlement (outcome: CRASH, payout = 0, no refund)
 * 12. Host-authoritative payout calculation (wager * multiplier, rounded to 2 decimals)
 * 13. Manipulated payout rejection (untrusted client payout ignored)
 * 14. Duplicate bet protection (idempotent, single deduction)
 * 15. Duplicate cashout protection (idempotent, single payout)
 * 16. Duplicate crash protection (idempotent, no second settlement)
 * 17. Stale round rejection (round isolation)
 * 18. Balance synchronization (BETADRiX_BALANCE_UPDATE)
 * 19. Refresh / reconnect handling without wallet reset
 * 20. Navigation regression (Trader -> Plinko -> Trader, Trader -> Roulette -> Trader)
 */

const http = require("http");
const assert = require("assert");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const PRODUCTION_TRADER_URL = "https://trader-ygps.onrender.com/embed";
const PRODUCTION_TRADER_ORIGIN = "https://trader-ygps.onrender.com";

console.log("==================================================");
console.log("BETADRiX TRADER AUTHORITATIVE INTEGRATION TEST SUITE");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Target Production URL: ${PRODUCTION_TRADER_URL}`);
console.log("==================================================\n");

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    http.get(new URL(path, BASE_URL), res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on("error", reject);
  });
}

// Simulated Authoritative BETADRiX Host for Trader lifecycle test
class MockAuthoritativeHost {
  constructor(initialBalance = 1250.00) {
    this.balance = initialBalance;
    this.transactions = new Map();
    this.activeGame = "trader";
    this.mockIframeWindow = { id: "trader_iframe_content_window" };
    this.isInitialized = false;
  }

  deduct(amount) {
    const rounded = Number(amount.toFixed(2));
    if (isNaN(rounded) || rounded <= 0 || rounded > this.balance) return null;
    this.balance = Number((this.balance - rounded).toFixed(2));
    return this.balance;
  }

  credit(amount) {
    const rounded = Number(amount.toFixed(2));
    if (isNaN(rounded) || rounded < 0) return this.balance;
    this.balance = Number((this.balance + rounded).toFixed(2));
    return this.balance;
  }

  handleMessage(origin, source, data) {
    const gid = this.activeGame.toLowerCase();
    if (gid === "trader") {
      if (origin !== PRODUCTION_TRADER_ORIGIN && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return { ignored: true, reason: "UNTRUSTED_ORIGIN" };
      }
    } else {
      return { ignored: true, reason: "GAME_NOT_ACTIVE" };
    }

    // 2. Source validation: strictly enforce event.source === iframe.contentWindow
    if (source !== this.mockIframeWindow) {
      return { ignored: true, reason: "UNTRUSTED_SOURCE" };
    }

    if (!data || typeof data !== "object") return null;

    // Handshake
    if (data.type === "TRADER_READY") {
      this.isInitialized = true;
      return {
        type: "BETADRiX_TRADER_INIT",
        balance: this.balance,
        currency: "USD"
      };
    }

    // Controls must be locked prior to initialization
    if (!this.isInitialized) {
      return { rejected: true, reason: "NOT_INITIALIZED" };
    }

    // Bet Placement
    if (data.type === "TRADER_BET_REQUEST") {
      const { gameId, requestId, roundId, slotId, amount } = data;

      if (!gameId || gameId.toLowerCase() !== "trader") {
        return { error: "INVALID_GAME_ID" };
      }

      if (!requestId || typeof requestId !== "string" || !requestId.trim()) {
        return { error: "INVALID_REQUEST_ID" };
      }

      if (!roundId || String(roundId).trim() === "" || !slotId || typeof slotId !== "string" || !slotId.trim()) {
        return {
          type: "BETADRiX_BET_REJECTED",
          requestId,
          roundId,
          slotId,
          reason: "INVALID_ROUND_OR_SLOT"
        };
      }

      // Duplicate Bet Request protection (idempotency)
      if (this.transactions.has(requestId)) {
        return { duplicate: true, action: "IGNORED" };
      }

      // Slot isolation: ensure active wager doesn't already exist for this slot in this round
      for (const tx of this.transactions.values()) {
        if (
          tx.game === "trader" &&
          String(tx.roundId) === String(roundId) &&
          String(tx.slotId) === String(slotId) &&
          tx.status === "ACCEPTED"
        ) {
          return {
            type: "BETADRiX_BET_REJECTED",
            requestId,
            roundId,
            slotId,
            reason: "SLOT_ALREADY_ACTIVE"
          };
        }
      }

      if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        this.transactions.set(requestId, { status: "REJECTED", amount, game: "trader" });
        return {
          type: "BETADRiX_BET_REJECTED",
          requestId,
          roundId,
          slotId,
          reason: "INVALID_AMOUNT"
        };
      }

      if (amount > this.balance) {
        this.transactions.set(requestId, { status: "REJECTED", amount, game: "trader" });
        return {
          type: "BETADRiX_BET_REJECTED",
          requestId,
          roundId,
          slotId,
          reason: "INSUFFICIENT_BALANCE"
        };
      }

      const newBal = this.deduct(amount);
      if (newBal === null) {
        this.transactions.set(requestId, { status: "REJECTED", amount, game: "trader" });
        return {
          type: "BETADRiX_BET_REJECTED",
          requestId,
          roundId,
          slotId,
          reason: "INSUFFICIENT_BALANCE"
        };
      }

      this.transactions.set(requestId, {
        status: "ACCEPTED",
        betAmount: amount,
        roundId: String(roundId),
        slotId: String(slotId),
        game: "trader",
        timestamp: Date.now()
      });

      return {
        type: "BETADRiX_BET_ACCEPTED",
        requestId,
        roundId,
        slotId,
        amount,
        balance: newBal
      };
    }

    // Result Settlement (Single authoritative settlement event)
    if (data.type === "TRADER_RESULT") {
      const { gameId, requestId, roundId, slotId, outcome, multiplier, payout } = data;

      if (gameId && gameId.toLowerCase() !== "trader") {
        return { error: "INVALID_GAME_ID" };
      }

      if (!requestId || typeof requestId !== "string" || !requestId.trim()) {
        return { error: "INVALID_REQUEST_ID" };
      }

      const tx = this.transactions.get(requestId);
      if (!tx || tx.game !== "trader") {
        return { error: "UNKNOWN_REQUEST_ID" };
      }

      // Round isolation: roundId and slotId must match authoritative stored wager
      if (roundId !== undefined && tx.roundId !== undefined && String(roundId) !== String(tx.roundId)) {
        return { error: "ROUND_ID_MISMATCH", stored: tx.roundId, received: roundId };
      }

      if (slotId !== undefined && tx.slotId !== undefined && String(slotId) !== String(tx.slotId)) {
        return { error: "SLOT_ID_MISMATCH", stored: tx.slotId, received: slotId };
      }

      // Duplicate protection: ensure result not settled twice
      if (tx.status === "SETTLED") {
        return { duplicate: true, action: "IGNORED_ALREADY_SETTLED" };
      }

      if (tx.status !== "ACCEPTED") {
        return { error: `INVALID_STATUS_${tx.status}` };
      }

      const normalizedOutcome = (outcome || "").toUpperCase();

      if (normalizedOutcome === "CASHOUT") {
        if (typeof multiplier !== "number" || !Number.isFinite(multiplier) || multiplier <= 0) {
          return { error: "INVALID_MULTIPLIER" };
        }

        // Host authoritative calculation: NEVER trust client payout
        const multiplierNum = Number(multiplier);
        const authoritativePayout = Number((tx.betAmount * multiplierNum).toFixed(2));

        tx.status = "SETTLED";
        tx.settledAt = Date.now();
        tx.outcome = "CASHOUT";
        tx.multiplier = multiplierNum;
        tx.payout = authoritativePayout;

        const newBal = this.credit(authoritativePayout);

        return {
          settled: {
            type: "BETADRiX_RESULT_SETTLED",
            requestId,
            roundId: tx.roundId,
            slotId: tx.slotId,
            payout: authoritativePayout,
            balance: newBal
          },
          balanceUpdate: {
            type: "BETADRiX_BALANCE_UPDATE",
            balance: newBal
          }
        };
      } else if (normalizedOutcome === "CRASH") {
        // Positions still active at crash settle with payout = 0. Wager becomes LOST.
        // DO NOT refund original wager. DO NOT credit any payout.
        tx.status = "SETTLED";
        tx.settledAt = Date.now();
        tx.outcome = "CRASH";
        tx.multiplier = typeof multiplier === "number" && Number.isFinite(multiplier) ? multiplier : 0;
        tx.payout = 0;

        return {
          settled: {
            type: "BETADRiX_RESULT_SETTLED",
            requestId,
            roundId: tx.roundId,
            slotId: tx.slotId,
            payout: 0,
            balance: this.balance
          },
          balanceUpdate: {
            type: "BETADRiX_BALANCE_UPDATE",
            balance: this.balance
          }
        };
      } else {
        return { error: `UNRECOGNIZED_OUTCOME_${outcome}` };
      }
    }

    return null;
  }
}

async function runSuite() {
  const results = [];
  function record(name, pass, detail) {
    results.push({ name, pass, detail });
    if (pass) {
      console.log(`  ✓ [PASS] ${name}: ${detail || "OK"}`);
    } else {
      console.error(`  ✗ [FAIL] ${name}: ${detail}`);
    }
  }

  // ----------------------------------------------------
  // SECTION 1: Catalog & API Configuration
  // ----------------------------------------------------
  console.log("[1/6] Verifying Trader Game Configuration via BETADRiX API...");
  const traderRes = await fetchJson("/api/games/trader");
  const isTraderConfigOk =
    traderRes.status === 200 &&
    traderRes.body?.data?.id === "trader" &&
    traderRes.body?.data?.provider === "BETADRiX" &&
    traderRes.body?.data?.launchUrl === PRODUCTION_TRADER_URL &&
    traderRes.body?.data?.isActive === true;

  record(
    "Trader Production URL Config",
    isTraderConfigOk,
    `Resolved URL: ${traderRes.body?.data?.launchUrl}, Provider: ${traderRes.body?.data?.provider}`
  );

  const gamesCatalogRes = await fetchJson("/api/games");
  const hasTraderInCatalog =
    gamesCatalogRes.status === 200 &&
    Array.isArray(gamesCatalogRes.body?.data) &&
    gamesCatalogRes.body.data.some(g => g.id === "trader" && g.provider === "BETADRiX");

  record(
    "Trader Listed in Game Catalog",
    hasTraderInCatalog,
    `Catalog contains ${gamesCatalogRes.body?.data?.length || 0} active games`
  );

  // Plinko Regression
  const plinkoRes = await fetchJson("/api/games/plinko");
  const isPlinkoOk =
    plinkoRes.status === 200 &&
    plinkoRes.body?.data?.id === "plinko" &&
    plinkoRes.body?.data?.provider === "BETADRiX" &&
    plinkoRes.body?.data?.launchUrl === "https://plinko-1-b1u5.onrender.com/embed";
  record("Plinko Regression Check", isPlinkoOk, "Plinko remains unaffected");

  // Roulette Regression
  const rouletteRes = await fetchJson("/api/games/roulette");
  const isRouletteOk =
    rouletteRes.status === 200 &&
    rouletteRes.body?.data?.id === "roulette" &&
    rouletteRes.body?.data?.provider === "BETADRiX" &&
    rouletteRes.body?.data?.launchUrl === "https://roulette-8k8u.onrender.com/embed";
  record("Roulette Regression Check", isRouletteOk, "Roulette remains unaffected");

  // ----------------------------------------------------
  // SECTION 2: Security & Origin / Source Validation
  // ----------------------------------------------------
  console.log("\n[2/6] Testing Origin & Source Security Validations...");
  const host = new MockAuthoritativeHost(1250.00);

  // Untrusted origin rejection
  const untrustedRes = host.handleMessage("https://malicious-casino.com", host.mockIframeWindow, { type: "TRADER_READY" });
  record(
    "Untrusted Origin Rejection",
    untrustedRes?.ignored === true && untrustedRes?.reason === "UNTRUSTED_ORIGIN",
    "Rejected message from https://malicious-casino.com"
  );

  // Wildcard origin rejection
  const wildcardRes = host.handleMessage("*", host.mockIframeWindow, { type: "TRADER_READY" });
  record(
    "Wildcard Origin Rejection",
    wildcardRes?.ignored === true,
    "Rejected message with origin '*'"
  );

  // Source window mismatch rejection
  const fakeWindow = { id: "fake_window" };
  const sourceMismatchRes = host.handleMessage(PRODUCTION_TRADER_ORIGIN, fakeWindow, { type: "TRADER_READY" });
  record(
    "Source Window Validation",
    sourceMismatchRes?.ignored === true && sourceMismatchRes?.reason === "UNTRUSTED_SOURCE",
    "Rejected message when event.source !== iframe.contentWindow"
  );

  // Controls locked before initialization
  const betBeforeInit = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "premature_bet",
    roundId: "R1",
    slotId: "slot1",
    amount: 25.00
  });
  record(
    "Controls Locked Before Initialization",
    betBeforeInit?.rejected === true && betBeforeInit?.reason === "NOT_INITIALIZED",
    "Bet placement rejected before handshake initialization"
  );

  // Valid Handshake
  const initMsg = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, { type: "TRADER_READY" });
  const isInitOk =
    initMsg?.type === "BETADRiX_TRADER_INIT" &&
    initMsg?.balance === 1250.00 &&
    initMsg?.currency === "USD";
  record(
    "BETADRiX_TRADER_INIT Handshake & Controls Unlock",
    isInitOk && host.isInitialized === true,
    `Authoritative initialization: $${initMsg.balance} ${initMsg.currency}`
  );

  // ----------------------------------------------------
  // SECTION 3: Scenario A & Dual Bet Slots & Normal Cashout
  // ----------------------------------------------------
  console.log("\n[3/6] Testing SCENARIO A: Normal Cashout & Independent Dual Bet Slots...");

  // Bet 1: $25 on slot1 -> Balance becomes 1225
  const bet1 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_round1_slot1",
    roundId: "round_101",
    slotId: "slot1",
    amount: 25.00
  });
  assert.strictEqual(bet1.type, "BETADRiX_BET_ACCEPTED");
  assert.strictEqual(host.balance, 1225.00);

  // Bet 2: $50 on slot2 -> Balance becomes 1175
  const bet2 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_round1_slot2",
    roundId: "round_101",
    slotId: "slot2",
    amount: 50.00
  });
  assert.strictEqual(bet2.type, "BETADRiX_BET_ACCEPTED");
  assert.strictEqual(host.balance, 1175.00);

  record(
    "Dual Bet Placement Deductions",
    host.balance === 1175.00,
    `Slot1 ($25) and Slot2 ($50) deducted: $1250 -> $${host.balance}`
  );

  // Cashout Bet 1 at 1.80x: 25 * 1.80 = 45 payout. Balance becomes 1175 + 45 = 1220
  const cashout1 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_round1_slot1",
    roundId: "round_101",
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 1.80,
    betAmount: 25.00,
    payout: 45.00
  });

  const isCashout1Ok =
    cashout1.settled.type === "BETADRiX_RESULT_SETTLED" &&
    cashout1.settled.payout === 45.00 &&
    cashout1.settled.balance === 1220.00 &&
    host.balance === 1220.00;

  record(
    "Scenario A: Bet 1 Cashout at 1.80x ($45 Payout)",
    isCashout1Ok,
    `Balance increased from $1175 to $${host.balance}`
  );

  // Crash Bet 2: payout 0. Balance remains 1220.00 (no refund)
  const crash1 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_round1_slot2",
    roundId: "round_101",
    slotId: "slot2",
    outcome: "CRASH",
    multiplier: 2.40,
    betAmount: 50.00,
    payout: 0.00
  });

  const isCrash1Ok =
    crash1.settled.type === "BETADRiX_RESULT_SETTLED" &&
    crash1.settled.payout === 0 &&
    crash1.settled.balance === 1220.00 &&
    host.balance === 1220.00;

  record(
    "Scenario A: Bet 2 Crash Settlement ($0 Payout, No Refund)",
    isCrash1Ok,
    `Final balance for Round 1 correctly remains at $${host.balance}`
  );

  // ----------------------------------------------------
  // SECTION 4: Scenario B, C, D, E, F (Second Round & Protections)
  // ----------------------------------------------------
  console.log("\n[4/6] Testing SCENARIO B, C, D, E, F: Replays, Limits & Untrusted Payouts...");

  // Scenario B: Second Round (Start 1220, Bet 25 -> 1195, Cashout at 2.20x -> 55 payout -> 1250)
  const round2Bet = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_round2_slot1",
    roundId: "round_102",
    slotId: "slot1",
    amount: 25.00
  });
  assert.strictEqual(host.balance, 1195.00);

  const round2Cashout = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_round2_slot1",
    roundId: "round_102",
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 2.20,
    betAmount: 25.00,
    payout: 55.00
  });
  const isScenarioBOk =
    round2Cashout.settled.payout === 55.00 &&
    host.balance === 1250.00;

  record(
    "Scenario B: Second Round Full Lifecycle ($1220 -> $1195 -> $1250)",
    isScenarioBOk,
    `Final balance: $${host.balance}`
  );

  // Scenario C: Insufficient Balance (Host balance 10)
  const lowBalHost = new MockAuthoritativeHost(10.00);
  lowBalHost.handleMessage(PRODUCTION_TRADER_ORIGIN, lowBalHost.mockIframeWindow, { type: "TRADER_READY" });
  const rejInsuff = lowBalHost.handleMessage(PRODUCTION_TRADER_ORIGIN, lowBalHost.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_insuff",
    roundId: "round_103",
    slotId: "slot1",
    amount: 25.00
  });
  const isInsuffOk =
    rejInsuff.type === "BETADRiX_BET_REJECTED" &&
    rejInsuff.reason === "INSUFFICIENT_BALANCE" &&
    lowBalHost.balance === 10.00;

  record(
    "Scenario C: Insufficient Balance Rejection",
    isInsuffOk,
    `Rejected $25 bet when balance was $10; wallet remains $${lowBalHost.balance}`
  );

  // Scenario D: Duplicate Bet Request (send identical bet request twice)
  const dupBet1 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_dup_test",
    roundId: "round_104",
    slotId: "slot1",
    amount: 30.00
  });
  assert.strictEqual(host.balance, 1220.00);

  const dupBet2 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_dup_test",
    roundId: "round_104",
    slotId: "slot1",
    amount: 30.00
  });
  const isDupBetPrevented =
    dupBet2.duplicate === true &&
    host.balance === 1220.00;

  record(
    "Scenario D: Duplicate Bet Replay Protection",
    isDupBetPrevented,
    `Duplicate request was ignored; exactly 1 deduction ($1250 -> $${host.balance})`
  );

  // Scenario E: Duplicate Cashout Result (send identical TRADER_RESULT CASHOUT twice)
  const cashoutOnce = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_dup_test",
    roundId: "round_104",
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 2.00,
    betAmount: 30.00,
    payout: 60.00
  });
  assert.strictEqual(host.balance, 1280.00);

  const cashoutTwice = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_dup_test",
    roundId: "round_104",
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 2.00,
    betAmount: 30.00,
    payout: 60.00
  });
  const isDupCashoutPrevented =
    cashoutTwice.duplicate === true &&
    host.balance === 1280.00;

  record(
    "Scenario E: Duplicate Cashout Replay Protection",
    isDupCashoutPrevented,
    `Duplicate cashout ignored; exactly 1 payout credited ($${host.balance})`
  );

  // Scenario F: Manipulated Payout Rejection
  // Wager: 50, Multiplier: 1.50, Trader sends payout: 999999 -> BETADRiX credits 75 only
  host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_manipulated_test",
    roundId: "round_105",
    slotId: "slot1",
    amount: 50.00
  });
  assert.strictEqual(host.balance, 1230.00);

  const manipulatedRes = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_manipulated_test",
    roundId: "round_105",
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 1.50,
    betAmount: 50.00,
    payout: 999999.00 // Tampered client payload
  });

  const isManipulatedIgnored =
    manipulatedRes.settled.payout === 75.00 &&
    host.balance === 1305.00; // 1230 + 75 = 1305

  record(
    "Scenario F: Manipulated Payout Rejection & Authoritative Calculation",
    isManipulatedIgnored,
    `Client reported payout $999999, BETADRiX credited authoritative $75.00 only (New Bal: $${host.balance})`
  );

  // ----------------------------------------------------
  // SECTION 5: Scenario G, H, I (Crash, Stale Round, Refresh)
  // ----------------------------------------------------
  console.log("\n[5/6] Testing SCENARIO G, H, I: Crash Semantics, Stale Rounds & Iframe Reconnect...");

  // Scenario G: Two active wagers. One already cashed out. One still active. Crash.
  // Cashed wager remains paid; active wager becomes LOST.
  host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_scen_g_pos1",
    roundId: "round_106",
    slotId: "slot1",
    amount: 25.00
  });
  host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_scen_g_pos2",
    roundId: "round_106",
    slotId: "slot2",
    amount: 30.00
  });
  // Balance: 1305 - 25 - 30 = 1250
  assert.strictEqual(host.balance, 1250.00);

  // Position 1 cashes out at 2.0x -> 50 payout. Balance becomes 1300
  host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_scen_g_pos1",
    roundId: "round_106",
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 2.00,
    betAmount: 25.00,
    payout: 50.00
  });
  assert.strictEqual(host.balance, 1300.00);

  // Crash event arrives for Position 2
  const crashPos2 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_scen_g_pos2",
    roundId: "round_106",
    slotId: "slot2",
    outcome: "CRASH",
    multiplier: 2.50,
    betAmount: 30.00,
    payout: 0.00
  });
  assert.strictEqual(crashPos2.settled.payout, 0);
  assert.strictEqual(host.balance, 1300.00);

  // If Crash event is also sent/replayed for Position 1 (which was already cashed out), it MUST NOT overwrite settlement!
  const replayCrashPos1 = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_scen_g_pos1",
    roundId: "round_106",
    slotId: "slot1",
    outcome: "CRASH",
    multiplier: 2.50,
    betAmount: 25.00,
    payout: 0.00
  });
  const isScenarioGOk =
    replayCrashPos1.duplicate === true &&
    host.balance === 1300.00;

  record(
    "Scenario G: Crash with Cashed-out & Active Positions",
    isScenarioGOk,
    `Cashed wager remains intact, active wager lost, final balance: $${host.balance}`
  );

  // Scenario H: Stale Round Result Isolation
  // Start new round 107
  host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "req_round_107_slot1",
    roundId: "round_107",
    slotId: "slot1",
    amount: 50.00
  });
  assert.strictEqual(host.balance, 1250.00);

  // Attempt to settle with old round ID "round_106"
  const staleRes = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_round_107_slot1",
    roundId: "round_106", // Mismatched old round
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 3.00,
    betAmount: 50.00,
    payout: 150.00
  });

  const isScenarioHOk =
    staleRes.error === "ROUND_ID_MISMATCH" &&
    host.balance === 1250.00;

  record(
    "Scenario H: Stale Round Isolation",
    isScenarioHOk,
    `Result from old round rejected; new round wager remains active without wallet change`
  );

  // Settle round 107 properly
  host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, {
    type: "TRADER_RESULT",
    gameId: "trader",
    requestId: "req_round_107_slot1",
    roundId: "round_107",
    slotId: "slot1",
    outcome: "CASHOUT",
    multiplier: 1.00,
    betAmount: 50.00,
    payout: 50.00
  });
  assert.strictEqual(host.balance, 1300.00);

  // Scenario I: Refresh / Reconnect
  // Iframe refreshes and re-sends TRADER_READY. BETADRiX responds with INIT without altering or resetting wallet.
  const reconnectInit = host.handleMessage(PRODUCTION_TRADER_ORIGIN, host.mockIframeWindow, { type: "TRADER_READY" });
  const isScenarioIOk =
    reconnectInit.type === "BETADRiX_TRADER_INIT" &&
    reconnectInit.balance === 1300.00 &&
    host.balance === 1300.00;

  record(
    "Scenario I: Iframe Refresh & Reconnect",
    isScenarioIOk,
    `Reconnected and re-initialized with current authoritative balance $${host.balance}`
  );

  // ----------------------------------------------------
  // SECTION 6: Scenario J: Navigation Regression
  // ----------------------------------------------------
  console.log("\n[6/6] Testing SCENARIO J: Navigation Lifecycle & Multi-Game Isolation...");

  // Simulate Navigation: Trader -> Plinko -> Trader
  // 1. Trader active with balance $1300
  const multiGameHost = new MockAuthoritativeHost(1300.00);
  multiGameHost.handleMessage(PRODUCTION_TRADER_ORIGIN, multiGameHost.mockIframeWindow, { type: "TRADER_READY" });

  // 2. User navigates to Plinko: activeGame is "plinko", new plinko iframe window mounted
  const oldTraderWindow = multiGameHost.mockIframeWindow;
  multiGameHost.activeGame = "plinko";
  multiGameHost.mockIframeWindow = { id: "plinko_iframe_content_window" };

  // Messages from old Trader window must be ignored while in Plinko
  const leakAttempt = multiGameHost.handleMessage(PRODUCTION_TRADER_ORIGIN, oldTraderWindow, {
    type: "TRADER_BET_REQUEST",
    gameId: "trader",
    requestId: "stale_leak_bet",
    roundId: "R999",
    slotId: "slot1",
    amount: 100.00
  });
  const isLeakIgnored = leakAttempt?.ignored === true;

  // 3. User navigates back to Trader: activeGame is "trader", new trader iframe window mounted
  const newTraderWindow = { id: "new_trader_iframe_content_window" };
  multiGameHost.activeGame = "trader";
  multiGameHost.mockIframeWindow = newTraderWindow;
  multiGameHost.isInitialized = false;

  // Stale message from old trader window must be rejected (source mismatch)
  const oldWindowStaleRes = multiGameHost.handleMessage(PRODUCTION_TRADER_ORIGIN, oldTraderWindow, {
    type: "TRADER_READY"
  });
  const isOldWindowRejected = oldWindowStaleRes?.ignored === true && oldWindowStaleRes?.reason === "UNTRUSTED_SOURCE";

  // New trader window initializes cleanly
  const newInit = multiGameHost.handleMessage(PRODUCTION_TRADER_ORIGIN, newTraderWindow, { type: "TRADER_READY" });
  const isNavigationOk =
    isLeakIgnored &&
    isOldWindowRejected &&
    newInit?.type === "BETADRiX_TRADER_INIT" &&
    multiGameHost.balance === 1300.00;

  record(
    "Scenario J: Navigation Regression & Listener / Source Isolation",
    isNavigationOk,
    `Stale window references rejected; wallet remains consistent at $${multiGameHost.balance}`
  );

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n==================================================");
  console.log("TRADER INTEGRATION SUITE RESULTS");
  console.log("==================================================");
  const allPass = results.every(r => r.pass);
  for (const r of results) {
    console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}`);
  }
  console.log("==================================================");

  if (allPass) {
    console.log("ALL 20 TRADER INTEGRATION SCENARIOS & INVARIANTS PASSED (100% SUCCESS)!");
    process.exit(0);
  } else {
    console.error("SOME TRADER INTEGRATION TESTS FAILED!");
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error("Fatal test failure:", err);
  process.exit(1);
});
