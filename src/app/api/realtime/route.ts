import { NextRequest } from "next/server";
import { subscribeRealtimeEvents, RealtimeMessage } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connected handshake
      const initialPayload = JSON.stringify({
        status: "connected",
        timestamp: new Date().toISOString()
      });
      controller.enqueue(encoder.encode(`event: CONNECTED\ndata: ${initialPayload}\n\n`));

      // 2. Subscribe to internal realtime event emitter
      const unsubscribe = subscribeRealtimeEvents((msg: RealtimeMessage) => {
        try {
          const dataString = JSON.stringify(msg.payload);
          controller.enqueue(encoder.encode(`event: ${msg.type}\ndata: ${dataString}\n\n`));
        } catch (err) {
          console.error("Error pushing realtime SSE message:", err);
        }
      });

      // 3. Heartbeat keepalive every 20 seconds to keep connection open through proxies
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:keepalive\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 20000);

      // 4. Clean up listener upon client disconnection
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
