import {
  getEconomicsConfigFromDb,
  updateEconomicsConfigInDb,
  getEconomicsConfigHistoryFromDb,
} from "./db";

export interface GameEconomicsConfig {
  enabled: boolean;
  useGlobal: boolean;
  houseEdge: number;
}

export interface EconomicsGamesConfig {
  trader: GameEconomicsConfig;
  roulette: GameEconomicsConfig;
  plinko: GameEconomicsConfig;
  mines: GameEconomicsConfig;
  dice: GameEconomicsConfig;
  [key: string]: GameEconomicsConfig;
}

export interface EconomicsConfig {
  version: number;
  globalHouseEdge: number;
  games: EconomicsGamesConfig;
  updatedAt: string;
  updatedBy: string;
}

export interface EconomicsConfigHistoryEntry {
  id?: number;
  version: number;
  globalHouseEdge: number;
  games: EconomicsGamesConfig;
  updatedAt: string;
  updatedBy: string;
}

export const SUPPORTED_GAME_IDS = [
  "trader",
  "roulette",
  "plinko",
  "mines",
  "dice"
] as const;

export type SupportedGameId = (typeof SUPPORTED_GAME_IDS)[number];

export const DEFAULT_ECONOMICS_CONFIG: EconomicsConfig = {
  version: 1,
  globalHouseEdge: 5.00,
  games: {
    trader: {
      enabled: true,
      useGlobal: false,
      houseEdge: 4.00,
    },
    roulette: {
      enabled: true,
      useGlobal: false,
      houseEdge: 5.26,
    },
    plinko: {
      enabled: true,
      useGlobal: false,
      houseEdge: 6.00,
    },
    mines: {
      enabled: true,
      useGlobal: true,
      houseEdge: 5.00,
    },
    dice: {
      enabled: true,
      useGlobal: false,
      houseEdge: 3.00,
    },
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "system",
};

export interface HouseEdgeValidationResult {
  valid: boolean;
  normalized?: number;
  error?: string;
}

/**
 * Validates that house edge is a finite numeric value between 0.00% and 50.00%.
 * Rejects negative numbers, NaN, Infinity, strings, booleans, and null/undefined.
 * Normalizes valid numbers to 2 decimal places.
 */
export function validateHouseEdge(val: any): HouseEdgeValidationResult {
  if (typeof val !== "number") {
    return { valid: false, error: "House edge must be a numeric value." };
  }
  if (Number.isNaN(val)) {
    return { valid: false, error: "House edge cannot be NaN." };
  }
  if (!Number.isFinite(val)) {
    return { valid: false, error: "House edge cannot be Infinity." };
  }
  if (val < 0 || val > 50) {
    return { valid: false, error: "House edge must be within safe range [0, 50]." };
  }

  // Normalize to 2 decimal places
  const normalized = Math.round(val * 100) / 100;
  return { valid: true, normalized };
}

export interface EconomicsValidationResult {
  valid: boolean;
  data?: {
    globalHouseEdge: number;
    games: EconomicsGamesConfig;
  };
  error?: string;
}

/**
 * Validates the full economics configuration payload.
 * Verifies globalHouseEdge and each configured game (trader, roulette, plinko, mines, dice).
 */
export function validateEconomicsConfig(input: any): EconomicsValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, error: "Configuration payload must be an object." };
  }

  const globalResult = validateHouseEdge(input.globalHouseEdge);
  if (!globalResult.valid) {
    return { valid: false, error: `Invalid globalHouseEdge: ${globalResult.error}` };
  }

  if (!input.games || typeof input.games !== "object" || Array.isArray(input.games)) {
    return { valid: false, error: "Configuration must include a 'games' object." };
  }

  const normalizedGames: Record<string, GameEconomicsConfig> = {};

  for (const gameId of SUPPORTED_GAME_IDS) {
    const gameConfig = input.games[gameId];
    if (!gameConfig || typeof gameConfig !== "object" || Array.isArray(gameConfig)) {
      return { valid: false, error: `Missing configuration object for game '${gameId}'.` };
    }

    if (typeof gameConfig.enabled !== "boolean") {
      return { valid: false, error: `Game '${gameId}' must have a boolean 'enabled' property.` };
    }

    if (typeof gameConfig.useGlobal !== "boolean") {
      return { valid: false, error: `Game '${gameId}' must have a boolean 'useGlobal' property.` };
    }

    const edgeResult = validateHouseEdge(gameConfig.houseEdge);
    if (!edgeResult.valid) {
      return { valid: false, error: `Invalid houseEdge for '${gameId}': ${edgeResult.error}` };
    }

    normalizedGames[gameId] = {
      enabled: gameConfig.enabled,
      useGlobal: gameConfig.useGlobal,
      houseEdge: edgeResult.normalized!,
    };
  }

  // Also retain any other games present in the payload if valid
  for (const [key, val] of Object.entries(input.games)) {
    const lowerKey = key.toLowerCase().trim();
    if (!normalizedGames[lowerKey] && val && typeof val === "object" && !Array.isArray(val)) {
      const g = val as any;
      if (typeof g.enabled === "boolean" && typeof g.useGlobal === "boolean") {
        const edge = validateHouseEdge(g.houseEdge);
        if (edge.valid) {
          normalizedGames[lowerKey] = {
            enabled: g.enabled,
            useGlobal: g.useGlobal,
            houseEdge: edge.normalized!,
          };
        }
      }
    }
  }

  return {
    valid: true,
    data: {
      globalHouseEdge: globalResult.normalized!,
      games: normalizedGames as EconomicsGamesConfig,
    },
  };
}

/**
 * Pure calculation helper for effective house edge.
 *
 * Logic:
 * if game.useGlobal === true:
 *     return globalHouseEdge
 * otherwise:
 *     return game.houseEdge
 */
export function calculateEffectiveHouseEdge(config: EconomicsConfig, gameId: string): number {
  if (!config) {
    return DEFAULT_ECONOMICS_CONFIG.globalHouseEdge;
  }

  const normalizedId = (gameId || "").toLowerCase().trim();
  const game = config.games ? config.games[normalizedId] : undefined;

  if (!game) {
    return config.globalHouseEdge;
  }

  if (game.useGlobal === true) {
    return config.globalHouseEdge;
  }

  return game.houseEdge;
}

/**
 * Central server-side accessor to obtain the effective house edge for any game.
 * If optionalConfig is supplied, calculates directly without database query.
 * Otherwise, fetches the active economics configuration from the database.
 *
 * Logic:
 * if game.useGlobal === true:
 *     return globalHouseEdge
 * otherwise:
 *     return game.houseEdge
 */
export async function getEffectiveHouseEdge(
  gameId: string,
  optionalConfig?: EconomicsConfig
): Promise<number> {
  const config = optionalConfig || (await getEconomicsConfig());
  return calculateEffectiveHouseEdge(config, gameId);
}

/**
 * Retrieves the current central economics configuration.
 */
export async function getEconomicsConfig(): Promise<EconomicsConfig> {
  return getEconomicsConfigFromDb();
}

export interface UpdateEconomicsConfigParams {
  expectedVersion?: number;
  globalHouseEdge: number;
  games: EconomicsGamesConfig;
  adminId?: string;
  reason?: string;
}

/**
 * Updates and persists the central economics configuration.
 * Enforces version concurrency check, increments version, creates history and audit log.
 */
export async function updateEconomicsConfig(
  params: UpdateEconomicsConfigParams
): Promise<EconomicsConfig> {
  return updateEconomicsConfigInDb(params);
}

/**
 * Retrieves the full audit history of economics configuration versions.
 */
export async function getEconomicsConfigHistory(
  limit = 50
): Promise<EconomicsConfigHistoryEntry[]> {
  return getEconomicsConfigHistoryFromDb(limit);
}
