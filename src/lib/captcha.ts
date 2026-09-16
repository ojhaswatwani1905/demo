import crypto from "crypto";

export interface CaptchaChallenge {
  token: string;
  question: string;
  type: "math" | "text";
}

// In-memory store with TTL for issued captcha challenges
interface ChallengeEntry {
  answer: string;
  expiresAt: number;
}

const challengeStore = new Map<string, ChallengeEntry>();

// Clean up expired tokens periodically
function cleanupExpired() {
  const now = Date.now();
  for (const [token, entry] of challengeStore.entries()) {
    if (entry.expiresAt < now) {
      challengeStore.delete(token);
    }
  }
}

/**
 * Generates a new unique CAPTCHA challenge.
 * Mixes arithmetic (e.g. "8 + 5 = ?") and alphanumeric challenges (e.g. "K7M2P").
 */
export function generateCaptcha(): CaptchaChallenge {
  cleanupExpired();

  const isMath = Math.random() > 0.5;
  let question: string;
  let answer: string;

  if (isMath) {
    const num1 = Math.floor(Math.random() * 12) + 3; // 3 to 14
    const num2 = Math.floor(Math.random() * 9) + 2;  // 2 to 10
    question = `${num1} + ${num2} = ?`;
    answer = String(num1 + num2);
  } else {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable chars without ambiguous 0/O, 1/I
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    question = code;
    answer = code;
  }

  const token = crypto.randomBytes(16).toString("hex");
  challengeStore.set(token, {
    answer: answer.trim().toLowerCase(),
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes TTL
  });

  return {
    token,
    question,
    type: isMath ? "math" : "text"
  };
}

/**
 * Validates a submitted answer against the token.
 * Consumes the token so it cannot be replayed.
 */
export function verifyCaptcha(token: string, submittedAnswer: string): boolean {
  if (!token || !submittedAnswer) return false;

  cleanupExpired();

  const entry = challengeStore.get(token);
  if (!entry) return false;

  // Single-use challenge: delete once checked
  challengeStore.delete(token);

  if (entry.expiresAt < Date.now()) return false;

  return entry.answer === submittedAnswer.trim().toLowerCase();
}
