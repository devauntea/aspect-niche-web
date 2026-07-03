// Google Calendar template URL — no API, no auth. Opening the link drops the
// user into Google's own pre-filled event editor.

import { toUtcBasic, type CalendarEvent } from "./service";

export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcBasic(event.start)}/${toUtcBasic(event.end)}`,
  });
  if (event.description) params.set("details", event.description);
  if (event.location) params.set("location", event.location);
  if (event.guests && event.guests.length > 0) {
    params.set("add", event.guests.map((g) => g.email).join(","));
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
