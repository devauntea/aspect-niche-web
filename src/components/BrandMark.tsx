"use client";

// The Aspect Niche mark — constellation rabbit, alpha-star cotton tail.
// variant="night": starlight stars + violet edges + warm tail glow, for dark
// surfaces. variant="mono": everything in currentColor, for light surfaces,
// favicons, and loading states (per brand asset spec).

import {
  ALPHA_INDEX,
  MAJOR_STARS,
  MARK_EDGES,
  MARK_NODES,
  MARK_VIEWBOX,
} from "@/lib/brandGeometry";
import { nightSky } from "@/lib/theme";

interface Props {
  size?: number;
  variant?: "night" | "mono";
  className?: string;
}

const MAJOR = new Set(MAJOR_STARS);

export default function BrandMark({
  size = 28,
  variant = "night",
  className,
}: Props) {
  const night = variant === "night";
  const edgeStroke = night ? nightSky.violetGlow : "currentColor";
  const starFill = night ? nightSky.starlight : "currentColor";
  const alphaFill = night ? nightSky.alphaStar : "currentColor";
  const alpha = MARK_NODES[ALPHA_INDEX];

  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={size}
      height={size * (380 / 360)}
      fill="none"
      className={className}
      aria-label="Aspect Niche constellation rabbit"
    >
      {MARK_EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={MARK_NODES[a].x}
          y1={MARK_NODES[a].y}
          x2={MARK_NODES[b].x}
          y2={MARK_NODES[b].y}
          stroke={edgeStroke}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={night ? 0.45 : 0.4}
        />
      ))}

      {MARK_NODES.map((n, i) =>
        i === ALPHA_INDEX ? null : (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={MAJOR.has(i) ? 8 : 6}
            fill={starFill}
            opacity={MAJOR.has(i) ? 1 : 0.85}
          />
        ),
      )}

      {/* Cotton tail — the alpha star: halo, core, sparkle cross */}
      <circle
        cx={alpha.x}
        cy={alpha.y}
        r={26}
        fill={alphaFill}
        opacity={0.16}
      />
      <circle
        cx={alpha.x}
        cy={alpha.y}
        r={16}
        fill={alphaFill}
        opacity={0.28}
      />
      <circle cx={alpha.x} cy={alpha.y} r={10} fill={alphaFill} />
      <path
        d={`M ${alpha.x - 22} ${alpha.y} H ${alpha.x + 22} M ${alpha.x} ${alpha.y - 22} V ${alpha.y + 22}`}
        stroke={alphaFill}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
}
