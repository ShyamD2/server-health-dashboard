import { useEffect, useRef, useState } from "react";
import { useMetricsSocket } from "./hooks/useMetricsSocket";
import { StatusBar } from "./components/StatusBar";
import { ScopeTrace } from "./components/ScopeTrace";
import { MetricRing } from "./components/MetricRing";
import { CoreGrid } from "./components/CoreGrid";
import { DiskPanel } from "./components/DiskPanel";
import { NetworkPanel } from "./components/NetworkPanel";
import { ProcessTable } from "./components/ProcessTable";
import { statusForPercent, formatBytes } from "./lib/format";
import type { SystemInfo } from "./types";

const HISTORY_CAP = 90;

export default function App() {
  const { metrics, state } = useMetricsSocket();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const cpuHistory = useRef<number[]>([]);
  const memHistory = useRef<number[]>([]);
  const prevNet = useRef<{ t: number; sent: number; recv: number } | null>(null);
  const [rates, setRates] = useState({ sent: 0, recv: 0 });
  const [, forceTick] = useState(0);

  useEffect(() => {
    fetch("/api/system-info")
      .then((r) => r.json())
      .then(setSystemInfo)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!metrics) return;

    cpuHistory.current = [...cpuHistory.current, metrics.cpu.total].slice(-HISTORY_CAP);
    memHistory.current = [...memHistory.current, metrics.memory.percent].slice(-HISTORY_CAP);

    const now = metrics.timestamp;
    if (prevNet.current) {
      const dt = Math.max(0.5, now - prevNet.current.t);
      setRates({
        sent: Math.max(0, (metrics.network.bytesSent - prevNet.current.sent) / dt),
        recv: Math.max(0, (metrics.network.bytesRecv - prevNet.current.recv) / dt),
      });
    }
    prevNet.current = { t: now, sent: metrics.network.bytesSent, recv: metrics.network.bytesRecv };

    forceTick((n) => n + 1);
  }, [metrics]);

  const cpuPct = metrics?.cpu.total ?? 0;
  const memPct = metrics?.memory.percent ?? 0;
  const worstDisk = metrics?.disks.reduce(
    (max, d) => (d.percent > max ? d.percent : max),
    0
  ) ?? 0;

  const overall = statusForPercent(Math.max(cpuPct, memPct, worstDisk));

  return (
    <div className="console">
      <StatusBar
        info={systemInfo}
        uptimeSeconds={metrics?.uptimeSeconds ?? 0}
        connection={state}
        overallStatus={overall}
      />

      <section className="scope-panel">
        <ScopeTrace
          history={cpuHistory.current}
          label="CPU / total"
          value={cpuPct}
          accent="var(--accent-cyan)"
        />
      </section>

      <div className="grid">
        <section className="panel panel--rings">
          <h2 className="panel__title">Utilization</h2>
          <div className="panel__rings-row">
            <MetricRing label="CPU" percent={cpuPct} />
            <MetricRing
              label="Memory"
              percent={memPct}
              sublabel={metrics ? formatBytes(metrics.memory.used) : undefined}
            />
            <MetricRing
              label="Swap"
              percent={metrics?.swap.percent ?? 0}
              sublabel={metrics ? formatBytes(metrics.swap.used) : undefined}
            />
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">Cores</h2>
          <CoreGrid cores={metrics?.cpu.perCore ?? []} />
        </section>

        <section className="panel">
          <h2 className="panel__title">Memory trace</h2>
          <ScopeTrace
            history={memHistory.current}
            label="Memory / used"
            value={memPct}
            accent="var(--accent-amber)"
            height={110}
          />
        </section>

        <section className="panel">
          <h2 className="panel__title">Volumes</h2>
          <DiskPanel disks={metrics?.disks ?? []} />
        </section>

        <section className="panel">
          <h2 className="panel__title">Network</h2>
          <NetworkPanel
            bytesSent={metrics?.network.bytesSent ?? 0}
            bytesRecv={metrics?.network.bytesRecv ?? 0}
            rateSent={rates.sent}
            rateRecv={rates.recv}
          />
        </section>

        <section className="panel panel--wide">
          <h2 className="panel__title">Top processes</h2>
          <ProcessTable processes={metrics?.processes ?? []} />
        </section>
      </div>

      <footer className="console__footer">
        server-health console &middot; sampling every 1.5s over websocket &middot;{" "}
        {metrics ? new Date(metrics.timestamp * 1000).toLocaleTimeString() : "\u2014"}
      </footer>
    </div>
  );
}
