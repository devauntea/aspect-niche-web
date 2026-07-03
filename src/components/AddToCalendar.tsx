"use client";

import { useState } from "react";
import type { Activity } from "@/types/graph";
import { localCalendarService } from "@/lib/calendar/service";
import { mapsSearchUrl } from "@/lib/maps";
import { colors } from "@/lib/theme";

interface Props {
  activity: Activity;
  accentColor: string;
}

const DURATIONS = [
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
  { label: "2 hr", minutes: 120 },
];

/** Upcoming Saturday at the given local hour — a friendly default slot. */
function nextSaturdayAt(hour: number): Date {
  const d = new Date();
  let diff = (6 - d.getDay() + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Format a Date as a datetime-local input value (local time). */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AddToCalendar({ activity, accentColor }: Props) {
  const [open, setOpen] = useState(false);
  const [startValue, setStartValue] = useState(() =>
    toLocalInputValue(nextSaturdayAt(10)),
  );
  const [durationMin, setDurationMin] = useState(60);

  // datetime-local parses as local time; invalid/empty input → NaN
  const start = new Date(startValue);
  const valid = !Number.isNaN(start.getTime());

  function buildLinks() {
    const end = new Date(start.getTime() + durationMin * 60_000);
    const maps = mapsSearchUrl(activity.label);
    return localCalendarService.createEventLinks({
      title: activity.label,
      description: `${activity.description}\n\nFind a spot nearby: ${maps}`,
      location: maps,
      start,
      end,
    });
  }

  const secondaryBtn: React.CSSProperties = {
    flex: 1,
    height: 40,
    minHeight: 40,
    borderRadius: 999,
    border: `1.5px solid ${accentColor}45`,
    background: "white",
    color: accentColor,
    fontSize: 12,
    fontWeight: 600,
    cursor: valid ? "pointer" : "not-allowed",
    opacity: valid ? 1 : 0.45,
    transition: "background 0.15s, transform 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: open ? `${accentColor}10` : "white",
          color: accentColor,
          border: `1.5px solid ${accentColor}45`,
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
          transition: "background 0.15s, transform 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = `${accentColor}10`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = open
            ? `${accentColor}10`
            : "white")
        }
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="1.5"
            y="2.5"
            width="11"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M1.5 5.5h11M4.5 1v3M9.5 1v3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {open ? "Hide calendar options" : "Add to calendar"}
      </button>

      {/* Expanded scheduling panel */}
      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 12,
            background: colors.appBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              color: colors.textMuted,
            }}
          >
            When (your local time)
            <input
              type="datetime-local"
              value={startValue}
              onChange={(e) => setStartValue(e.target.value)}
              style={{
                height: 38,
                borderRadius: 8,
                border: `1px solid ${valid ? colors.border : "#D4537E"}`,
                background: "white",
                padding: "0 10px",
                fontSize: 13,
                color: colors.textPrimary,
                fontWeight: 400,
                letterSpacing: "normal",
                textTransform: "none",
              }}
            />
          </label>
          {!valid && (
            <p style={{ fontSize: 11, color: "#D4537E", margin: 0 }}>
              Pick a date and time to create the event.
            </p>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            {DURATIONS.map(({ label, minutes }) => {
              const active = durationMin === minutes;
              return (
                <button
                  key={minutes}
                  onClick={() => setDurationMin(minutes)}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 999,
                    border: active
                      ? `1.5px solid ${accentColor}`
                      : `1px solid ${colors.border}`,
                    background: active ? `${accentColor}14` : "white",
                    color: active ? accentColor : colors.textBody,
                    fontSize: 11,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={!valid}
              onClick={() => window.open(buildLinks().googleUrl, "_blank")}
              style={secondaryBtn}
              onMouseEnter={(e) => {
                if (valid)
                  e.currentTarget.style.background = `${accentColor}10`;
              }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              onMouseDown={(e) => {
                if (valid) e.currentTarget.style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Google Calendar ↗
            </button>
            <button
              disabled={!valid}
              onClick={() => {
                const { ics } = buildLinks();
                downloadIcs(ics.filename, ics.content);
              }}
              style={secondaryBtn}
              onMouseEnter={(e) => {
                if (valid)
                  e.currentTarget.style.background = `${accentColor}10`;
              }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              onMouseDown={(e) => {
                if (valid) e.currentTarget.style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Apple / .ics ↓
            </button>
          </div>

          <p style={{ fontSize: 10, color: colors.textMuted, margin: 0 }}>
            The .ics file opens in Apple Calendar, Outlook, and most others.
          </p>
        </div>
      )}
    </div>
  );
}
