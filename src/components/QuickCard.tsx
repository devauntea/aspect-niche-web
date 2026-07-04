"use client";

// The Quick tab of the detail panel — hierarchy in a 3-second glance:
// category eyebrow → activity name (display voice) → description → meta row
// (small icons + tabular numerals) → resource → actions. One alpha-star
// primary (Find nearby, the thing to do next); everything else stays quiet.

import ActivityBanner from "./ActivityBanner";
import AddToCalendar from "./AddToCalendar";
import type { Activity } from "@/types/graph";
import type { Resource } from "@/data/resources";
import { nightSky, radiiScale } from "@/lib/theme";
import { Button, Chip, Eyebrow } from "./ui";

const diffLabel: Record<string, string> = {
  beginner: "Beginner-friendly",
  intermediate: "Some experience",
  advanced: "Experienced",
};
const envLabel: Record<string, string> = {
  indoors: "Indoors",
  outdoors: "Outdoors",
  both: "In or out",
};
const costLabel: Record<string, string> = {
  free: "$0",
  low: "$",
  medium: "$$",
  high: "$$$",
};
const timeLabel: Record<string, string> = {
  quick: "< 1 hr",
  moderate: "1–3 hrs",
  deep: "3+ hrs",
};

function MetaItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: nightSky.dust,
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span aria-hidden style={{ display: "flex", opacity: 0.8 }}>
        {icon}
      </span>
      {value}
    </div>
  );
}

interface Props {
  activity: Activity;
  accentColor: string;
  categoryLabel?: string;
  onFindNearby: () => void;
  youtubeResource?: Resource;
  swipeHintSeen: boolean;
}

export default function QuickCard({
  activity,
  accentColor,
  categoryLabel,
  onFindNearby,
  youtubeResource,
  swipeHintSeen,
}: Props) {
  const stroke = { stroke: "currentColor", strokeWidth: 1.4, fill: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ActivityBanner
        accentColor={accentColor}
        label={activity.label}
        height={96}
      />

      <div
        style={{
          padding: "16px 18px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Eyebrow + name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {categoryLabel && (
            <Eyebrow color={accentColor}>{categoryLabel}</Eyebrow>
          )}
          <h3
            style={{
              fontFamily: "var(--font-grotesk), sans-serif",
              fontWeight: 600,
              fontSize: 20,
              lineHeight: 1.15,
              color: nightSky.starlight,
              margin: 0,
            }}
          >
            {activity.label}
          </h3>
        </div>

        <p
          style={{
            fontSize: 14,
            color: nightSky.dust,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {activity.description}
        </p>

        {/* Tag chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip
            label={diffLabel[activity.tags.difficulty]}
            accent={accentColor}
            active
          />
          <Chip label={envLabel[activity.tags.environment]} />
          <Chip
            label={
              activity.tags.social === "solo"
                ? "Solo"
                : activity.tags.social === "social"
                  ? "Social"
                  : "Either"
            }
          />
        </div>

        {/* Meta row — small icons, tabular numerals */}
        <div
          style={{
            display: "flex",
            gap: 18,
            padding: "10px 12px",
            borderRadius: radiiScale.control,
            background: nightSky.space950,
            border: `1px solid ${nightSky.space800}`,
          }}
        >
          <MetaItem
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" {...stroke}>
                <circle cx="7" cy="7" r="5.5" />
                <path d="M7 4v3.2L9 9" strokeLinecap="round" />
              </svg>
            }
            value={timeLabel[activity.tags.timeCommitment] ?? "varies"}
          />
          <MetaItem
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" {...stroke}>
                <path
                  d="M7 1.5v11M9.8 3.8H5.6a1.8 1.8 0 100 3.6h2.8a1.8 1.8 0 110 3.6H3.8"
                  strokeLinecap="round"
                />
              </svg>
            }
            value={costLabel[activity.tags.cost] ?? "$"}
          />
          <MetaItem
            icon={
              <svg width="13" height="13" viewBox="0 0 14 14" {...stroke}>
                <path
                  d="M2 12L7 2l5 10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4.2 8.5h5.6" strokeLinecap="round" />
              </svg>
            }
            value={diffLabel[activity.tags.difficulty]?.split("-")[0] ?? ""}
          />
        </div>

        {youtubeResource && (
          <a
            href={youtubeResource.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 10,
              background: nightSky.space950,
              border: `1px solid ${nightSky.space800}`,
              borderRadius: radiiScale.control,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "calc(var(--radius-control) - 4px)",
                background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              ▶
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: nightSky.starlight,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {youtubeResource.title}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: nightSky.dust,
                  margin: "2px 0 0",
                  lineHeight: 1.3,
                }}
              >
                {youtubeResource.description}
              </p>
            </div>
          </a>
        )}

        {/* Actions — one alpha-star primary, quiet secondaries */}
        <Button variant="alpha" onClick={onFindNearby}>
          Find nearby →
        </Button>
        <AddToCalendar activity={activity} />

        {!swipeHintSeen && (
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: nightSky.dust,
              margin: 0,
              opacity: 0.7,
            }}
          >
            Swipe for more →
          </p>
        )}
      </div>
    </div>
  );
}
