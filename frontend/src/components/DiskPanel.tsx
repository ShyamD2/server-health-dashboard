import type { DiskInfo } from "../types";
import { formatBytes, statusForPercent } from "../lib/format";

const STATUS_COLOR: Record<string, string> = {
  ok: "var(--accent-cyan)",
  warn: "var(--accent-amber)",
  critical: "var(--accent-red)",
};

export function DiskPanel({ disks }: { disks: DiskInfo[] }) {
  if (disks.length === 0) {
    return <div className="empty-state">No mounted volumes reported.</div>;
  }
  return (
    <div className="disk-panel">
      {disks.map((d) => {
        const color = STATUS_COLOR[statusForPercent(d.percent)];
        return (
          <div className="disk-row" key={d.mountpoint}>
            <div className="disk-row__top">
              <span className="disk-row__mount">{d.mountpoint}</span>
              <span className="disk-row__figure">
                {formatBytes(d.used)} / {formatBytes(d.total)}
              </span>
            </div>
            <div className="disk-row__track">
              <div
                className="disk-row__fill"
                style={{ width: `${Math.min(100, d.percent)}%`, background: color }}
              />
            </div>
            <div className="disk-row__bottom">
              <span>{d.device}</span>
              <span>{d.fstype}</span>
              <span style={{ color }}>{d.percent.toFixed(1)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
