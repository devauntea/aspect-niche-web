"use client";

// App boot: the rabbit-hole loading animation IS the loading screen.
// The loop runs to the dive (never cut before the shadow reveal), then the
// app takes over with no layout shift (fixed overlay). Tap to skip.

import { useMemo } from "react";
import RabbitHoleLoader from "./RabbitHoleLoader";
import { nightSky } from "@/lib/theme";

interface Props {
  onComplete: () => void;
}

export default function LogoAnimation({ onComplete }: Props) {
  // Sparse fixed background stars (deterministic)
  const bgStars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: 1 + (i % 3) * 0.4,
        opacity: 0.18 + (i % 4) * 0.05,
      })),
    [],
  );

  return (
    <button
      onClick={onComplete}
      aria-label="Skip intro"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 cursor-pointer border-none"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, var(--canvas-lift) 0%, ${nightSky.space950} 70%)`,
      }}
    >
      {bgStars.map((s, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: nightSky.starlight,
            opacity: `calc(${s.opacity} * var(--starfield-opacity, 0.35) / 0.35)`,
          }}
        />
      ))}

      <RabbitHoleLoader mode="boot" onDone={onComplete} />

      <div
        style={{
          textAlign: "center",
          opacity: 0,
          animation: "markFadeIn 420ms ease-out 2900ms forwards",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-grotesk), sans-serif",
            fontWeight: 600,
            fontSize: 28,
            color: nightSky.starlight,
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          aspect niche
        </p>
        <p
          style={{
            fontSize: 12,
            color: nightSky.dust,
            margin: "6px 0 0",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Navigate the hobby verse
        </p>
      </div>

      <p
        style={{
          position: "absolute",
          bottom: 28,
          fontSize: 11,
          color: nightSky.dust,
          opacity: 0.6,
        }}
      >
        tap to skip
      </p>
    </button>
  );
}
