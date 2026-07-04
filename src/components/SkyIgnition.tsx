"use client";

// Onboarding finale: the jump down the rabbit hole (beats 5-7 only), then
// the hole "opens" into the user's first graph cluster. Tap to skip.

import RabbitHoleLoader from "./RabbitHoleLoader";
import { nightSky } from "@/lib/theme";

interface Props {
  interestIds: string[]; // kept for call-site stability
  onComplete: () => void;
}

export default function SkyIgnition({ onComplete }: Props) {
  return (
    <button
      onClick={onComplete}
      aria-label="Skip"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 cursor-pointer border-none"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, var(--canvas-lift) 0%, ${nightSky.space950} 70%)`,
      }}
    >
      <RabbitHoleLoader mode="finale" onDone={onComplete} />
      <p
        className="sky-ignition-caption"
        style={{
          fontFamily: "var(--font-grotesk), sans-serif",
          fontWeight: 600,
          fontSize: 22,
          color: nightSky.starlight,
          margin: 0,
          ["--seed-delay" as string]: "300ms",
        }}
      >
        Jump in.
      </p>
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
