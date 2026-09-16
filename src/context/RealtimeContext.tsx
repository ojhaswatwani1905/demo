"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { RealtimeEventType } from "@/lib/realtime";

interface RealtimeContextValue {
  connectionStatus: "connecting" | "connected" | "disconnected";
  isConnected: boolean;
  clientId: string;
  lastEventTime: string | null;
  subscribe: (type: RealtimeEventType, handler: (payload: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [clientId, setClientId] = useState<string>("");
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);

  const listenersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const notifyListeners = useCallback((eventType: string, payload: any) => {
    setLastEventTime(new Date().toISOString());
    const handlers = listenersRef.current.get(eventType);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`Error in realtime handler for ${eventType}:`, err);
        }
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus("connecting");
    const es = new EventSource("/api/realtime");
    eventSourceRef.current = es;

    es.addEventListener("CONNECTED", (e: MessageEvent) => {
      setConnectionStatus("connected");
      try {
        const data = JSON.parse(e.data);
        if (data && data.clientId) {
          setClientId(data.clientId);
        }
      } catch {
        setClientId(`sse-${Math.random().toString(36).substring(2, 9)}`);
      }
    });

    const eventTypes: RealtimeEventType[] = [
      "USER_BALANCE_UPDATED",
      "USER_STATUS_UPDATED",
      "PROMOTION_UPDATED",
      "VIP_UPDATED",
      "VIP_TIER_UPDATED",
      "BONUS_UPDATED",
      "SUPPORT_UPDATED",
      "GENERAL_CONFIG_UPDATED",
      "CONFIG_UPDATED",
      "GAME_CONFIG_UPDATED",
      "ACTIVITY_UPDATED",
      "ACTIVITY_RECORDED",
      "ACTIVITY_RESET"
    ];

    eventTypes.forEach((type) => {
      es.addEventListener(type, (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          notifyListeners(type, payload);
        } catch (err) {
          console.error(`Failed to parse SSE payload for ${type}:`, err);
        }
      });
    });

    es.onopen = () => {
      setConnectionStatus("connected");
    };

    es.onerror = () => {
      setConnectionStatus("disconnected");
      es.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 4000);
    };
  }, [notifyListeners]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const subscribe = useCallback((type: RealtimeEventType, handler: (payload: any) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(handler);

    return () => {
      listenersRef.current.get(type)?.delete(handler);
    };
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        connectionStatus,
        isConnected: connectionStatus === "connected",
        clientId: clientId || "sse-client",
        lastEventTime,
        subscribe
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return ctx;
}
