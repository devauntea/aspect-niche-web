"use client";

import ActivityBanner from "./ActivityBanner";
import type { Activity } from "@/types/graph";
import type { Resource } from "@/data/resources";

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
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ActivityBanner accentColor={accentColor} label={activity.label} height={110} />

      <div
        style={{
          padding: "14px 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {categoryLabel && (
          <p
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: accentColor,
              margin: 0,
              fontWeight: 600,
            }}
          >
            {categoryLabel}
          </p>
        )}

        {/* Description + pills grouped tightly */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p
            style={{
              fontSize: 13,
              color: "#5A5855",
              lineHeight: 1.55,
              margin: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {activity.description}
          </p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              diffLabel[activity.tags.difficulty],
              envLabel[activity.tags.environment],
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  background: `${accentColor}14`,
                  color: accentColor,
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
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
              background: "#FAF8F2",
              border: "1px solid #E8E4DA",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#D4537E14",
                color: "#D4537E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
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
                  color: "#1A1916",
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
                  color: "#9A9690",
                  margin: "2px 0 0",
                  lineHeight: 1.3,
                }}
              >
                {youtubeResource.description}
              </p>
            </div>
          </a>
        )}

        <button
          onClick={onFindNearby}
          style={{
            background: accentColor,
            color: "white",
            border: "none",
            borderRadius: 999,
            padding: "0 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            height: 44,
            minHeight: 44,
            boxShadow: `0 4px 14px ${accentColor}35`,
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Find nearby →
        </button>

        {!swipeHintSeen && (
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "#B0ADA8",
              margin: 0,
            }}
          >
            Swipe for more →
          </p>
        )}
      </div>
    </div>
  );
}
