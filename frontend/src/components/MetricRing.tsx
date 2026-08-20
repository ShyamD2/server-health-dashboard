import { statusForPercent } from "../lib/format";

interface MetricRingProps {
  label: string;
  percent: number;
  sublabel?: string;
  size?: number;
}

const STATUS_COLOR: Record<string, string> = {
  ok: "var(--accent-cyan)",
  warn: "var(--accent-amber)",
  critical: "var(--accent-red)",
};

export function MetricRing({ label, percent, sublabel, size = 108 }: MetricRingProps) {
  const status = statusForPercent(percent);
  const color = STATUS_COLOR[status];
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, percent)) / 100);

  return (
    <div className="ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ring__arc"
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="ring__value"
          fill={color}
        >
          {percent.toFixed(0)}
        </text>
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="ring__percent-sign"
          fill="var(--text-muted)"
        >
          %
        </text>
      </svg>
      <div className="ring__label">{label}</div>
      {sublabel && <div className="ring__sublabel">{sublabel}</div>}
    </div>
  );
}
