import { Pool, QueryResult, QueryResultRow } from "pg";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { GAMES } from "@/config/games";

// Server-side default initial admin credentials (configured strictly via server-only env vars)
const DEFAULT_ADMIN_ID = process.env.ADMIN_ID || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");

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
  balance: number;
  is_active: boolean;
  created_at: string;
  last_activity?: string;
}

export interface AdminUserRecord {
  id: number;
  admin_id: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  session_version: number;
}

export interface BalanceAuditRecord {
  id: number;
  user_id: number;
  admin_id: string;
  previous_balance: number;
  adjustment_amount: number;
  new_balance: number;
  action_type: "add" | "remove" | "reset";
  reason: string;
  created_at: string;
}

export interface GeneralConfigRecord {
  id: number;
  platform_name: string;
  demo_mode: boolean;
  default_demo_balance: number;
  currency_symbol: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  signin_enabled: boolean;
  topup_enabled: boolean;
  max_demo_balance: number;
  default_language: string;
  timezone: string;
  updated_at: string;
}

export interface PromotionRecord {
  id: number;
  title: string;
  short_desc: string;
  long_desc: string;
  banner_image: string;
  cta_text: string;
  start_date?: string;
  end_date?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VipTierRecord {
  id: number;
  name: string;
  badge: string;
  min_activity: number;
  demo_bonus: number;
  benefits: string[];
  display_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface BonusSettingsRecord {
  id: number;
  daily_faucet_amount: number;
  faucet_cooldown_hours: number;
  topup_options: number[];
  max_balance: number;
  bonus_multiplier: number;
  is_active: boolean;
  reset_rules: string;
  updated_at: string;
}

export interface GameConfigRecord {
  id: number;
  game_id: string;
  name: string;
  provider: string;
  category: string;
  image_url: string;
  launch_url: string;
  is_active: boolean;
  display_order: number;
  updated_at: string;
  is_enabled?: boolean;
  min_bet?: number;
  max_bet?: number;
  rtp_percentage?: number;
  maintenance_message?: string;
}

export interface AdminAuditRecord {
  id: number;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  ip_address?: string;
  created_at: string;
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
// Initial Fallback Catalogs
// --------------------------------------------------------------------------

function getDefaultPromotions(): PromotionRecord[] {
  return [
    {
      id: 1,
      title: "100% Demo Reload Match",
      short_desc: "Double your virtual test balance on your demo wallet with up to $2,500.00 in simulated credits.",
      long_desc: "Explore authorized demo titles with an immediate virtual credit boost. Ideal for trying diverse multiplier strategies across Mines and Roulette.",
      banner_image: "/assets/ui/promotions_hero.jpg",
      cta_text: "CLAIM DEMO RELOAD",
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Weekly High-Roller Playground",
      short_desc: "Experience high-limit simulation tables with maximum demonstration multipliers.",
      long_desc: "Participate in simulated high-stakes test sessions across authorized Spribe & Turbo Games mechanics.",
      banner_image: "/assets/ui/banner_vip.jpg",
      cta_text: "VIEW TABLES",
      display_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      title: "Minesweeper Multiplier Sprint",
      short_desc: "Hit consecutive clean diamonds in Mines demo to unlock simulated leaderboard achievements.",
      long_desc: "Configure grid sizes and mine densities to test mathematical risk vs payout algorithms in a safe environment.",
      banner_image: "/assets/ui/banner_mines.jpg",
      cta_text: "PLAY MINES DEMO",
      display_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

function getDefaultVipTiers(): VipTierRecord[] {
  return [
    {
      id: 1,
      name: "VIP Bronze",
      badge: "BRONZE",
      min_activity: 0,
      demo_bonus: 500,
      benefits: ["Standard demo reload balance", "Access to Mines, Dice, and Roulette", "Community demo events"],
      display_order: 1,
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "VIP Silver",
      badge: "SILVER",
      min_activity: 10000,
      demo_bonus: 1500,
      benefits: ["1.5x Daily Faucet allocation", "Priority game launch sandbox", "Custom simulated bet size limits"],
      display_order: 2,
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "VIP Gold",
      badge: "GOLD",
      min_activity: 50000,
      demo_bonus: 5000,
      benefits: ["2x Daily Faucet allocation", "Exclusive early-access game previews", "Dedicated Telegram demo concierge"],
      display_order: 3,
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: "VIP Platinum",
      badge: "PLATINUM",
      min_activity: 200000,
      demo_bonus: 20000,
      benefits: ["Unlimited sandbox refills", "Custom theme & sound pack controls", "Direct channel with engineering team"],
      display_order: 4,
      is_active: true,
      updated_at: new Date().toISOString()
    }
  ];
}

function getDefaultBonusSettings(): BonusSettingsRecord {
  return {
    id: 1,
    daily_faucet_amount: 1000.00,
    faucet_cooldown_hours: 24,
    topup_options: [500, 1000, 5000],
    max_balance: 100000.00,
    bonus_multiplier: 1.00,
    is_active: true,
    reset_rules: "Balances can be reset once every 6 hours if virtual balance drops below $100.00",
    updated_at: new Date().toISOString()
  };
}

function getDefaultGameConfigs(): GameConfigRecord[] {
  return GAMES.map((g, idx) => ({
    id: idx + 1,
    game_id: g.id,
    name: g.name,
    provider: g.provider,
    category: g.category,
    image_url: g.image,
    launch_url: g.defaultDemoUrl || "",
    is_active: true,
    display_order: idx + 1,
    updated_at: new Date().toISOString()
  }));
}

// --------------------------------------------------------------------------
// PostgreSQL Connection Pool & Local Fallback Management
// --------------------------------------------------------------------------

let pgPool: Pool | null = null;
let isPgConnected = false;
let dbInitPromise: Promise<boolean> | null = null;
let lastSuccessfulDbOp: string = new Date().toISOString();

const FALLBACK_DIR = path.join(process.cwd(), ".data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "db.json");

interface LocalStore {
  users: UserRecord[];
  admin_users: AdminUserRecord[];
  site_config: SiteConfigRecord;
  general_config: GeneralConfigRecord;
  promotions: PromotionRecord[];
  vip_tiers: VipTierRecord[];
  bonus_settings: BonusSettingsRecord;
  game_configs: GameConfigRecord[];
  balance_audit_logs: BalanceAuditRecord[];
  admin_audit_logs: AdminAuditRecord[];
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

      let updated = false;
      if (!parsed.admin_users || parsed.admin_users.length === 0) {
        const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
        parsed.admin_users = [{
          id: 1,
          admin_id: DEFAULT_ADMIN_ID,
          password_hash: hash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          session_version: 1
        }];
        updated = true;
      }

      if (!parsed.general_config) {
        parsed.general_config = {
          id: 1,
          platform_name: "BETADRiX DEMO",
          demo_mode: true,
          default_demo_balance: 1250.00,
          currency_symbol: "$",
          maintenance_mode: false,
          registration_enabled: true,
          signin_enabled: true,
          topup_enabled: true,
          max_demo_balance: 100000.00,
          default_language: "English",
          timezone: "UTC",
          updated_at: new Date().toISOString()
        };
        updated = true;
      }

      if (!parsed.promotions || parsed.promotions.length === 0) {
        parsed.promotions = getDefaultPromotions();
        updated = true;
      }

      if (!parsed.vip_tiers || parsed.vip_tiers.length === 0) {
        parsed.vip_tiers = getDefaultVipTiers();
        updated = true;
      }

      if (!parsed.bonus_settings) {
        parsed.bonus_settings = getDefaultBonusSettings();
        updated = true;
      }

      if (!parsed.game_configs || parsed.game_configs.length === 0) {
        parsed.game_configs = getDefaultGameConfigs();
        updated = true;
      } else {
        const plinkoEntry = parsed.game_configs.find(g => g.game_id.toLowerCase() === "plinko");
        if (plinkoEntry) {
          if (plinkoEntry.provider === "Spribe" || !plinkoEntry.launch_url || plinkoEntry.launch_url.trim() === "") {
            plinkoEntry.provider = "BETADRiX";
            plinkoEntry.name = "PLINKO";
            plinkoEntry.launch_url = "https://plinko-1-b1u5.onrender.com/embed";
            plinkoEntry.is_active = true;
            plinkoEntry.is_enabled = true;
            plinkoEntry.updated_at = new Date().toISOString();
            updated = true;
          }
        }
      }

      if (!parsed.balance_audit_logs) {
        parsed.balance_audit_logs = [];
        updated = true;
      }

      if (!parsed.admin_audit_logs) {
        parsed.admin_audit_logs = [];
        updated = true;
      }

      // Ensure user balances exist
      if (parsed.users) {
        parsed.users.forEach((u) => {
          if (u.balance === undefined) {
            u.balance = 1250.00;
            updated = true;
          }
          if (u.is_active === undefined) {
            u.is_active = true;
            updated = true;
          }
        });
      }

      if (updated) writeLocalStore(parsed);
      return parsed;
    }
  } catch (err) {
    console.error("Local store read error:", err);
  }

  const initialAdminHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  const initialStore: LocalStore = {
    users: [],
    admin_users: [{
      id: 1,
      admin_id: DEFAULT_ADMIN_ID,
      password_hash: initialAdminHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      session_version: 1
    }],
    site_config: {
      id: 1,
      telegram_url: "https://t.me/betadrix_official",
      whatsapp_url: "https://wa.me/15551234567",
      site_name: "BETADRiX DEMO",
      updated_at: new Date().toISOString()
    },
    general_config: {
      id: 1,
      platform_name: "BETADRiX DEMO",
      demo_mode: true,
      default_demo_balance: 1250.00,
      currency_symbol: "$",
      maintenance_mode: false,
      registration_enabled: true,
      signin_enabled: true,
      topup_enabled: true,
      max_demo_balance: 100000.00,
      default_language: "English",
      timezone: "UTC",
      updated_at: new Date().toISOString()
    },
    promotions: getDefaultPromotions(),
    vip_tiers: getDefaultVipTiers(),
    bonus_settings: getDefaultBonusSettings(),
    game_configs: getDefaultGameConfigs(),
    balance_audit_logs: [],
    admin_audit_logs: [],
    dummy_activity: generateInitialDummyActivity()
  };

  writeLocalStore(initialStore);
  return initialStore;
}

function writeLocalStore(store: LocalStore): void {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(store, null, 2), "utf-8");
    lastSuccessfulDbOp = new Date().toISOString();
  } catch (err) {
    console.error("Local store write error:", err);
  }
}

/**
 * Initializes the database schema.
 * Creates users, site_config, general_config, promotions, vip_tiers,
 * bonus_settings, game_configs, balance_audit_logs, admin_audit_logs.
 */
export async function initializeDatabase(): Promise<boolean> {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      readLocalStore();
      return false;
    }

    try {
      if (!pgPool) {
        const isLocalDb = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
        const needsSsl = !isLocalDb;

        pgPool = new Pool({
          connectionString: dbUrl,
          connectionTimeoutMillis: 10000,
          max: 10,
          idleTimeoutMillis: 30000,
          ssl: needsSsl ? { rejectUnauthorized: false } : undefined
        });
      }

      let client;
      try {
        client = await pgPool.connect();
      } catch (connErr: any) {
        if (
          connErr?.message?.includes("does not support SSL") ||
          connErr?.message?.includes("server does not support SSL")
        ) {
          console.warn("PostgreSQL server does not support SSL, retrying with SSL disabled...");
          try {
            await pgPool.end();
          } catch {}
          pgPool = new Pool({
            connectionString: dbUrl,
            connectionTimeoutMillis: 10000,
            max: 10,
            idleTimeoutMillis: 30000,
            ssl: false
          });
          client = await pgPool.connect();
        } else {
          throw connErr;
        }
      }
      try {
        // 1. Users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            balance NUMERIC(14,2) DEFAULT 1250.00,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC(14,2) DEFAULT 1250.00;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        // 2. Site config table (Support)
        await client.query(`
          CREATE TABLE IF NOT EXISTS site_config (
            id INT PRIMARY KEY DEFAULT 1,
            telegram_url TEXT,
            whatsapp_url TEXT,
            site_name TEXT DEFAULT 'BETADRiX DEMO',
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 3. General config table
        await client.query(`
          CREATE TABLE IF NOT EXISTS general_config (
            id INT PRIMARY KEY DEFAULT 1,
            platform_name TEXT DEFAULT 'BETADRiX DEMO',
            demo_mode BOOLEAN DEFAULT TRUE,
            default_demo_balance NUMERIC(14,2) DEFAULT 1250.00,
            currency_symbol VARCHAR(10) DEFAULT '$',
            maintenance_mode BOOLEAN DEFAULT FALSE,
            registration_enabled BOOLEAN DEFAULT TRUE,
            signin_enabled BOOLEAN DEFAULT TRUE,
            topup_enabled BOOLEAN DEFAULT TRUE,
            max_demo_balance NUMERIC(14,2) DEFAULT 100000.00,
            default_language VARCHAR(20) DEFAULT 'English',
            timezone VARCHAR(50) DEFAULT 'UTC',
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 4. Dummy activity table
        await client.query(`
          CREATE TABLE IF NOT EXISTS dummy_activity (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            game VARCHAR(50) NOT NULL,
            payout_amount NUMERIC(10, 2) NOT NULL,
            multiplier NUMERIC(6, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 5. Admin users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            admin_id VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            session_version INT DEFAULT 1
          );
          ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS session_version INT DEFAULT 1;
        `);

        // 6. Balance audit logs
        await client.query(`
          CREATE TABLE IF NOT EXISTS balance_audit_logs (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            admin_id VARCHAR(100) NOT NULL,
            previous_balance NUMERIC(14,2) NOT NULL,
            adjustment_amount NUMERIC(14,2) NOT NULL,
            new_balance NUMERIC(14,2) NOT NULL,
            action_type VARCHAR(50) NOT NULL,
            reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 7. Promotions table
        await client.query(`
          CREATE TABLE IF NOT EXISTS promotions (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            short_desc TEXT,
            long_desc TEXT,
            banner_image TEXT,
            cta_text VARCHAR(50) DEFAULT 'EXPLORE',
            start_date TIMESTAMP WITH TIME ZONE,
            end_date TIMESTAMP WITH TIME ZONE,
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 8. VIP tiers table
        await client.query(`
          CREATE TABLE IF NOT EXISTS vip_tiers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            badge VARCHAR(50),
            min_activity NUMERIC(14,2) DEFAULT 0,
            demo_bonus NUMERIC(14,2) DEFAULT 0,
            benefits JSONB DEFAULT '[]'::jsonb,
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 9. Bonus settings table
        await client.query(`
          CREATE TABLE IF NOT EXISTS bonus_settings (
            id INT PRIMARY KEY DEFAULT 1,
            daily_faucet_amount NUMERIC(14,2) DEFAULT 1000.00,
            faucet_cooldown_hours INT DEFAULT 24,
            topup_options JSONB DEFAULT '[500, 1000, 5000]'::jsonb,
            max_balance NUMERIC(14,2) DEFAULT 100000.00,
            bonus_multiplier NUMERIC(4,2) DEFAULT 1.00,
            is_active BOOLEAN DEFAULT TRUE,
            reset_rules TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 10. Game configs table
        await client.query(`
          CREATE TABLE IF NOT EXISTS game_configs (
            id SERIAL PRIMARY KEY,
            game_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            provider VARCHAR(100),
            category VARCHAR(50),
            image_url TEXT,
            launch_url TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            display_order INT DEFAULT 0,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // 11. Admin audit logs table
        await client.query(`
          CREATE TABLE IF NOT EXISTS admin_audit_logs (
            id SERIAL PRIMARY KEY,
            admin_id VARCHAR(100) NOT NULL,
            action VARCHAR(100) NOT NULL,
            target_type VARCHAR(50),
            target_id VARCHAR(100),
            old_value JSONB,
            new_value JSONB,
            reason TEXT,
            ip_address VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Seed initial admin user if empty
        const adminCheck = await client.query(`SELECT id FROM admin_users WHERE admin_id = $1`, [DEFAULT_ADMIN_ID]);
        if (adminCheck.rows.length === 0) {
          const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
          await client.query(
            `INSERT INTO admin_users (admin_id, password_hash, created_at, updated_at, is_active, session_version)
             VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, 1)`,
            [DEFAULT_ADMIN_ID, hash]
          );
        }

        // Seed default site_config
        const configCheck = await client.query(`SELECT id FROM site_config WHERE id = 1`);
        if (configCheck.rows.length === 0) {
          await client.query(`
            INSERT INTO site_config (id, telegram_url, whatsapp_url, site_name, updated_at)
            VALUES (1, 'https://t.me/betadrix_official', 'https://wa.me/15551234567', 'BETADRiX DEMO', CURRENT_TIMESTAMP)
          `);
        }

        // Seed default general_config
        const genCheck = await client.query(`SELECT id FROM general_config WHERE id = 1`);
        if (genCheck.rows.length === 0) {
          await client.query(`
            INSERT INTO general_config (id, platform_name, demo_mode, default_demo_balance, currency_symbol, maintenance_mode, registration_enabled, signin_enabled, topup_enabled, max_demo_balance, default_language, timezone)
            VALUES (1, 'BETADRiX DEMO', TRUE, 1250.00, '$', FALSE, TRUE, TRUE, TRUE, 100000.00, 'English', 'UTC')
          `);
        }

        // Seed promotions if empty
        const promoCheck = await client.query(`SELECT id FROM promotions LIMIT 1`);
        if (promoCheck.rows.length === 0) {
          for (const p of getDefaultPromotions()) {
            await client.query(
              `INSERT INTO promotions (title, short_desc, long_desc, banner_image, cta_text, display_order, is_active)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [p.title, p.short_desc, p.long_desc, p.banner_image, p.cta_text, p.display_order, p.is_active]
            );
          }
        }

        // Seed VIP tiers if empty
        const vipCheck = await client.query(`SELECT id FROM vip_tiers LIMIT 1`);
        if (vipCheck.rows.length === 0) {
          for (const v of getDefaultVipTiers()) {
            await client.query(
              `INSERT INTO vip_tiers (name, badge, min_activity, demo_bonus, benefits, display_order, is_active)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [v.name, v.badge, v.min_activity, v.demo_bonus, JSON.stringify(v.benefits), v.display_order, v.is_active]
            );
          }
        }

        // Seed Bonus settings if empty
        const bonusCheck = await client.query(`SELECT id FROM bonus_settings WHERE id = 1`);
        if (bonusCheck.rows.length === 0) {
          const b = getDefaultBonusSettings();
          await client.query(
            `INSERT INTO bonus_settings (id, daily_faucet_amount, faucet_cooldown_hours, topup_options, max_balance, bonus_multiplier, is_active, reset_rules)
             VALUES (1, $1, $2, $3, $4, $5, $6, $7)`,
            [b.daily_faucet_amount, b.faucet_cooldown_hours, JSON.stringify(b.topup_options), b.max_balance, b.bonus_multiplier, b.is_active, b.reset_rules]
          );
        }

        // Seed Game configs if empty
        const gameCheck = await client.query(`SELECT id FROM game_configs LIMIT 1`);
        if (gameCheck.rows.length === 0) {
          for (const g of getDefaultGameConfigs()) {
            await client.query(
              `INSERT INTO game_configs (game_id, name, provider, category, image_url, launch_url, is_active, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (game_id) DO NOTHING`,
              [g.game_id, g.name, g.provider, g.category, g.image_url, g.launch_url, g.is_active, g.display_order]
            );
          }
        } else {
          // Ensure Plinko is migrated from Spribe to BETADRiX standalone embed in existing DB
          await client.query(`
            UPDATE game_configs
            SET provider = 'BETADRiX',
                name = 'PLINKO',
                launch_url = 'https://plinko-1-b1u5.onrender.com/embed',
                updated_at = CURRENT_TIMESTAMP
            WHERE LOWER(game_id) = 'plinko' AND (provider = 'Spribe' OR launch_url IS NULL OR launch_url = '')
          `);
        }

        // Seed dummy activity if empty
        const activityCheck = await client.query(`SELECT id FROM dummy_activity LIMIT 1`);
        if (activityCheck.rows.length === 0) {
          const initialActivity = generateInitialDummyActivity();
          for (const act of initialActivity) {
            await client.query(
              `INSERT INTO dummy_activity (username, game, payout_amount, multiplier, created_at)
               VALUES ($1, $2, $3, $4, $5)`,
              [act.username, act.game, act.payout_amount, act.multiplier, act.created_at]
            );
          }
        }

        isPgConnected = true;
        lastSuccessfulDbOp = new Date().toISOString();
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn("PostgreSQL connection failed, continuing with resilient local fallback:", err);
      isPgConnected = false;
      if (pgPool) {
        try {
          await pgPool.end();
        } catch {}
        pgPool = null;
      }
      dbInitPromise = null;
      readLocalStore();
      return false;
    }
  })();

  return dbInitPromise;
}

// --------------------------------------------------------------------------
// User Query Methods
// --------------------------------------------------------------------------

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await initializeDatabase();
  const cleanEmail = email.toLowerCase().trim();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<UserRecord>(
        `SELECT id, name, email, password_hash, balance, is_active, created_at, last_activity
         FROM users WHERE LOWER(email) = $1`,
        [cleanEmail]
      );
      if (res.rows.length > 0) {
        lastSuccessfulDbOp = new Date().toISOString();
        return {
          ...res.rows[0],
          balance: Number(res.rows[0].balance || 0)
        };
      }
      return null;
    } catch (err) {
      console.error("Error querying user by email in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);
  return user ? { ...user, balance: Number(user.balance || 1250) } : null;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<UserRecord> {
  await initializeDatabase();
  const cleanName = name.trim();
  const cleanEmail = email.toLowerCase().trim();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<UserRecord>(
        `INSERT INTO users (name, email, password_hash, balance, is_active, created_at, last_activity)
         VALUES ($1, $2, $3, 1250.00, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, password_hash, balance, is_active, created_at, last_activity`,
        [cleanName, cleanEmail, passwordHash]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return {
        ...res.rows[0],
        balance: Number(res.rows[0].balance || 1250)
      };
    } catch (err) {
      console.error("Error creating user in Postgres, writing to local fallback:", err);
    }
  }

  const store = readLocalStore();
  const newId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
  const newUser: UserRecord = {
    id: newId,
    name: cleanName,
    email: cleanEmail,
    password_hash: passwordHash,
    balance: 1250.00,
    is_active: true,
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString()
  };
  store.users.push(newUser);
  writeLocalStore(store);
  return newUser;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<UserRecord>(
        `SELECT id, name, email, password_hash, balance, is_active, created_at, last_activity
         FROM users WHERE id = $1`,
        [id]
      );
      if (res.rows.length > 0) {
        lastSuccessfulDbOp = new Date().toISOString();
        return {
          ...res.rows[0],
          balance: Number(res.rows[0].balance || 0)
        };
      }
      return null;
    } catch (err) {
      console.error("Error querying user by ID in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const user = store.users.find(u => u.id === id);
  return user ? { ...user, balance: Number(user.balance || 1250) } : null;
}

export async function getAllUsers(limit = 100): Promise<UserRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<UserRecord>(
        `SELECT id, name, email, '' AS password_hash, balance, is_active, created_at, last_activity
         FROM users ORDER BY id DESC LIMIT $1`,
        [limit]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows.map(u => ({ ...u, balance: Number(u.balance || 0) }));
    } catch (err) {
      console.error("Error loading users from Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.users.slice(-limit).reverse().map(u => ({
    ...u,
    password_hash: "",
    balance: Number(u.balance || 1250)
  }));
}

export async function getUserDetail(id: number) {
  await initializeDatabase();
  const user = await findUserById(id);
  if (!user) return null;

  // Retrieve user's balance audit logs
  const logs = await getBalanceAuditLogs(id, 20);

  // Generate simulated gameplay summary
  const simulatedGames = ["Mines", "Dice", "Roulette", "Plinko"];
  const simulatedWins = Number((user.balance * 0.65).toFixed(2));
  const simulatedPayouts = Number((user.balance * 0.45).toFixed(2));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    is_active: user.is_active,
    created_at: user.created_at,
    last_activity: user.last_activity || user.created_at,
    audit_logs: logs,
    games_played: simulatedGames,
    simulated_winnings: simulatedWins,
    simulated_payouts: simulatedPayouts
  };
}

export async function toggleUserStatus(userId: number, isActive: boolean): Promise<boolean> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      await pgPool.query(
        `UPDATE users SET is_active = $1, last_activity = CURRENT_TIMESTAMP WHERE id = $2`,
        [isActive, userId]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return true;
    } catch (err) {
      console.error("Error toggling user status in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const user = store.users.find(u => u.id === userId);
  if (user) {
    user.is_active = isActive;
    user.last_activity = new Date().toISOString();
    writeLocalStore(store);
    return true;
  }
  return false;
}

// --------------------------------------------------------------------------
// Atomic Balance Adjustments & Immutable Audit Logs
// --------------------------------------------------------------------------

export async function adjustUserDemoBalance(
  userId: number,
  adminId: string,
  amount: number,
  actionType: "add" | "remove" | "reset",
  reason: string
): Promise<{
  success: boolean;
  userId: number;
  previousBalance: number;
  newBalance: number;
  adjustmentAmount: number;
  actionType: string;
  reason: string;
  error?: string;
}> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      // Lock user row for update
      const userRes = await client.query(
        `SELECT id, balance FROM users WHERE id = $1 FOR UPDATE`,
        [userId]
      );
      if (userRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return { success: false, userId, previousBalance: 0, newBalance: 0, adjustmentAmount: 0, actionType, reason, error: "User not found" };
      }

      const prev = Number(userRes.rows[0].balance || 0);
      let calculatedNew = prev;

      if (actionType === "add") {
        calculatedNew = prev + Math.abs(amount);
      } else if (actionType === "remove") {
        calculatedNew = prev - Math.abs(amount);
      } else if (actionType === "reset") {
        calculatedNew = 1250.00;
      }

      if (calculatedNew < 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          userId,
          previousBalance: prev,
          newBalance: prev,
          adjustmentAmount: amount,
          actionType,
          reason,
          error: "Adjustment would result in negative balance."
        };
      }

      const diff = Number((calculatedNew - prev).toFixed(2));

      await client.query(
        `UPDATE users SET balance = $1, last_activity = CURRENT_TIMESTAMP WHERE id = $2`,
        [calculatedNew, userId]
      );

      await client.query(
        `INSERT INTO balance_audit_logs (user_id, admin_id, previous_balance, adjustment_amount, new_balance, action_type, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, adminId, prev, diff, calculatedNew, actionType, reason || "Admin manual adjustment"]
      );

      await client.query("COMMIT");
      lastSuccessfulDbOp = new Date().toISOString();

      return {
        success: true,
        userId,
        previousBalance: prev,
        newBalance: calculatedNew,
        adjustmentAmount: diff,
        actionType,
        reason
      };
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Error executing balance transaction in Postgres:", err);
      return { success: false, userId, previousBalance: 0, newBalance: 0, adjustmentAmount: 0, actionType, reason, error: err?.message || "Transaction failed" };
    } finally {
      client.release();
    }
  }

  // Local fallback transaction
  const store = readLocalStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return { success: false, userId, previousBalance: 0, newBalance: 0, adjustmentAmount: 0, actionType, reason, error: "User not found" };
  }

  const prev = Number(user.balance || 1250);
  let calculatedNew = prev;

  if (actionType === "add") {
    calculatedNew = prev + Math.abs(amount);
  } else if (actionType === "remove") {
    calculatedNew = prev - Math.abs(amount);
  } else if (actionType === "reset") {
    calculatedNew = 1250.00;
  }

  if (calculatedNew < 0) {
    return {
      success: false,
      userId,
      previousBalance: prev,
      newBalance: prev,
      adjustmentAmount: amount,
      actionType,
      reason,
      error: "Adjustment would result in negative balance."
    };
  }

  const diff = Number((calculatedNew - prev).toFixed(2));
  user.balance = calculatedNew;
  user.last_activity = new Date().toISOString();

  const auditLog: BalanceAuditRecord = {
    id: (store.balance_audit_logs?.length || 0) + 1,
    user_id: userId,
    admin_id: adminId,
    previous_balance: prev,
    adjustment_amount: diff,
    new_balance: calculatedNew,
    action_type: actionType,
    reason: reason || "Admin manual adjustment",
    created_at: new Date().toISOString()
  };

  if (!store.balance_audit_logs) store.balance_audit_logs = [];
  store.balance_audit_logs.push(auditLog);
  writeLocalStore(store);

  return {
    success: true,
    userId,
    previousBalance: prev,
    newBalance: calculatedNew,
    adjustmentAmount: diff,
    actionType,
    reason
  };
}

export async function getBalanceAuditLogs(userId?: number, limit = 100): Promise<BalanceAuditRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      let query = `SELECT id, user_id, admin_id, previous_balance, adjustment_amount, new_balance, action_type, reason, created_at
                   FROM balance_audit_logs`;
      const params: any[] = [];
      if (userId) {
        query += ` WHERE user_id = $1`;
        params.push(userId);
      }
      query += ` ORDER BY id DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const res = await pgPool.query(query, params);
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows.map(r => ({
        ...r,
        previous_balance: Number(r.previous_balance),
        adjustment_amount: Number(r.adjustment_amount),
        new_balance: Number(r.new_balance)
      }));
    } catch (err) {
      console.error("Error loading balance audit logs from Postgres:", err);
    }
  }

  const store = readLocalStore();
  let logs = store.balance_audit_logs || [];
  if (userId) {
    logs = logs.filter(l => l.user_id === userId);
  }
  return logs.slice(-limit).reverse();
}

// --------------------------------------------------------------------------
// Admin Actions Audit Log
// --------------------------------------------------------------------------

export async function recordAdminAuditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  oldValue: any = null,
  newValue: any = null,
  reason: string = "",
  ipAddress: string = "127.0.0.1"
): Promise<void> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, old_value, new_value, reason, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [adminId, action, targetType, targetId, JSON.stringify(oldValue), JSON.stringify(newValue), reason, ipAddress]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return;
    } catch (err) {
      console.error("Error writing admin audit log in Postgres:", err);
    }
  }

  const store = readLocalStore();
  if (!store.admin_audit_logs) store.admin_audit_logs = [];
  store.admin_audit_logs.push({
    id: store.admin_audit_logs.length + 1,
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    old_value: oldValue,
    new_value: newValue,
    reason,
    ip_address: ipAddress,
    created_at: new Date().toISOString()
  });
  writeLocalStore(store);
}

export async function getAdminAuditLogs(limit = 100): Promise<AdminAuditRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query(
        `SELECT id, admin_id, action, target_type, target_id, old_value, new_value, reason, ip_address, created_at
         FROM admin_audit_logs ORDER BY id DESC LIMIT $1`,
        [limit]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows;
    } catch (err) {
      console.error("Error loading admin audit logs from Postgres:", err);
    }
  }

  const store = readLocalStore();
  return (store.admin_audit_logs || []).slice(-limit).reverse();
}

// --------------------------------------------------------------------------
// General Platform Configuration
// --------------------------------------------------------------------------

export async function getGeneralConfig(): Promise<GeneralConfigRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<GeneralConfigRecord>(
        `SELECT id, platform_name, demo_mode, default_demo_balance, currency_symbol, maintenance_mode,
                registration_enabled, signin_enabled, topup_enabled, max_demo_balance, default_language, timezone, updated_at
         FROM general_config WHERE id = 1`
      );
      if (res.rows.length > 0) {
        lastSuccessfulDbOp = new Date().toISOString();
        const r = res.rows[0];
        return {
          ...r,
          default_demo_balance: Number(r.default_demo_balance),
          max_demo_balance: Number(r.max_demo_balance)
        };
      }
    } catch (err) {
      console.error("Error loading general config from Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.general_config;
}

export async function updateGeneralConfig(data: Partial<GeneralConfigRecord>): Promise<GeneralConfigRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const current = await getGeneralConfig();
      const updated: GeneralConfigRecord = {
        ...current,
        ...data,
        updated_at: new Date().toISOString()
      };

      await pgPool.query(
        `UPDATE general_config SET
          platform_name = $1,
          demo_mode = $2,
          default_demo_balance = $3,
          currency_symbol = $4,
          maintenance_mode = $5,
          registration_enabled = $6,
          signin_enabled = $7,
          topup_enabled = $8,
          max_demo_balance = $9,
          default_language = $10,
          timezone = $11,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          updated.platform_name,
          updated.demo_mode,
          updated.default_demo_balance,
          updated.currency_symbol,
          updated.maintenance_mode,
          updated.registration_enabled,
          updated.signin_enabled,
          updated.topup_enabled,
          updated.max_demo_balance,
          updated.default_language,
          updated.timezone
        ]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return updated;
    } catch (err) {
      console.error("Error updating general config in Postgres:", err);
    }
  }

  const store = readLocalStore();
  store.general_config = {
    ...store.general_config,
    ...data,
    updated_at: new Date().toISOString()
  };
  writeLocalStore(store);
  return store.general_config;
}

// --------------------------------------------------------------------------
// Support Settings (Site Config)
// --------------------------------------------------------------------------

export async function getSiteConfig(): Promise<SiteConfigRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<SiteConfigRecord>(
        `SELECT id, telegram_url, whatsapp_url, site_name, updated_at FROM site_config WHERE id = 1`
      );
      if (res.rows.length > 0) {
        lastSuccessfulDbOp = new Date().toISOString();
        return res.rows[0];
      }
    } catch (err) {
      console.error("Error loading site_config from Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.site_config;
}

export async function updateSiteConfig(telegramUrl?: string, whatsappUrl?: string): Promise<SiteConfigRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const current = await getSiteConfig();
      const newTelegram = telegramUrl !== undefined ? telegramUrl : current.telegram_url;
      const newWhatsapp = whatsappUrl !== undefined ? whatsappUrl : current.whatsapp_url;

      const res = await pgPool.query<SiteConfigRecord>(
        `UPDATE site_config
         SET telegram_url = $1, whatsapp_url = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = 1
         RETURNING id, telegram_url, whatsapp_url, site_name, updated_at`,
        [newTelegram, newWhatsapp]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows[0];
    } catch (err) {
      console.error("Error updating site_config in Postgres:", err);
    }
  }

  const store = readLocalStore();
  if (telegramUrl !== undefined) store.site_config.telegram_url = telegramUrl;
  if (whatsappUrl !== undefined) store.site_config.whatsapp_url = whatsappUrl;
  store.site_config.updated_at = new Date().toISOString();
  writeLocalStore(store);
  return store.site_config;
}

// --------------------------------------------------------------------------
// Promotions CRUD
// --------------------------------------------------------------------------

export async function getPromotions(onlyActive = false): Promise<PromotionRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const query = onlyActive
        ? `SELECT * FROM promotions WHERE is_active = TRUE ORDER BY display_order ASC, id ASC`
        : `SELECT * FROM promotions ORDER BY display_order ASC, id ASC`;
      const res = await pgPool.query<PromotionRecord>(query);
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows;
    } catch (err) {
      console.error("Error loading promotions from Postgres:", err);
    }
  }

  const store = readLocalStore();
  const list = store.promotions || [];
  return onlyActive ? list.filter(p => p.is_active) : list;
}

export async function createPromotion(promo: Omit<PromotionRecord, "id" | "created_at" | "updated_at">): Promise<PromotionRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<PromotionRecord>(
        `INSERT INTO promotions (title, short_desc, long_desc, banner_image, cta_text, start_date, end_date, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          promo.title,
          promo.short_desc,
          promo.long_desc,
          promo.banner_image,
          promo.cta_text || "EXPLORE",
          promo.start_date || null,
          promo.end_date || null,
          promo.display_order || 0,
          promo.is_active !== undefined ? promo.is_active : true
        ]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows[0];
    } catch (err) {
      console.error("Error creating promotion in Postgres:", err);
    }
  }

  const store = readLocalStore();
  if (!store.promotions) store.promotions = [];
  const newId = store.promotions.length > 0 ? Math.max(...store.promotions.map(p => p.id)) + 1 : 1;
  const newPromo: PromotionRecord = {
    id: newId,
    ...promo,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  store.promotions.push(newPromo);
  writeLocalStore(store);
  return newPromo;
}

export async function updatePromotion(id: number, promo: Partial<PromotionRecord>): Promise<PromotionRecord | null> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const existing = await pgPool.query(`SELECT * FROM promotions WHERE id = $1`, [id]);
      if (existing.rows.length === 0) return null;
      const cur = existing.rows[0];

      const res = await pgPool.query<PromotionRecord>(
        `UPDATE promotions SET
          title = $1, short_desc = $2, long_desc = $3, banner_image = $4,
          cta_text = $5, start_date = $6, end_date = $7, display_order = $8,
          is_active = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10 RETURNING *`,
        [
          promo.title !== undefined ? promo.title : cur.title,
          promo.short_desc !== undefined ? promo.short_desc : cur.short_desc,
          promo.long_desc !== undefined ? promo.long_desc : cur.long_desc,
          promo.banner_image !== undefined ? promo.banner_image : cur.banner_image,
          promo.cta_text !== undefined ? promo.cta_text : cur.cta_text,
          promo.start_date !== undefined ? promo.start_date : cur.start_date,
          promo.end_date !== undefined ? promo.end_date : cur.end_date,
          promo.display_order !== undefined ? promo.display_order : cur.display_order,
          promo.is_active !== undefined ? promo.is_active : cur.is_active,
          id
        ]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows[0];
    } catch (err) {
      console.error("Error updating promotion in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const p = store.promotions?.find(x => x.id === id);
  if (!p) return null;
  Object.assign(p, promo, { updated_at: new Date().toISOString() });
  writeLocalStore(store);
  return p;
}

export async function deletePromotion(id: number): Promise<boolean> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query(`DELETE FROM promotions WHERE id = $1`, [id]);
      lastSuccessfulDbOp = new Date().toISOString();
      return (res.rowCount || 0) > 0;
    } catch (err) {
      console.error("Error deleting promotion from Postgres:", err);
    }
  }

  const store = readLocalStore();
  const initLen = store.promotions?.length || 0;
  store.promotions = (store.promotions || []).filter(p => p.id !== id);
  writeLocalStore(store);
  return (store.promotions.length < initLen);
}

// --------------------------------------------------------------------------
// VIP Management CRUD
// --------------------------------------------------------------------------

export async function getVipTiers(onlyActive = false): Promise<VipTierRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const query = onlyActive
        ? `SELECT * FROM vip_tiers WHERE is_active = TRUE ORDER BY display_order ASC, id ASC`
        : `SELECT * FROM vip_tiers ORDER BY display_order ASC, id ASC`;
      const res = await pgPool.query(query);
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows.map(r => ({
        ...r,
        min_activity: Number(r.min_activity),
        demo_bonus: Number(r.demo_bonus),
        benefits: typeof r.benefits === "string" ? JSON.parse(r.benefits) : r.benefits
      }));
    } catch (err) {
      console.error("Error loading VIP tiers from Postgres:", err);
    }
  }

  const store = readLocalStore();
  const list = store.vip_tiers || [];
  return onlyActive ? list.filter(v => v.is_active) : list;
}

export async function createVipTier(tier: Omit<VipTierRecord, "id" | "updated_at">): Promise<VipTierRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query(
        `INSERT INTO vip_tiers (name, badge, min_activity, demo_bonus, benefits, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          tier.name,
          tier.badge,
          tier.min_activity,
          tier.demo_bonus,
          JSON.stringify(tier.benefits || []),
          tier.display_order || 0,
          tier.is_active !== undefined ? tier.is_active : true
        ]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      const r = res.rows[0];
      return {
        ...r,
        min_activity: Number(r.min_activity),
        demo_bonus: Number(r.demo_bonus),
        benefits: typeof r.benefits === "string" ? JSON.parse(r.benefits) : r.benefits
      };
    } catch (err) {
      console.error("Error creating VIP tier in Postgres:", err);
    }
  }

  const store = readLocalStore();
  if (!store.vip_tiers) store.vip_tiers = [];
  const newId = store.vip_tiers.length > 0 ? Math.max(...store.vip_tiers.map(v => v.id)) + 1 : 1;
  const newTier: VipTierRecord = {
    id: newId,
    ...tier,
    updated_at: new Date().toISOString()
  };
  store.vip_tiers.push(newTier);
  writeLocalStore(store);
  return newTier;
}

export async function updateVipTier(id: number, tier: Partial<VipTierRecord>): Promise<VipTierRecord | null> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const existing = await pgPool.query(`SELECT * FROM vip_tiers WHERE id = $1`, [id]);
      if (existing.rows.length === 0) return null;
      const cur = existing.rows[0];

      const res = await pgPool.query(
        `UPDATE vip_tiers SET
          name = $1, badge = $2, min_activity = $3, demo_bonus = $4,
          benefits = $5, display_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [
          tier.name !== undefined ? tier.name : cur.name,
          tier.badge !== undefined ? tier.badge : cur.badge,
          tier.min_activity !== undefined ? tier.min_activity : cur.min_activity,
          tier.demo_bonus !== undefined ? tier.demo_bonus : cur.demo_bonus,
          tier.benefits !== undefined ? JSON.stringify(tier.benefits) : cur.benefits,
          tier.display_order !== undefined ? tier.display_order : cur.display_order,
          tier.is_active !== undefined ? tier.is_active : cur.is_active,
          id
        ]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      const r = res.rows[0];
      return {
        ...r,
        min_activity: Number(r.min_activity),
        demo_bonus: Number(r.demo_bonus),
        benefits: typeof r.benefits === "string" ? JSON.parse(r.benefits) : r.benefits
      };
    } catch (err) {
      console.error("Error updating VIP tier in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const v = store.vip_tiers?.find(x => x.id === id);
  if (!v) return null;
  Object.assign(v, tier, { updated_at: new Date().toISOString() });
  writeLocalStore(store);
  return v;
}

export async function deleteVipTier(id: number): Promise<boolean> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query(`DELETE FROM vip_tiers WHERE id = $1`, [id]);
      lastSuccessfulDbOp = new Date().toISOString();
      return (res.rowCount || 0) > 0;
    } catch (err) {
      console.error("Error deleting VIP tier from Postgres:", err);
    }
  }

  const store = readLocalStore();
  const initLen = store.vip_tiers?.length || 0;
  store.vip_tiers = (store.vip_tiers || []).filter(v => v.id !== id);
  writeLocalStore(store);
  return (store.vip_tiers.length < initLen);
}

// --------------------------------------------------------------------------
// Bonus Settings CRUD
// --------------------------------------------------------------------------

export async function getBonusSettings(): Promise<BonusSettingsRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query(`SELECT * FROM bonus_settings WHERE id = 1`);
      if (res.rows.length > 0) {
        lastSuccessfulDbOp = new Date().toISOString();
        const r = res.rows[0];
        return {
          ...r,
          daily_faucet_amount: Number(r.daily_faucet_amount),
          max_balance: Number(r.max_balance),
          bonus_multiplier: Number(r.bonus_multiplier),
          topup_options: typeof r.topup_options === "string" ? JSON.parse(r.topup_options) : r.topup_options
        };
      }
    } catch (err) {
      console.error("Error loading bonus settings from Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.bonus_settings;
}

export async function updateBonusSettings(data: Partial<BonusSettingsRecord>): Promise<BonusSettingsRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const cur = await getBonusSettings();
      const updated = { ...cur, ...data, updated_at: new Date().toISOString() };

      await pgPool.query(
        `UPDATE bonus_settings SET
          daily_faucet_amount = $1,
          faucet_cooldown_hours = $2,
          topup_options = $3,
          max_balance = $4,
          bonus_multiplier = $5,
          is_active = $6,
          reset_rules = $7,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          updated.daily_faucet_amount,
          updated.faucet_cooldown_hours,
          JSON.stringify(updated.topup_options),
          updated.max_balance,
          updated.bonus_multiplier,
          updated.is_active,
          updated.reset_rules
        ]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return updated;
    } catch (err) {
      console.error("Error updating bonus settings in Postgres:", err);
    }
  }

  const store = readLocalStore();
  store.bonus_settings = { ...store.bonus_settings, ...data, updated_at: new Date().toISOString() };
  writeLocalStore(store);
  return store.bonus_settings;
}

// --------------------------------------------------------------------------
// Game Configurations
// --------------------------------------------------------------------------

export async function getGameConfigs(): Promise<GameConfigRecord[]> {
  await initializeDatabase();

  let rows: GameConfigRecord[] = [];
  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<GameConfigRecord>(
        `SELECT * FROM game_configs ORDER BY display_order ASC, id ASC`
      );
      lastSuccessfulDbOp = new Date().toISOString();
      rows = res.rows;
    } catch (err) {
      console.error("Error loading game configs from Postgres:", err);
    }
  }

  if (rows.length === 0) {
    const store = readLocalStore();
    rows = store.game_configs || getDefaultGameConfigs();
  }

  return rows.map(r => ({
    ...r,
    is_enabled: r.is_enabled !== undefined ? r.is_enabled : r.is_active
  }));
}

export async function getGameConfigById(gameId: string): Promise<GameConfigRecord | null> {
  await initializeDatabase();
  const normalizedId = gameId.toLowerCase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<GameConfigRecord>(
        `SELECT * FROM game_configs WHERE LOWER(game_id) = $1`,
        [normalizedId]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          ...row,
          is_enabled: row.is_enabled !== undefined ? row.is_enabled : row.is_active
        };
      }
    } catch (err) {
      console.error("Error loading game config by ID from Postgres:", err);
    }
  }

  const store = readLocalStore();
  const g = store.game_configs?.find(x => x.game_id.toLowerCase() === normalizedId);
  if (g) {
    return {
      ...g,
      is_enabled: g.is_enabled !== undefined ? g.is_enabled : g.is_active
    };
  }

  const def = getDefaultGameConfigs().find(x => x.game_id.toLowerCase() === normalizedId);
  if (def) {
    return {
      ...def,
      is_enabled: def.is_enabled !== undefined ? def.is_enabled : def.is_active
    };
  }

  return null;
}

export async function updateGameConfig(
  gameId: string,
  data: Partial<GameConfigRecord> & { is_enabled?: boolean; min_bet?: number; max_bet?: number; rtp_percentage?: number; maintenance_message?: string }
): Promise<GameConfigRecord | null> {
  await initializeDatabase();
  const normalizedId = gameId.toLowerCase();

  const isActive = data.is_active !== undefined
    ? data.is_active
    : data.is_enabled !== undefined
      ? data.is_enabled
      : undefined;

  const trimmedLaunchUrl = data.launch_url !== undefined ? data.launch_url.trim() : undefined;

  if (isPgConnected && pgPool) {
    try {
      const existing = await pgPool.query(`SELECT * FROM game_configs WHERE LOWER(game_id) = $1`, [normalizedId]);
      if (existing.rows.length === 0) return null;
      const cur = existing.rows[0];

      const res = await pgPool.query<GameConfigRecord>(
        `UPDATE game_configs SET
          name = $1,
          provider = $2,
          category = $3,
          image_url = $4,
          launch_url = $5,
          is_active = $6,
          display_order = $7,
          updated_at = CURRENT_TIMESTAMP
         WHERE LOWER(game_id) = $8 RETURNING *`,
        [
          data.name !== undefined ? data.name : cur.name,
          data.provider !== undefined ? data.provider : cur.provider,
          data.category !== undefined ? data.category : cur.category,
          data.image_url !== undefined ? data.image_url : cur.image_url,
          trimmedLaunchUrl !== undefined ? trimmedLaunchUrl : cur.launch_url,
          isActive !== undefined ? isActive : cur.is_active,
          data.display_order !== undefined ? data.display_order : cur.display_order,
          normalizedId
        ]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      const updatedRow = {
        ...res.rows[0],
        is_enabled: res.rows[0].is_active,
        min_bet: data.min_bet ?? cur.min_bet,
        max_bet: data.max_bet ?? cur.max_bet,
        rtp_percentage: data.rtp_percentage ?? cur.rtp_percentage,
        maintenance_message: data.maintenance_message ?? cur.maintenance_message
      };
      return updatedRow;
    } catch (err) {
      console.error("Error updating game config in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const g = store.game_configs?.find(x => x.game_id.toLowerCase() === normalizedId);
  if (!g) return null;

  if (trimmedLaunchUrl !== undefined) {
    g.launch_url = trimmedLaunchUrl;
  }
  if (isActive !== undefined) {
    g.is_active = isActive;
    g.is_enabled = isActive;
  }
  Object.assign(g, data, {
    launch_url: trimmedLaunchUrl !== undefined ? trimmedLaunchUrl : g.launch_url,
    is_active: isActive !== undefined ? isActive : g.is_active,
    is_enabled: isActive !== undefined ? isActive : (g.is_enabled ?? g.is_active),
    updated_at: new Date().toISOString()
  });
  writeLocalStore(store);
  return g;
}

// --------------------------------------------------------------------------
// Live Activity
// --------------------------------------------------------------------------

export async function getAllDummyActivity(limit = 100): Promise<DummyActivityRecord[]> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<DummyActivityRecord>(
        `SELECT id, username, game, payout_amount, multiplier, created_at
         FROM dummy_activity ORDER BY id DESC LIMIT $1`,
        [limit]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return res.rows.map(r => ({
        ...r,
        payout_amount: Number(r.payout_amount),
        multiplier: Number(r.multiplier)
      }));
    } catch (err) {
      console.error("Error querying dummy_activity in Postgres:", err);
    }
  }

  const store = readLocalStore();
  return store.dummy_activity.slice(0, limit);
}

export async function getRecentActivity(limit = 20): Promise<DummyActivityRecord[]> {
  return getAllDummyActivity(limit);
}

export async function addDummyActivity(record: Omit<DummyActivityRecord, "id" | "created_at">): Promise<DummyActivityRecord> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<DummyActivityRecord>(
        `INSERT INTO dummy_activity (username, game, payout_amount, multiplier, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING id, username, game, payout_amount, multiplier, created_at`,
        [record.username, record.game, record.payout_amount, record.multiplier]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return {
        ...res.rows[0],
        payout_amount: Number(res.rows[0].payout_amount),
        multiplier: Number(res.rows[0].multiplier)
      };
    } catch (err) {
      console.error("Error adding dummy_activity in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const newId = store.dummy_activity.length > 0 ? Math.max(...store.dummy_activity.map(a => a.id || 0)) + 1 : 1;
  const newRecord: DummyActivityRecord = {
    id: newId,
    ...record,
    created_at: new Date().toISOString()
  };
  store.dummy_activity.unshift(newRecord);
  if (store.dummy_activity.length > 200) {
    store.dummy_activity = store.dummy_activity.slice(0, 200);
  }
  writeLocalStore(store);
  return newRecord;
}

export async function resetDummyActivity(): Promise<boolean> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      await pgPool.query(`DELETE FROM dummy_activity`);
      const fresh = generateInitialDummyActivity();
      for (const act of fresh) {
        await pgPool.query(
          `INSERT INTO dummy_activity (username, game, payout_amount, multiplier, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [act.username, act.game, act.payout_amount, act.multiplier, act.created_at]
        );
      }
      lastSuccessfulDbOp = new Date().toISOString();
      return true;
    } catch (err) {
      console.error("Error resetting dummy_activity in Postgres:", err);
    }
  }

  const store = readLocalStore();
  store.dummy_activity = generateInitialDummyActivity();
  writeLocalStore(store);
  return true;
}

// --------------------------------------------------------------------------
// Admin Authentication & Session Management
// --------------------------------------------------------------------------

export async function findAdminByAdminId(adminId: string): Promise<AdminUserRecord | null> {
  await initializeDatabase();
  const cleanId = adminId.trim();

  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query<AdminUserRecord>(
        `SELECT id, admin_id, password_hash, created_at, updated_at, is_active, session_version
         FROM admin_users
         WHERE admin_id = $1 AND is_active = TRUE`,
        [cleanId]
      );
      if (res.rows.length > 0) {
        lastSuccessfulDbOp = new Date().toISOString();
        return res.rows[0];
      }
      return null;
    } catch (err) {
      console.error("Error querying admin_users in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const admin = store.admin_users?.find(a => a.admin_id === cleanId && a.is_active);
  return admin || null;
}

export async function revokeAdminSession(adminId: string): Promise<boolean> {
  await initializeDatabase();
  const cleanId = adminId.trim();

  if (isPgConnected && pgPool) {
    try {
      await pgPool.query(
        `UPDATE admin_users
         SET session_version = COALESCE(session_version, 1) + 1, updated_at = CURRENT_TIMESTAMP
         WHERE admin_id = $1`,
        [cleanId]
      );
      lastSuccessfulDbOp = new Date().toISOString();
      return true;
    } catch (err) {
      console.error("Error revoking admin session in Postgres:", err);
    }
  }

  const store = readLocalStore();
  const admin = store.admin_users?.find(a => a.admin_id === cleanId);
  if (admin) {
    admin.session_version = (admin.session_version || 1) + 1;
    admin.updated_at = new Date().toISOString();
    writeLocalStore(store);
    return true;
  }
  return false;
}

// --------------------------------------------------------------------------
// System Health & Diagnostics Telemetry
// --------------------------------------------------------------------------

export async function getDatabaseHealth(): Promise<{
  isConnected: boolean;
  engine: "PostgreSQL" | "Local JSON Fallback";
  totalUsers: number;
  totalActivity: number;
}> {
  await initializeDatabase();

  if (isPgConnected && pgPool) {
    try {
      const userCountRes = await pgPool.query(`SELECT COUNT(*) as count FROM users`);
      const activityCountRes = await pgPool.query(`SELECT COUNT(*) as count FROM dummy_activity`);
      return {
        isConnected: true,
        engine: "PostgreSQL",
        totalUsers: parseInt(userCountRes.rows[0].count, 10),
        totalActivity: parseInt(activityCountRes.rows[0].count, 10)
      };
    } catch (err) {
      console.error("Database health query failed on Postgres:", err);
    }
  }

  const store = readLocalStore();
  return {
    isConnected: true,
    engine: "Local JSON Fallback",
    totalUsers: store.users?.length || 0,
    totalActivity: store.dummy_activity?.length || 0
  };
}

export async function getDetailedSystemStats(): Promise<{
  engine: string;
  isDbConnected: boolean;
  totalUsers: number;
  activeUsers: number;
  totalAllocatedDemoBalance: number;
  totalSimulatedPayouts: number;
  totalActivityRecords: number;
  configuredGames: number;
  supportChannelsConfigured: boolean;
  lastSuccessfulDbOp: string;
  environment: string;
  systemVersion: string;
}> {
  await initializeDatabase();

  let totalUsers = 0;
  let activeUsers = 0;
  let totalBalance = 0;
  let totalActivity = 0;
  let totalPayouts = 0;

  if (isPgConnected && pgPool) {
    try {
      const uRes = await pgPool.query(`SELECT COUNT(*) as cnt, COALESCE(SUM(balance), 0) as total_bal, COUNT(*) FILTER (WHERE is_active = TRUE) as act_cnt FROM users`);
      const aRes = await pgPool.query(`SELECT COUNT(*) as cnt, COALESCE(SUM(payout_amount), 0) as total_pay FROM dummy_activity`);
      totalUsers = parseInt(uRes.rows[0].cnt, 10);
      totalBalance = parseFloat(uRes.rows[0].total_bal);
      activeUsers = parseInt(uRes.rows[0].act_cnt, 10);
      totalActivity = parseInt(aRes.rows[0].cnt, 10);
      totalPayouts = parseFloat(aRes.rows[0].total_pay);
    } catch (err) {
      console.error("Error reading system stats from Postgres:", err);
    }
  } else {
    const store = readLocalStore();
    totalUsers = store.users?.length || 0;
    activeUsers = store.users?.filter(u => u.is_active)?.length || 0;
    totalBalance = (store.users || []).reduce((acc, u) => acc + Number(u.balance || 0), 0);
    totalActivity = store.dummy_activity?.length || 0;
    totalPayouts = (store.dummy_activity || []).reduce((acc, a) => acc + Number(a.payout_amount || 0), 0);
  }

  const siteConfig = await getSiteConfig();
  const supportOk = Boolean(siteConfig.telegram_url && siteConfig.whatsapp_url);
  const games = await getGameConfigs();
  const configuredGames = games.filter(g => g.launch_url && g.launch_url.trim() !== "").length;

  return {
    engine: isPgConnected ? "PostgreSQL" : "Local JSON Fallback",
    isDbConnected: isPgConnected,
    totalUsers,
    activeUsers,
    totalAllocatedDemoBalance: parseFloat(totalBalance.toFixed(2)),
    totalSimulatedPayouts: parseFloat(totalPayouts.toFixed(2)),
    totalActivityRecords: totalActivity,
    configuredGames,
    supportChannelsConfigured: supportOk,
    lastSuccessfulDbOp,
    environment: process.env.NODE_ENV || "development",
    systemVersion: "v2.5.0-PROD"
  };
}
