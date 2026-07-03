"use client";

import ActivityBanner from "./ActivityBanner";
import ResourceLinks from "./ResourceLinks";
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
const costLabel: Record<string, string> = {
  free: "Free",
  low: "Low cost",
  medium: "Some gear",
  high: "Investment",
};

interface Props {
  activity: Activity;
  accentColor: string;
  checklist: string[];
  checkedItems: number[];
  onToggleCheck: (idx: number) => void;
  allDone: boolean;
  resources: Resource[];
  similarActivities: Activity[];
  onSelectActivity: (id: string) => void;
  randomReason?: string | null;
  isSaved: boolean;
  onToggleSave: () => void;
  onFindNearby: () => void;
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "#F0EDE6",
        margin: "4px 0",
      }}
    />
  );
}

export default function DeepDiveCard({
  activity,
  accentColor,
  checklist,
  checkedItems,
  onToggleCheck,
  allDone,
  resources,
  similarActivities,
  onSelectActivity,
  randomReason,
  isSaved,
  onToggleSave,
  onFindNearby,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ActivityBanner
        accentColor={accentColor}
        label={activity.label}
        height={140}
      />

      <div
        style={{
          padding: "16px 16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Tag pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            diffLabel[activity.tags.difficulty],
            envLabel[activity.tags.environment],
            costLabel[activity.tags.cost],
          ].map((tag) => (
            <span
              key={tag}
              style={{
                background: `${accentColor}12`,
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

        {/* Description */}
        <p
          style={{
            fontSize: 13,
            color: "#5A5855",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {activity.description}
        </p>

        {/* Why this fits */}
        {randomReason && (
          <div
            style={{
              background: `${accentColor}0e`,
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
            <div>
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: accentColor,
                  margin: "0 0 4px",
                  fontWeight: 600,
                }}
              >
                Why this fits
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#1A1916",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {randomReason}
              </p>
            </div>
          </div>
        )}

        <Divider />

        {/* Getting started checklist */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="1"
                  y="1"
                  width="11"
                  height="11"
                  rx="2.5"
                  stroke={accentColor}
                  strokeWidth="1.2"
                />
                <path
                  d="M3.5 6.5L5.5 8.5L9.5 4.5"
                  stroke={accentColor}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#B0ADA8",
                  margin: 0,
                }}
              >
                Getting started
              </p>
            </div>
            {allDone ? (
              <span
                style={{ fontSize: 11, fontWeight: 600, color: accentColor }}
              >
                All done! ✦
              </span>
            ) : checklist.length > 0 ? (
              <span style={{ fontSize: 11, color: "#B0ADA8" }}>
                {checkedItems.length} of {checklist.length} done
              </span>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checklist.map((step, i) => {
              const done = checkedItems.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => onToggleCheck(i)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    textAlign: "left",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px 0",
                    minHeight: 36,
                    transition: "transform 0.1s",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.98)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: `1.5px solid ${done ? accentColor : `${accentColor}60`}`,
                      background: done ? accentColor : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                      transition: "all 0.15s",
                    }}
                  >
                    {done && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4L3 5.5L6.5 2"
                          stroke="white"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: done ? `${accentColor}80` : "#5A5855",
                      textDecoration: done ? "line-through" : "none",
                      margin: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {step}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Resources */}
        <ResourceLinks resources={resources} accentColor={accentColor} />

        {/* Beginner tip */}
        {activity.beginnerTip && (
          <div
            style={{
              background: "#FAF8F2",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
            <div>
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#B0ADA8",
                  margin: "0 0 4px",
                }}
              >
                First step
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#1A1916",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {activity.beginnerTip}
              </p>
            </div>
          </div>
        )}

        {/* You might also like */}
        {similarActivities.length > 0 && (
          <div>
            <p
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#B0ADA8",
                margin: "0 0 8px",
              }}
            >
              You might also like
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {similarActivities.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectActivity(a.id)}
                  style={{
                    background: `${accentColor}12`,
                    color: accentColor,
                    border: "none",
                    borderRadius: 999,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    minHeight: 36,
                    transition: "transform 0.1s, opacity 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.96)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom action row */}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            onClick={onToggleSave}
            title={isSaved ? "Remove from saved" : "Save activity"}
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              borderRadius: 999,
              border: isSaved
                ? `1.5px solid ${accentColor}40`
                : "1.5px solid #E8E4DA",
              background: isSaved ? `${accentColor}18` : "#F0EDE6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.93)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 2h10a.5.5 0 01.5.5v12L8 11.5 2.5 14.5V2.5A.5.5 0 013 2z"
                fill={isSaved ? accentColor : "none"}
                stroke={isSaved ? accentColor : "#9A9690"}
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={onFindNearby}
            style={{
              flex: 1,
              height: 44,
              minHeight: 44,
              background: accentColor,
              color: "white",
              border: "none",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 14px ${accentColor}35`,
              transition: "opacity 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Find nearby →
          </button>
        </div>
      </div>
    </div>
  );
}
