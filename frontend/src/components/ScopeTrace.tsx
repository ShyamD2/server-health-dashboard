import { useMemo } from "react";

interface ScopeTraceProps {
  history: number[]; // 0-100 values, oldest first
  max?: number;
  width?: number;
  height?: number;
  label: string;
  value: number;
  accent: string;
}

const CAPACITY = 90;

export function ScopeTrace({
  history,
  max = 100,
  width = 1000,
  height = 160,
  label,
  value,
  accent,
}: ScopeTraceProps) {
  const points = useMemo(() => {
    const padded = history.slice(-CAPACITY);
    const step = width / (CAPACITY - 1);
    const startIdx = CAPACITY - padded.length;
    return padded
      .map((v, i) => {
        const x = (startIdx + i) * step;
        const y = height - (Math.max(0, Math.min(max, v)) / max) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [history, width, height, max]);

  const gridRows = 4;
  const gridCols = 12;

  return (
    <div className="scope">
      <div className="scope__meta">
        <span className="scope__label">{label}</span>
        <span className="scope__value" style={{ color: accent }}>
          {value.toFixed(1)}
          <span className="scope__unit">%</span>
        </span>
      </div>
      <svg
        className="scope__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} live trace, currently ${value.toFixed(1)} percent`}
      >
        <defs>
          <linearGradient id="scopeFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridRows + 1 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            x2={width}
            y1={(height / gridRows) * i}
            y2={(height / gridRows) * i}
            className="scope__grid-line"
          />
        ))}
        {Array.from({ length: gridCols + 1 }).map((_, i) => (
          <line
            key={`v${i}`}
            y1={0}
            y2={height}
            x1={(width / gridCols) * i}
            x2={(width / gridCols) * i}
            className="scope__grid-line"
          />
        ))}

        {points && (
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#scopeFade)"
            stroke="none"
          />
        )}
        {points && (
          <polyline
            points={points}
            fill="none"
            stroke={accent}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="scope__line"
          />
        )}
      </svg>
    </div>
  );
}
