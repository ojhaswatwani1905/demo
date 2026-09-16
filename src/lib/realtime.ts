import { EventEmitter } from "events";

export type RealtimeEventType =
  | "USER_BALANCE_UPDATED"
  | "USER_STATUS_UPDATED"
  | "PROMOTION_UPDATED"
  | "VIP_UPDATED"
  | "VIP_TIER_UPDATED"
  | "BONUS_UPDATED"
  | "SUPPORT_UPDATED"
  | "GENERAL_CONFIG_UPDATED"
  | "CONFIG_UPDATED"
  | "GAME_CONFIG_UPDATED"
  | "ACTIVITY_UPDATED"
  | "ACTIVITY_RECORDED"
  | "ACTIVITY_RESET";

export interface RealtimeMessage {
  type: RealtimeEventType;
  payload: any;
  timestamp: string;
}

// Maintain a global singleton EventEmitter across Next.js reloads
declare global {
  // eslint-disable-next-line no-var
  var __betadrix_realtime_emitter: EventEmitter | undefined;
  // eslint-disable-next-line no-var
  var __betadrix_active_sse_connections: number | undefined;
}

function getEmitter(): EventEmitter {
  if (!global.__betadrix_realtime_emitter) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(1000);
    global.__betadrix_realtime_emitter = emitter;
  }
  return global.__betadrix_realtime_emitter;
}

export function publishRealtimeEvent(type: RealtimeEventType, payload: any): void {
  const emitter = getEmitter();
  const message: RealtimeMessage = {
    type,
    payload,
    timestamp: new Date().toISOString()
  };
  emitter.emit("broadcast", message);
}

export function subscribeRealtimeEvents(callback: (message: RealtimeMessage) => void): () => void {
  const emitter = getEmitter();
  emitter.on("broadcast", callback);

  if (typeof global.__betadrix_active_sse_connections !== "number") {
    global.__betadrix_active_sse_connections = 0;
  }
  global.__betadrix_active_sse_connections++;

  return () => {
    emitter.off("broadcast", callback);
    if (global.__betadrix_active_sse_connections && global.__betadrix_active_sse_connections > 0) {
      global.__betadrix_active_sse_connections--;
    }
  };
}

export function getRealtimeConnectionCount(): number {
  return global.__betadrix_active_sse_connections || 0;
}
