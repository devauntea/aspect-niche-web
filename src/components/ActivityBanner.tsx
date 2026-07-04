"use client";

// Detail-card banner: a slice of night sky tinted by the activity's star hue,
// with a small constellation drawn in starlight. Quiet, on-system — the loud
// color-blocked version is gone.

import { nightSky } from "@/lib/theme";

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
  return (
    <div style={{ position: "relative", height, overflow: "hidden" }}>
      {/* Night gradient tinted by the activity's star hue */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(ellipse 70% 90% at 18% 20%, color-mix(in srgb, ${accentColor} 32%, transparent), transparent 65%),` +
            `radial-gradient(ellipse 60% 80% at 88% 85%, color-mix(in srgb, ${accentColor} 18%, transparent), transparent 60%),` +
            nightSky.space950,
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
        style={{ position: "absolute", inset: 0 }}
      >
        {STAR_EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={STARS[a].x}
            y1={STARS[a].y}
            x2={STARS[b].x}
            y2={STARS[b].y}
            stroke={accentColor}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
        ))}
        {STARS.map((s, i) => {
          const isPrimary = i === 0 || i === 3;
          const r = isPrimary ? 3.5 : 2.2;
          return (
            <g key={i}>
              <circle
                cx={s.x}
                cy={s.y}
                r={r + 3}
                fill={isPrimary ? accentColor : nightSky.starlight}
                opacity={0.18}
              />
              <circle
                cx={s.x}
                cy={s.y}
                r={r}
                fill={nightSky.starlight}
                opacity={0.9}
              />
            </g>
          );
        })}
      </svg>

      {/* Activity label — display voice */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 16,
          right: 16,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-grotesk), sans-serif",
            color: nightSky.starlight,
            fontWeight: 600,
            fontSize: height < 130 ? 16 : 20,
            letterSpacing: "0.01em",
            lineHeight: 1.15,
            textShadow:
              "0 1px 10px color-mix(in srgb, var(--color-bg) 80%, transparent)",
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
