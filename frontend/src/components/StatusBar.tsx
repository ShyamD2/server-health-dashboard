import type { ConnectionState, SystemInfo } from "../types";
import { formatUptime } from "../lib/format";

interface StatusBarProps {
  info: SystemInfo | null;
  uptimeSeconds: number;
  connection: ConnectionState;
  overallStatus: "ok" | "warn" | "critical";
}

const STATUS_TEXT: Record<string, string> = {
  ok: "NOMINAL",
  warn: "ELEVATED",
  critical: "CRITICAL",
};

const CONN_TEXT: Record<ConnectionState, string> = {
  connecting: "CONNECTING",
  open: "LIVE",
  closed: "RECONNECTING",
  error: "LINK ERROR",
};

export function StatusBar({ info, uptimeSeconds, connection, overallStatus }: StatusBarProps) {
  return (
    <header className="status-bar">
      <div className="status-bar__identity">
        <div className={`status-bar__dot status-bar__dot--${overallStatus}`} />
        <div>
          <div className="status-bar__hostname">{info?.hostname ?? "\u2014"}</div>
          <div className="status-bar__os">
            {info?.os ?? "resolving host\u2026"} {info ? `\u00b7 ${info.arch}` : ""}
          </div>
        </div>
      </div>

      <div className="status-bar__mid">
        <div className="status-bar__stat">
          <span className="status-bar__stat-label">Status</span>
          <span className={`status-bar__stat-value status-bar__stat-value--${overallStatus}`}>
            {STATUS_TEXT[overallStatus]}
          </span>
        </div>
        <div className="status-bar__stat">
          <span className="status-bar__stat-label">Uptime</span>
          <span className="status-bar__stat-value">{formatUptime(uptimeSeconds)}</span>
        </div>
        <div className="status-bar__stat">
          <span className="status-bar__stat-label">Cores</span>
          <span className="status-bar__stat-value">
            {info ? `${info.cpuCores}c / ${info.cpuThreads}t` : "\u2014"}
          </span>
        </div>
        <div className="status-bar__stat">
          <span className="status-bar__stat-label">Load avg</span>
          <span className="status-bar__stat-value">
            {info?.loadAvg?.["1m"] != null
              ? `${info.loadAvg["1m"].toFixed(2)} ${info.loadAvg["5m"]?.toFixed(2)} ${info.loadAvg["15m"]?.toFixed(2)}`
              : "n/a"}
          </span>
        </div>
      </div>

      <div className={`status-bar__conn status-bar__conn--${connection}`}>
        <span className="status-bar__conn-dot" />
        {CONN_TEXT[connection]}
      </div>
    </header>
  );
}
