"use client";

const PALETTE = [
  "#D4537E",
  "#7F77DD",
  "#EF9F27",
  "#1D9E75",
  "#378ADD",
  "#D85A30",
  "#639922",
];

const COMPLEMENT_MAP: Record<string, [string, string]> = {
  "#D4537E": ["#7F77DD", "#EF9F27"],
  "#7F77DD": ["#1D9E75", "#EF9F27"],
  "#EF9F27": ["#D4537E", "#7F77DD"],
  "#1D9E75": ["#378ADD", "#EF9F27"],
  "#378ADD": ["#7F77DD", "#1D9E75"],
  "#D85A30": ["#EF9F27", "#1D9E75"],
  "#639922": ["#1D9E75", "#378ADD"],
};

export function getComplementaryColors(accentColor: string): [string, string] {
  return COMPLEMENT_MAP[accentColor] ?? [PALETTE[1], PALETTE[2]];
}

const STARS = [
  { x: 30, y: 28 },
  { x: 82, y: 52 },
  { x: 148, y: 18 },
  { x: 196, y: 44 },
  { x: 162, y: 88 },
  { x: 96, y: 98 },
] as const;

const STAR_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 1],
];

const DOT_COLORS = [
  "white",
  "#F0B432",
  "white",
  "#A78BF6",
  "#6EE7B7",
  "#93C5FD",
] as const;

interface Props {
  accentColor: string;
  label: string;
  height?: number;
}

export default function ActivityBanner({
  accentColor,
  label,
  height = 140,
}: Props) {
  const [color1, color2] = getComplementaryColors(accentColor);

  return (
    <div style={{ position: "relative", height, overflow: "hidden" }}>
      {/* Color-blocked geometric background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg,
            ${color1} 0%, ${color1} 34%,
            ${accentColor} 34%, ${accentColor} 66%,
            ${color2} 66%, ${color2} 100%)`,
        }}
      />

      {/* Constellation overlay */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 280 ${height}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, opacity: 0.55 }}
      >
        {STAR_EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={STARS[a].x}
            y1={STARS[a].y}
            x2={STARS[b].x}
            y2={STARS[b].y}
            stroke="white"
            strokeWidth={1}
            strokeOpacity={0.45}
          />
        ))}
        {STARS.map((s, i) => {
          const isPrimary = i === 0 || i === 3;
          const r = isPrimary ? 4 : 2.5;
          return (
            <g key={i}>
              <circle
                cx={s.x}
                cy={s.y}
                r={r + 3}
                fill={DOT_COLORS[i]}
                opacity={0.15}
              />
              <circle
                cx={s.x}
                cy={s.y}
                r={r}
                fill={DOT_COLORS[i]}
                opacity={0.9}
              />
            </g>
          );
        })}
      </svg>

      {/* Activity label */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 16,
          right: 16,
        }}
      >
        <p
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: height < 130 ? 16 : 21,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
