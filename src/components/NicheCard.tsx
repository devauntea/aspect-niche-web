"use client";

import type { Activity } from "@/types/graph";
import type { NicheContent } from "@/data/nicheContent";

interface Props {
  activity: Activity;
  accentColor: string;
  accentDark: string;
  nicheContent: NicheContent;
  onOpenRabbitHole: () => void;
}

// Fixed constellation layout — 7 stars, deterministic positions
const STARS = [
  { x: 44,  y: 34  },
  { x: 96,  y: 64  },
  { x: 148, y: 22  },
  { x: 206, y: 50  },
  { x: 164, y: 106 },
  { x: 98,  y: 124 },
  { x: 228, y: 116 },
] as const;

const STAR_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [3, 6],
];

// Colors for the dots — alternate white with muted palette shades
const DOT_COLORS = [
  "white",
  "#F0B432",
  "white",
  "#A78BF6",
  "white",
  "#6EE7B7",
  "#93C5FD",
] as const;

// Twinkle delays per star so they don't all pulse together
const TWINKLE_DELAYS = ["0s", "0.8s", "1.4s", "0.3s", "1.8s", "0.6s", "1.1s"] as const;

export default function NicheCard({
  activity,
  accentColor,
  accentDark,
  nicheContent,
  onOpenRabbitHole,
}: Props) {
  return (
    <div
      className="niche-card-enter"
      style={{
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        border: `2px solid ${accentColor}`,
        boxShadow: `0 0 0 1px ${accentColor}22, 0 8px 32px ${accentColor}33`,
      }}
    >
      {/* ── Art background ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 20% 15%, #EF9F27 0%, transparent 40%),
            radial-gradient(circle at 80% 25%, #7F77DD 0%, transparent 45%),
            radial-gradient(circle at 50% 60%, ${accentColor} 0%, transparent 55%),
            radial-gradient(circle at 15% 85%, #1D9E75 0%, transparent 40%),
            linear-gradient(160deg, ${accentColor} 0%, ${accentDark} 100%)
          `,
        }}
      />

      {/* ── Holographic shimmer ── */}
      <div
        aria-hidden="true"
        className="niche-holo-shimmer"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 14px, white 14px, white 16px)",
          backgroundSize: "30px 100%",
        }}
      />

      {/* ── Top bar ── */}
      <div
        style={{
          position: "relative",
          padding: "16px 16px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {/* Activity name pill */}
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: 20,
            padding: "5px 12px 5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <span style={{ color: accentDark, fontSize: 11, flexShrink: 0 }}>◆</span>
          <span
            style={{
              color: accentDark,
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activity.label}
          </span>
        </div>

        {/* Rarity pill */}
        <div
          style={{
            background: "rgba(0,0,0,0.25)",
            borderRadius: 20,
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 11 }}>✦</span>
          <span
            style={{
              color: "white",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            rare niche
          </span>
        </div>
      </div>

      {/* ── Constellation art ── */}
      <div
        style={{
          position: "relative",
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="280"
          height="150"
          viewBox="0 0 280 150"
          fill="none"
          aria-hidden="true"
        >
          {/* Connection lines */}
          {STAR_EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={STARS[a].x}
              y1={STARS[a].y}
              x2={STARS[b].x}
              y2={STARS[b].y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}

          {/* Star dots */}
          {STARS.map((s, i) => {
            const isPrimary = i === 0 || i === 3;
            const r = isPrimary ? 5 : 3.5;
            return (
              <g key={i}>
                {/* glow halo */}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={r + 4}
                  fill={DOT_COLORS[i]}
                  opacity={0.18}
                />
                {/* main dot with twinkle */}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={r}
                  fill={DOT_COLORS[i]}
                  style={{
                    animation: `starTwinkle ${isPrimary ? 2.4 : 3}s ease-in-out infinite`,
                    animationDelay: TWINKLE_DELAYS[i],
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Frosted glass info panel ── */}
      <div
        style={{
          position: "relative",
          background: "rgba(28, 20, 24, 0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Label + niche title */}
        <div>
          <p
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.6)",
              marginBottom: 4,
              margin: 0,
            }}
          >
            The deep cut
          </p>
          <p
            style={{
              color: "white",
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.35,
              margin: "4px 0 0",
            }}
          >
            {nicheContent.nicheLabel}
          </p>
        </div>

        {/* Rabbit holes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {nicheContent.rabbitHoles.map((hole, i) => (
            <p
              key={i}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, margin: 0 }}
            >
              <span style={{ color: "#F0997B", marginRight: 6 }}>→</span>
              {hole}
            </p>
          ))}
        </div>

        {/* Insider term card */}
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <p
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 4px",
            }}
          >
            Insider term
          </p>
          <p
            style={{
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              margin: "0 0 3px",
              lineHeight: 1.3,
            }}
          >
            {nicheContent.insiderTerm}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 11,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {nicheContent.insiderDefinition}
          </p>
        </div>

        {/* Open rabbit hole button */}
        <button
          onClick={onOpenRabbitHole}
          style={{
            background: "white",
            color: accentDark,
            border: "none",
            borderRadius: 999,
            padding: "0 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            height: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 1v12M7 13L3.5 9.5M7 13l3.5-3.5"
              stroke={accentDark}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Open Rabbit Hole
        </button>
      </div>
    </div>
  );
}
