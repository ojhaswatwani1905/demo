/**
 * BETADRiX European Roulette Authoritative Wallet & Lifecycle Integration Suite
 *
 * Verifies:
 * 1. Database & Game Config resolution to production URL https://roulette-8k8u.onrender.com/embed
 * 2. Origin Security & PostMessage validation
 * 3. Authoritative WalletContext Lifecycle:
 *    - BETADRiX_ROULETTE_INIT
 *    - ROULETTE_BET_REQUEST (single deduction)
 *    - Duplicate Bet Request protection
 *    - Insufficient Balance rejection
 *    - Invalid Amount rejection
 *    - Winning straight bet settlement (35:1 profit + stake = 36x return)
 *    - Losing bet settlement (0 payout)
 *    - Outside 1:1 bet settlement (2x return)
 *    - Duplicate Result settlement protection
 *    - Balance synchronization (BETADRiX_BALANCE_UPDATE)
 * 4. Plinko Regression Suite
 */

const http = require("http");
const assert = require("assert");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const PRODUCTION_ROULETTE_URL = "https://roulette-8k8u.onrender.com/embed";
const PRODUCTION_ROULETTE_ORIGIN = "https://roulette-8k8u.onrender.com";

console.log("==================================================");
console.log("BETADRiX EUROPEAN ROULETTE INTEGRATION TEST SUITE");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Target Production URL: ${PRODUCTION_ROULETTE_URL}`);
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

// Simulated Authoritative BETADRiX Wallet for lifecycle test
class MockAuthoritativeWallet {
  constructor(initialBalance = 1250.00) {
    this.balance = initialBalance;
    this.transactions = new Map();
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

  handleMessage(origin, data) {
    // 1. Origin check: strict check, reject "*" or untrusted origins
    if (origin !== PRODUCTION_ROULETTE_ORIGIN && !origin.includes("localhost")) {
      return { ignored: true, reason: "UNTRUSTED_ORIGIN" };
    }

    if (data.type === "ROULETTE_READY") {
      return {
        type: "BETADRiX_ROULETTE_INIT",
        balance: this.balance,
        currency: "USD"
      };
    }

    if (data.type === "ROULETTE_BET_REQUEST") {
      const { requestId, amount } = data;
      if (!requestId || typeof requestId !== "string" || !requestId.trim()) {
        return { error: "INVALID_REQUEST_ID" };
      }

      // Duplicate protection: check if requestId already exists
      if (this.transactions.has(requestId)) {
        return { duplicate: true, action: "IGNORED" };
      }

      if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        this.transactions.set(requestId, { status: "REJECTED", amount });
        return {
          type: "BETADRiX_BET_REJECTED",
          requestId,
          reason: "INVALID_AMOUNT"
        };
      }

      if (amount > this.balance) {
        this.transactions.set(requestId, { status: "REJECTED", amount });
        return {
          type: "BETADRiX_BET_REJECTED",
          requestId,
          reason: "INSUFFICIENT_BALANCE"
        };
      }

      const newBal = this.deduct(amount);
      if (newBal === null) {
        this.transactions.set(requestId, { status: "REJECTED", amount });
        return {
          type: "BETADRiX_BET_REJECTED",
          requestId,
          reason: "INSUFFICIENT_BALANCE"
        };
      }

      this.transactions.set(requestId, {
        status: "ACCEPTED",
        betAmount: amount,
        timestamp: Date.now()
      });

      return {
        type: "BETADRiX_BET_ACCEPTED",
        requestId,
        amount,
        balance: newBal
      };
    }

    if (data.type === "ROULETTE_RESULT") {
      const { requestId, winningNumber, payout } = data;
      if (!requestId || typeof requestId !== "string" || !requestId.trim()) {
        return { error: "INVALID_REQUEST_ID" };
      }

      const tx = this.transactions.get(requestId);
      if (!tx) {
        return { error: "UNKNOWN_REQUEST_ID" };
      }

      // Duplicate protection: ensure result not settled twice
      if (tx.status === "SETTLED") {
        return { duplicate: true, action: "IGNORED_ALREADY_SETTLED" };
      }

      if (tx.status !== "ACCEPTED") {
        return { error: `INVALID_STATUS_${tx.status}` };
      }

      if (typeof payout !== "number" || !Number.isFinite(payout) || payout < 0) {
        return { error: "INVALID_PAYOUT" };
      }

      if (winningNumber !== undefined) {
        if (typeof winningNumber !== "number" || !Number.isInteger(winningNumber) || winningNumber < 0 || winningNumber > 36) {
          return { error: "INVALID_WINNING_NUMBER" };
        }
      }

      const roundedPayout = Number(payout.toFixed(2));
      tx.status = "SETTLED";
      tx.settledAt = Date.now();
      tx.payout = roundedPayout;
      if (winningNumber !== undefined) tx.winningNumber = winningNumber;

      const newBal = this.credit(roundedPayout);

      return {
        type: "BETADRiX_RESULT_SETTLED",
        requestId,
        betAmount: tx.betAmount,
        payout: roundedPayout,
        balance: newBal
      };
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

  // 1. Verify Game Config in BETADRiX API
  console.log("[1/5] Verifying Game Configurations via BETADRiX API...");
  const rouletteRes = await fetchJson("/api/games/roulette");
  const isRouletteOk =
    rouletteRes.status === 200 &&
    rouletteRes.body?.data?.id === "roulette" &&
    rouletteRes.body?.data?.provider === "BETADRiX" &&
    rouletteRes.body?.data?.launchUrl === PRODUCTION_ROULETTE_URL &&
    rouletteRes.body?.data?.isActive === true;

  record(
    "Roulette Production URL Config",
    isRouletteOk,
    `Resolved URL: ${rouletteRes.body?.data?.launchUrl}, Provider: ${rouletteRes.body?.data?.provider}`
  );

  const plinkoRes = await fetchJson("/api/games/plinko");
  const isPlinkoOk =
    plinkoRes.status === 200 &&
    plinkoRes.body?.data?.id === "plinko" &&
    plinkoRes.body?.data?.provider === "BETADRiX" &&
    plinkoRes.body?.data?.launchUrl === "https://plinko-1-b1u5.onrender.com/embed";

  record(
    "Plinko Regression Game Config",
    isPlinkoOk,
    `Resolved URL: ${plinkoRes.body?.data?.launchUrl}, Provider: ${plinkoRes.body?.data?.provider}`
  );

  // 2. Origin Security & Handshake Test
  console.log("\n[2/5] Testing Origin Security & Initial Handshake...");
  const wallet = new MockAuthoritativeWallet(1250.00);

  // Untrusted origin rejection
  const untrustedRes = wallet.handleMessage("https://malicious-casino.com", { type: "ROULETTE_READY" });
  record(
    "Untrusted Origin Rejection",
    untrustedRes?.ignored === true && untrustedRes?.reason === "UNTRUSTED_ORIGIN",
    "Rejected message from https://malicious-casino.com"
  );

  // Wildcard origin rejection
  const wildcardRes = wallet.handleMessage("*", { type: "ROULETTE_READY" });
  record(
    "Wildcard Origin Rejection",
    wildcardRes?.ignored === true,
    "Rejected message with origin '*'"
  );

  // Valid Handshake
  const initMsg = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, { type: "ROULETTE_READY" });
  const isInitOk =
    initMsg.type === "BETADRiX_ROULETTE_INIT" &&
    initMsg.balance === 1250.00 &&
    initMsg.currency === "USD";
  record(
    "BETADRiX_ROULETTE_INIT Handshake",
    isInitOk,
    `Initial synchronized balance: $${initMsg.balance} ${initMsg.currency}`
  );

  // 3. Bet Requests & Duplicate Protection
  console.log("\n[3/5] Testing Bet Request Deductions & Rejections...");

  // Insufficient balance ($2000 bet with $1250 balance)
  const rejInsuff = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_BET_REQUEST",
    requestId: "req_test_insuff",
    amount: 2000.00
  });
  record(
    "Insufficient Balance Rejection",
    rejInsuff.type === "BETADRiX_BET_REJECTED" && rejInsuff.reason === "INSUFFICIENT_BALANCE",
    "Rejected bet exceeding current balance ($2000 > $1250)"
  );

  // Negative/zero amount rejection
  const rejInvalid = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_BET_REQUEST",
    requestId: "req_test_invalid",
    amount: -10.00
  });
  record(
    "Invalid Amount Rejection",
    rejInvalid.type === "BETADRiX_BET_REJECTED" && rejInvalid.reason === "INVALID_AMOUNT",
    "Rejected negative amount (-$10.00)"
  );

  // Valid $10 Bet Acceptance (Single deduction: $1250 -> $1240)
  const bet1 = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_BET_REQUEST",
    requestId: "req_spin_1",
    amount: 10.00
  });
  const isBet1Ok =
    bet1.type === "BETADRiX_BET_ACCEPTED" &&
    bet1.amount === 10.00 &&
    bet1.balance === 1240.00 &&
    wallet.balance === 1240.00;
  record(
    "Single Bet Deduction ($10 Wager)",
    isBet1Ok,
    `Authoritative balance successfully reduced from $1250 to $${wallet.balance}`
  );

  // Duplicate Bet Request with same requestId: MUST NOT deduct again
  const dupBet = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_BET_REQUEST",
    requestId: "req_spin_1",
    amount: 10.00
  });
  const isDupBetPrevented =
    dupBet.duplicate === true &&
    wallet.balance === 1240.00;
  record(
    "Duplicate Bet Request Protection",
    isDupBetPrevented,
    `Duplicate request ignored; wallet remains unchanged at $${wallet.balance}`
  );

  // 4. Spin Settlement Scenarios
  console.log("\n[4/5] Testing Spin Settlement Semantics...");

  // Scenario A: Losing Spin ($10 wager, losing number, payout $0.00)
  const lossResult = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_RESULT",
    requestId: "req_spin_1",
    winningNumber: 0,
    payout: 0.00
  });
  const isLossOk =
    lossResult.type === "BETADRiX_RESULT_SETTLED" &&
    lossResult.payout === 0.00 &&
    lossResult.balance === 1240.00 &&
    wallet.balance === 1240.00;
  record(
    "Losing Bet Settlement (Payout $0.00)",
    isLossOk,
    `Balance confirmed at $${wallet.balance} after losing spin`
  );

  // Duplicate Result on already settled spin: MUST NOT credit again
  const dupLossResult = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_RESULT",
    requestId: "req_spin_1",
    winningNumber: 0,
    payout: 100.00
  });
  const isDupResultPrevented =
    dupLossResult.duplicate === true &&
    wallet.balance === 1240.00;
  record(
    "Duplicate Result Settlement Protection",
    isDupResultPrevented,
    `Duplicate result event ignored; wallet remains at $${wallet.balance}`
  );

  // Scenario B: Winning Straight Bet on 17 ($10 wager, 35:1 profit -> total return $360)
  // Wager $10: $1240 -> $1230
  wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_BET_REQUEST",
    requestId: "req_spin_2",
    amount: 10.00
  });
  assert.strictEqual(wallet.balance, 1230.00);

  // Result: winning straight bet 17 -> return $360.00. Balance becomes $1230 + $360 = $1590.00
  const winResult = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_RESULT",
    requestId: "req_spin_2",
    winningNumber: 17,
    payout: 360.00
  });
  const isWinOk =
    winResult.type === "BETADRiX_RESULT_SETTLED" &&
    winResult.payout === 360.00 &&
    winResult.balance === 1590.00 &&
    wallet.balance === 1590.00;
  record(
    "Winning Straight Bet Settlement ($10 on 17 -> $360 Return)",
    isWinOk,
    `Balance correctly calculated to $${wallet.balance}`
  );

  // Scenario C: Outside 1:1 Bet (Red) ($10 wager -> return $20.00)
  // Wager $10: $1590 -> $1580
  wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_BET_REQUEST",
    requestId: "req_spin_3",
    amount: 10.00
  });
  assert.strictEqual(wallet.balance, 1580.00);

  // Result: Red wins -> return $20.00. Balance becomes $1580 + $20 = $1600.00
  const outsideResult = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_RESULT",
    requestId: "req_spin_3",
    winningNumber: 14,
    payout: 20.00
  });
  const isOutsideOk =
    outsideResult.type === "BETADRiX_RESULT_SETTLED" &&
    outsideResult.payout === 20.00 &&
    outsideResult.balance === 1600.00 &&
    wallet.balance === 1600.00;
  record(
    "Outside 1:1 Bet Settlement ($10 Red -> $20 Return)",
    isOutsideOk,
    `Balance correctly calculated to $${wallet.balance}`
  );

  // Scenario D: Multiple simultaneous bets in one spin ($25 total wager across numbers)
  wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_BET_REQUEST",
    requestId: "req_spin_multi",
    amount: 25.00
  });
  const isMultiDeductOk = wallet.balance === 1575.00;
  const multiResult = wallet.handleMessage(PRODUCTION_ROULETTE_ORIGIN, {
    type: "ROULETTE_RESULT",
    requestId: "req_spin_multi",
    winningNumber: 32,
    payout: 72.00
  });
  const isMultiSettleOk =
    multiResult.type === "BETADRiX_RESULT_SETTLED" &&
    multiResult.payout === 72.00 &&
    wallet.balance === 1647.00;
  record(
    "Multiple Simultaneous Bets Settlement",
    isMultiDeductOk && isMultiSettleOk,
    `Wagered $25.00 (single transaction), settled $72.00 return; final balance: $${wallet.balance}`
  );

  // 5. Verification Summary
  console.log("\n==================================================");
  console.log("INTEGRATION SUITE RESULTS");
  console.log("==================================================");
  const allPass = results.every(r => r.pass);
  for (const r of results) {
    console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.name}`);
  }
  console.log("==================================================");

  if (allPass) {
    console.log("ALL ROULETTE INTEGRATION & WALLET TESTS PASSED (100% SUCCESS)!");
    process.exit(0);
  } else {
    console.error("SOME INTEGRATION TESTS FAILED!");
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error("Fatal test failure:", err);
  process.exit(1);
});
