import { useEffect, useRef, useState } from "react";
import type { ConnectionState, LiveMetrics } from "../types";

const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/metrics`;
const RECONNECT_DELAY_MS = 2000;

export function useMetricsSocket() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [state, setState] = useState<ConnectionState>("connecting");
  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      setState("connecting");
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        if (mountedRef.current) setState("open");
      };
      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data) as LiveMetrics;
          setMetrics(data);
        } catch {
          // ignore malformed frame
        }
      };
      ws.onerror = () => {
        if (mountedRef.current) setState("error");
      };
      ws.onclose = () => {
        if (!mountedRef.current) return;
        setState("closed");
        timerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
      };
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      socketRef.current?.close();
    };
  }, []);

  return { metrics, state };
}
