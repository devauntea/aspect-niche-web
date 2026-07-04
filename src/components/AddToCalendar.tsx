"use client";

import { useState } from "react";
import type { Activity } from "@/types/graph";
import { localCalendarService } from "@/lib/calendar/service";
import { mapsSearchUrl } from "@/lib/maps";
import { nightSky, radiiScale } from "@/lib/theme";
import { Button, Chip, Eyebrow, Input } from "./ui";

interface Props {
  activity: Activity;
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

export default function AddToCalendar({ activity }: Props) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
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
      </Button>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 12,
            background: nightSky.space950,
            border: `1px solid ${nightSky.space800}`,
            borderRadius: radiiScale.card,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Eyebrow>When (your local time)</Eyebrow>
            <Input
              type="datetime-local"
              value={startValue}
              onChange={setStartValue}
              error={
                valid ? undefined : "Pick a date and time to create the event."
              }
            />
          </label>

          <div style={{ display: "flex", gap: 6 }}>
            {DURATIONS.map(({ label, minutes }) => (
              <Chip
                key={minutes}
                label={label}
                active={durationMin === minutes}
                onClick={() => setDurationMin(minutes)}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <Button
              variant="violet"
              size="sm"
              disabled={!valid}
              onClick={() => window.open(buildLinks().googleUrl, "_blank")}
              style={{ flex: 1 }}
            >
              Google Calendar ↗
            </Button>
            <Button
              variant="violet"
              size="sm"
              disabled={!valid}
              onClick={() => {
                const { ics } = buildLinks();
                downloadIcs(ics.filename, ics.content);
              }}
              style={{ flex: 1 }}
            >
              Apple / .ics ↓
            </Button>
          </div>

          <p style={{ fontSize: 10, color: nightSky.dust, margin: 0 }}>
            The .ics file opens in Apple Calendar, Outlook, and most others.
          </p>
        </div>
      )}
    </div>
  );
}
