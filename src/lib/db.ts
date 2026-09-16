import { Pool, QueryResult, QueryResultRow } from "pg";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Server-side default initial admin credentials (can be overridden via server-only env vars)
const DEFAULT_ADMIN_ID = process.env.ADMIN_ID || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "BetadrixAdmin2026!";

// 100 realistic dummy identities for the Live Activity pool
export const DUMMY_USERS = [
  "Alex", "Sarah", "Marcus", "Elena", "Liam", "Sophia", "David", "Emma", "Lucas", "Olivia",
  "Ethan", "Mia", "James", "Isabella", "Benjamin", "Charlotte", "Noah", "Ava", "William", "Amelia",
  "Daniel", "Harper", "Matthew", "Evelyn", "Henry", "Abigail", "Joseph", "Emily", "Samuel", "Elizabeth",
  "Jackson", "Sofia", "Sebastian", "Avery", "Aiden", "Ella", "Gabriel", "Scarlett", "Carter", "Grace",
  "Jayden", "Chloe", "John", "Victoria", "Luke", "Riley", "Anthony", "Aria", "Isaac", "Lily",
  "Dylan", "Aubrey", "Wyatt", "Zoey", "Andrew", "Hannah", "Joshua", "Layla", "Christopher", "Nora",
  "Gracy", "Leo", "Jack", "Julian", "Ryan", "Jaxon", "Levi", "Nathan", "Caleb", "Hunter",
  "Christian", "Isaiah", "Thomas", "Aaron", "Lincoln", "Eli", "Landon", "Connor", "Josiah", "Jonathan",
  "Cameron", "Jeremiah", "Matei", "Adrian", "Nolan", "Nicholas", "Easton", "Colton", "Carson", "Robert",
  "Angel", "Brayden", "Jordan", "Dominic", "Austin", "Ian", "Adam", "Elias", "Jaxson", "Greyson"
];

// Active games ONLY: Never Crash
export const ACTIVE_GAMES = ["Mines", "Dice", "Roulette", "Plinko"] as const;

export interface DummyActivityRecord {
  id?: number;
  username: string;
  game: string;
  payout_amount: number;
  multiplier: number;
  created_at?: string;
}

export interface SiteConfigRecord {
  id: number;
  telegram_url: string | null;
  whatsapp_url: string | null;
  site_name: string;
  updated_at: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface AdminUserRecord {
  id: number;
  admin_id: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Generate the 100 realistic dummy activity records
export function generateInitialDummyActivity(): DummyActivityRecord[] {
  const multipliersAndPayouts = [
    { mult: 8.42, payout: 842.50 },
    { mult: 12.40, payout: 1240.00 },
    { mult: 2.10, payout: 105.00 },
    { mult: 5.80, payout: 290.00 },
    { mult: 1.85, payout: 92.50 },
    { mult: 14.50, payout: 725.00 },
    { mult: 3.20, payout: 160.00 },
    { mult: 7.92, payout: 396.00 },
    { mult: 24.00, payout: 1200.00 },
    { mult: 1.50, payout: 75.00 },
    { mult: 9.60, payout: 480.00 },
    { mult: 18.20, payout: 910.00 },
    { mult: 4.30, payout: 215.00 },
    { mult: 6.75, payout: 337.50 },
    { mult: 32.00, payout: 1600.00 },
  ];

  return DUMMY_USERS.map((username, index) => {
    const game = ACTIVE_GAMES[index % ACTIVE_GAMES.length];
    const pair = multipliersAndPayouts[index % multipliersAndPayouts.length];
    // Slightly randomize payout for variation
    const basePayout = pair.payout * (0.8 + ((index * 7) % 50) / 100);
    return {
      id: index + 1,
      username,
      game,
      payout_amount: parseFloat(basePayout.toFixed(2)),
      multiplier: pair.mult,
      created_at: new Date(Date.now() - index * 60000).toISOString()
    };
  });
}

// --------------------------------------------------------------------------
// PostgreSQL Connection Pool & Resilient Fallback Management
// --------------------------------------------------------------------------

let pgPool: Pool | null = null;
let isPgConnected = false;
let dbInitPromise: Promise<boolean> | null = null;

// Local persistent file fallback for offline/testing environments
const FALLBACK_DIR = path.join(process.cwd(), ".data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "db.json");

interface LocalStore {
  users: UserRecord[];
  admin_users: AdminUserRecord[];
  site_config: SiteConfigRecord;
  dummy_activity: DummyActivityRecord[];
}

function readLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, "utf-8");
      const parsed: LocalStore = JSON.parse(data);
      if (!parsed.admin_users || parsed.admin_users.length === 0) {
        const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
        parsed.admin_users = [
          {
            id: 1,
            admin_id: DEFAULT_ADMIN_ID,
            password_hash: hash,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          }
        ];
        writeLocalStore(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error("Local store read error:", err);
  }

  const initialAdminHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  const initialStore: LocalStore = {
    users: [],
    admin_users: [
      {
        id: 1,
        admin_id: DEFAULT_ADMIN_ID,
        password_hash: initialAdminHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ],
    site_config: {
      id: 1,
      telegram_url: null,
      whatsapp_url: null,
      site_name: "BETADRiX DEMO",
      updated_at: new Date().toISOString()
    },
    dummy_activity: generateInitialDummyActivity()
  };
  writeLocalStore(initialStore);
  return initialStore;
}

function writeLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Local store write error:", err);
  }
}

/**
 * Initializes the database schema.
 * Creates users, site_config, and dummy_activity tables if using PostgreSQL.
 */
export async function initializeDatabase(): Promise<boolean> {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      // Use resilient local store
      readLocalStore();
      return false;
    }

    try {
      if (!pgPool) {
        pgPool = new Pool({
          connectionString: dbUrl,
          connectionTimeoutMillis: 3000,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
        });
      }

      const client = await pgPool.connect();
      try {
        // 1. Create USERS table
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 2. Create SITE_CONFIG table
        await client.query(`
          CREATE TABLE IF NOT EXISTS site_config (
            id INT PRIMARY KEY DEFAULT 1,
            telegram_url TEXT,
            whatsapp_url TEXT,
            site_name TEXT DEFAULT 'BETADRiX DEMO',
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 3. Create DUMMY_ACTIVITY table
        await client.query(`
          CREATE TABLE IF NOT EXISTS dummy_activity (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            game VARCHAR(100) NOT NULL,
            payout_amount NUMERIC(10,2) NOT NULL,
            multiplier NUMERIC(6,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 4. Create ADMIN_USERS table
        await client.query(`
          CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            admin_id VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
          );
        `);

        // Ensure default admin user exists
        const adminCheck = await client.query(`SELECT id FROM admin_users WHERE admin_id = $1`, [DEFAULT_ADMIN_ID]);
        if (adminCheck.rows.length === 0) {
          const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
          await client.query(
            `INSERT INTO admin_users (admin_id, password_hash, created_at, updated_at, is_active)
             VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE)`,
            [DEFAULT_ADMIN_ID, hash]
          );
        }

        // Ensure default site_config row exists
        const configCheck = await client.query(`SELECT id FROM site_config WHERE id = 1`);
        if (configCheck.rows.length === 0) {
          await client.query(`
            INSERT INTO site_config (id, telegram_url, whatsapp_url, site_name, updated_at)
            VALUES (1, NULL, NULL, 'BETADRiX DEMO', CURRENT_TIMESTAMP)
          `);
        }

        // Check if dummy_activity needs seeding
        const activityCount = await client.query(`SELECT COUNT(*) as count FROM dummy_activity`);
        if (parseInt(activityCount.rows[0].count, 10) < 100) {
          const initialData = generateInitialDummyActivity();
          for (const item of initialData) {
            await client.query(
              `INSERT INTO dummy_activity (username, game, payout_amount, multiplier, created_at)
               VALUES ($1, $2, $3, $4, $5)`,
              [item.username, item.game, item.payout_amount, item.multiplier, item.created_at]
            );
          }
        }

        isPgConnected = true;
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn("PostgreSQL connection error, operating in resilient local store mode:", (err as Error).message);
      isPgConnected = false;
      readLocalStore();
      return false;
    }
  })();

  return dbInitPromise;
}

// --------------------------------------------------------------------------
// Site Config Operations
// --------------------------------------------------------------------------

export async function getSiteConfig(): Promise<SiteConfigRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<SiteConfigRecord>(`SELECT * FROM site_config WHERE id = 1 LIMIT 1`);
      if (res.rows.length > 0) return res.rows[0];
    } catch (err) {
      console.error("Error fetching site_config from Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.site_config;
}

export async function updateSiteConfig(telegramUrl: string | null, whatsappUrl: string | null): Promise<SiteConfigRecord> {
  await initializeDatabase();

  const cleanTelegram = telegramUrl ? telegramUrl.trim() || null : null;
  const cleanWhatsapp = whatsappUrl ? whatsappUrl.trim() || null : null;
  const now = new Date().toISOString();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<SiteConfigRecord>(
        `INSERT INTO site_config (id, telegram_url, whatsapp_url, updated_at)
         VALUES (1, $1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE
         SET telegram_url = EXCLUDED.telegram_url,
             whatsapp_url = EXCLUDED.whatsapp_url,
             updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [cleanTelegram, cleanWhatsapp]
      );
      if (res.rows.length > 0) return res.rows[0];
    } catch (err) {
      console.error("Error updating site_config in Postgres:", err);
    }
  }

  const store = readLocalStore();
  store.site_config.telegram_url = cleanTelegram;
  store.site_config.whatsapp_url = cleanWhatsapp;
  store.site_config.updated_at = now;
  writeLocalStore(store);
  return store.site_config;
}

// --------------------------------------------------------------------------
// Dummy Activity Operations
// --------------------------------------------------------------------------

export async function getRecentActivity(limit = 10): Promise<DummyActivityRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      // Return a randomized/shuffled batch of records
      const res = await pgPool.query<DummyActivityRecord>(
        `SELECT id, username, game, payout_amount, multiplier, created_at
         FROM dummy_activity
         ORDER BY RANDOM()
         LIMIT $1`,
        [limit]
      );
      if (res.rows.length > 0) {
        return res.rows.map(r => ({
          ...r,
          payout_amount: parseFloat(r.payout_amount as any),
          multiplier: parseFloat(r.multiplier as any)
        }));
      }
    } catch (err) {
      console.error("Error querying dummy_activity from Postgres:", err);
    }
  }

  const store = readLocalStore();
  const shuffled = [...store.dummy_activity].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

// --------------------------------------------------------------------------
// User & Auth Operations
// --------------------------------------------------------------------------

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await initializeDatabase();
  const normalized = email.trim().toLowerCase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<UserRecord>(
        `SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`,
        [normalized]
      );
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error finding user by email in Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.users.find(u => u.email.toLowerCase() === normalized) || null;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<UserRecord> {
  await initializeDatabase();
  const normalized = email.trim().toLowerCase();
  const cleanName = name.trim();
  const now = new Date().toISOString();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<UserRecord>(
        `INSERT INTO users (name, email, password_hash, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING *`,
        [cleanName, normalized, passwordHash]
      );
      return res.rows[0];
    } catch (err) {
      console.error("Error creating user in Postgres:", err);
      throw new Error("Failed to create user in database");
    }
  }

  const store = readLocalStore();
  const existing = store.users.find(u => u.email.toLowerCase() === normalized);
  if (existing) {
    throw new Error("Email already registered");
  }

  const newUser: UserRecord = {
    id: store.users.length + 1,
    name: cleanName,
    email: normalized,
    password_hash: passwordHash,
    created_at: now
  };
  store.users.push(newUser);
  writeLocalStore(store);
  return newUser;
}

// --------------------------------------------------------------------------
// Admin Authentication & Administration Operations
// --------------------------------------------------------------------------

export async function findAdminByAdminId(adminId: string): Promise<AdminUserRecord | null> {
  await initializeDatabase();
  const cleanId = adminId.trim();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<AdminUserRecord>(
        `SELECT id, admin_id, password_hash, created_at, updated_at, is_active
         FROM admin_users
         WHERE admin_id = $1 AND is_active = TRUE
         LIMIT 1`,
        [cleanId]
      );
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error querying admin_users in Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.admin_users?.find(a => a.admin_id === cleanId && a.is_active) || null;
}

export async function getAllUsers(limit = 100): Promise<Array<{ id: number; name: string; email: string; created_at: string }>> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      // NEVER return password_hash to callers!
      const res = await pgPool.query<{ id: number; name: string; email: string; created_at: string }>(
        `SELECT id, name, email, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );
      return res.rows;
    } catch (err) {
      console.error("Error querying users in Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.users
    .slice(0, limit)
    .map(u => ({ id: u.id, name: u.name, email: u.email, created_at: u.created_at }))
    .reverse();
}

export async function getAllDummyActivity(limit = 100): Promise<DummyActivityRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<DummyActivityRecord>(
        `SELECT id, username, game, payout_amount, multiplier, created_at
         FROM dummy_activity
         ORDER BY id ASC
         LIMIT $1`,
        [limit]
      );
      return res.rows.map(r => ({
        ...r,
        payout_amount: parseFloat(r.payout_amount as any),
        multiplier: parseFloat(r.multiplier as any)
      }));
    } catch (err) {
      console.error("Error querying all dummy_activity in Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.dummy_activity.slice(0, limit);
}

export async function getDatabaseHealth(): Promise<{ isConnected: boolean; engine: "PostgreSQL" | "Local JSON Fallback"; totalUsers: number; totalActivity: number }> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const uCountRes = await pgPool.query<{ count: string }>(`SELECT COUNT(*) as count FROM users`);
      const aCountRes = await pgPool.query<{ count: string }>(`SELECT COUNT(*) as count FROM dummy_activity`);
      return {
        isConnected: true,
        engine: "PostgreSQL",
        totalUsers: parseInt(uCountRes.rows[0]?.count || "0", 10),
        totalActivity: parseInt(aCountRes.rows[0]?.count || "0", 10)
      };
    } catch (err) {
      console.error("Error checking Postgres health:", err);
    }
  }

  const store = readLocalStore();
  return {
    isConnected: false,
    engine: "Local JSON Fallback",
    totalUsers: store.users.length,
    totalActivity: store.dummy_activity.length
  };
}
