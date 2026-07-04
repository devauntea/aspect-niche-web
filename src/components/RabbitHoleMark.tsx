"use client";

// The static rabbit-hole mark: the running-hare constellation over its soft
// shadow silhouette (Lepus style). Hero mark for landing/marketing only —
// the shadow doesn't survive below ~48px, so small sizes keep BrandMark.
// Mono by design: inherits currentColor for light or dark surfaces.

import {
  HARE_ALPHA_INDEX,
  HARE_EDGES,
  HARE_SILHOUETTE,
  HARE_STARS,
} from "@/lib/hareGeometry";

interface Props {
  width?: number;
  className?: string;
}

export default function RabbitHoleMark({ width = 320, className }: Props) {
  const alpha = HARE_STARS[HARE_ALPHA_INDEX];
  return (
    <svg
      // Tight crop around the hare (no hole in the static mark)
      viewBox="150 210 340 180"
      width={width}
      height={(width * 180) / 340}
      className={className}
      aria-label="Aspect Niche running-hare constellation"
    >
      <path d={HARE_SILHOUETTE} fill="currentColor" opacity={0.13} />
      {HARE_EDGES.map(([a, b], j) => (
        <line
          key={j}
          x1={HARE_STARS[a].x}
          y1={HARE_STARS[a].y}
          x2={HARE_STARS[b].x}
          y2={HARE_STARS[b].y}
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.4}
        />
      ))}
      {HARE_STARS.map((s, i) =>
        i === HARE_ALPHA_INDEX ? null : (
          <circle key={i} cx={s.x} cy={s.y} r={4} fill="currentColor" />
        ),
      )}
      <circle cx={alpha.x} cy={alpha.y} r={6} fill="currentColor" />
      <path
        d={`M ${alpha.x - 12} ${alpha.y} H ${alpha.x + 12} M ${alpha.x} ${alpha.y - 12} V ${alpha.y + 12}`}
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
}
