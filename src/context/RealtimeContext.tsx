"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { RealtimeEventType } from "@/lib/realtime";

interface RealtimeContextValue {
  connectionStatus: "connecting" | "connected" | "disconnected";
  isConnected: boolean;
  clientId: string;
  lastEventTime: string | null;
  reconnectCount: number;
  subscribe: (type: RealtimeEventType | string, handler: (payload: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [clientId, setClientId] = useState<string>("");
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState<number>(0);

  const listenersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());
  const activeEventTypesRef = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialConnectDoneRef = useRef<boolean>(false);

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

  const registerEventListener = useCallback((es: EventSource, type: string) => {
    if (activeEventTypesRef.current.has(type)) return;
    activeEventTypesRef.current.add(type);

    es.addEventListener(type, (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        notifyListeners(type, payload);
      } catch (err) {
        console.error(`Failed to parse SSE payload for ${type}:`, err);
      }
    });
  }, [notifyListeners]);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      activeEventTypesRef.current.clear();
    }

    setConnectionStatus("connecting");
    const es = new EventSource("/api/realtime");
    eventSourceRef.current = es;

    es.addEventListener("CONNECTED", (e: MessageEvent) => {
      setConnectionStatus("connected");
      if (initialConnectDoneRef.current) {
        setReconnectCount(prev => prev + 1);
      } else {
        initialConnectDoneRef.current = true;
      }
      try {
        const data = JSON.parse(e.data);
        if (data && data.clientId) {
          setClientId(data.clientId);
        }
      } catch {
        setClientId(`sse-${Math.random().toString(36).substring(2, 9)}`);
      }
    });

    const standardEventTypes: (RealtimeEventType | string)[] = [
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
      "ACTIVITY_RESET",
      "ECONOMICS_CONFIG_UPDATED"
    ];

    standardEventTypes.forEach((type) => {
      registerEventListener(es, type);
    });

    // Also register any custom listeners already subscribed
    listenersRef.current.forEach((_, type) => {
      registerEventListener(es, type);
    });

    es.onopen = () => {
      setConnectionStatus("connected");
    };

    es.onerror = () => {
      setConnectionStatus("disconnected");
      es.close();
      activeEventTypesRef.current.clear();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [notifyListeners, registerEventListener]);

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

  const subscribe = useCallback((type: RealtimeEventType | string, handler: (payload: any) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(handler);

    // Dynamically register on active EventSource if not already registered
    if (eventSourceRef.current) {
      registerEventListener(eventSourceRef.current, type);
    }

    return () => {
      listenersRef.current.get(type)?.delete(handler);
    };
  }, [registerEventListener]);

  return (
    <RealtimeContext.Provider
      value={{
        connectionStatus,
        isConnected: connectionStatus === "connected",
        clientId: clientId || "sse-client",
        lastEventTime,
        reconnectCount,
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
