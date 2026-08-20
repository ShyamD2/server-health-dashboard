import { statusForPercent } from "../lib/format";

const STATUS_COLOR: Record<string, string> = {
  ok: "var(--accent-cyan)",
  warn: "var(--accent-amber)",
  critical: "var(--accent-red)",
};

export function CoreGrid({ cores }: { cores: number[] }) {
  return (
    <div className="core-grid">
      {cores.map((pct, i) => {
        const color = STATUS_COLOR[statusForPercent(pct)];
        return (
          <div className="core-grid__item" key={i}>
            <div className="core-grid__track">
              <div
                className="core-grid__fill"
                style={{ height: `${Math.max(2, pct)}%`, background: color }}
              />
            </div>
            <span className="core-grid__idx">C{i}</span>
          </div>
        );
      })}
    </div>
  );
}
