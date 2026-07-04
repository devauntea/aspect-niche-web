"use client";

// Random Activity result — a "discovered star": the card ignites in with the
// activity's star, the why-it-fits line, and one clear next step (the detail
// panel is already open on the map behind this overlay).

import { interests } from "../data/activities";
import type { Activity } from "../types/graph";
import { nightSky, radiiScale, starHues } from "@/lib/theme";
import { Button, Eyebrow, Chip } from "./ui";

interface Props {
  activity: Activity;
  interestIds: string[];
  reason: string;
  onDismiss: () => void;
  onAgain?: () => void;
}

const diffLabel: Record<string, string> = {
  beginner: "Beginner-friendly",
  intermediate: "Some experience",
  advanced: "Experienced",
};
const costLabel: Record<string, string> = {
  free: "Free",
  low: "Low cost",
  medium: "Some gear",
  high: "Investment",
};

export default function SurpriseCard({
  activity,
  reason,
  onDismiss,
  onAgain,
}: Props) {
  const parent = interests.find((i) => i.activityIds.includes(activity.id));
  const hue = parent
    ? (starHues[parent.id] ?? nightSky.violetGlow)
    : nightSky.violetGlow;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5 surprise-backdrop"
      style={{
        background: "color-mix(in srgb, var(--color-bg) 72%, transparent)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm surprise-card-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: nightSky.space900,
          border: `1px solid ${nightSky.space800}`,
          borderRadius: radiiScale.sheet,
          boxShadow: `${nightSky.raisedGlow}, 0 0 60px color-mix(in srgb, ${hue} 13%, transparent)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "26px 24px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* The discovered star ignites */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: 4,
            }}
          >
            <div
              className="node-ignite"
              aria-hidden
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                className="star-core"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 40% 35%, ${nightSky.starlight}, ${hue} 70%)`,
                  boxShadow: `0 0 14px ${hue}, 0 0 36px color-mix(in srgb, ${hue} 53%, transparent), 0 0 64px color-mix(in srgb, ${hue} 27%, transparent)`,
                }}
              />
              {/* pulled out of the rabbit hole — the brand motif, sparingly */}
              <svg width="56" height="12" viewBox="0 0 56 12">
                <ellipse
                  cx="28"
                  cy="6"
                  rx="26"
                  ry="5"
                  fill="color-mix(in srgb, var(--color-bg) 30%, #000)"
                  stroke={hue}
                  strokeOpacity="0.6"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Eyebrow color={hue}>A star you hadn&apos;t met</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-grotesk), sans-serif",
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1.15,
                color: nightSky.starlight,
                margin: "6px 0 0",
              }}
            >
              {activity.label}
            </h2>
          </div>

          <p
            style={{
              fontSize: 14,
              color: nightSky.dust,
              lineHeight: 1.5,
              margin: 0,
              textAlign: "center",
            }}
          >
            {activity.description}
          </p>

          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={diffLabel[activity.tags.difficulty]}
              accent={hue}
              active
            />
            <Chip label={costLabel[activity.tags.cost]} />
          </div>

          {/* Why it fits */}
          <div
            style={{
              borderRadius: radiiScale.card,
              padding: 14,
              background: nightSky.space950,
              border: `1px solid color-mix(in srgb, ${hue} 20%, transparent)`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Eyebrow color={hue}>Why this fits you</Eyebrow>
            <p
              style={{
                fontSize: 13,
                color: nightSky.starlight,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {reason}
            </p>
          </div>

          {activity.beginnerTip && (
            <p
              style={{
                fontSize: 12,
                color: nightSky.dust,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              <span style={{ color: nightSky.starlight, fontWeight: 600 }}>
                First step:
              </span>{" "}
              {activity.beginnerTip}
            </p>
          )}

          {/* One clear next step */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button variant="alpha" onClick={onDismiss}>
              See it on your map →
            </Button>
            {onAgain && (
              <Button variant="ghost" onClick={onAgain}>
                Spin again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
