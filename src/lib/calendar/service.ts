// CalendarService — fallback-first calendar integration (work order Track C1).
//
// Everything here is pure, synchronous, and client-side: a Google Calendar
// template URL and an RFC 5545 .ics file (Apple Calendar, Outlook, etc.).
// No network call, no OAuth. A future backend adapter (Google Calendar API
// with auto-sent invites) implements the same interface, so the UI never
// changes — per the blueprint's provider-abstraction rule.

import { buildGoogleCalendarUrl } from "./google";
import { buildIcsFile } from "./ics";

export type CalendarAttendee = {
  email: string;
  name?: string;
};

export type CalendarEvent = {
  title: string;
  description?: string;
  /** Free text or a URL; calendar apps link URLs (we pass the Maps search). */
  location?: string;
  start: Date;
  end: Date;
  organizer?: CalendarAttendee;
  guests?: CalendarAttendee[];
};

export type CalendarLinks = {
  /** Opens Google Calendar's pre-filled event editor. */
  googleUrl: string;
  /** Download payload importable by Apple Calendar / Outlook / Google. */
  ics: { filename: string; content: string };
};

export interface CalendarService {
  createEventLinks(event: CalendarEvent): CalendarLinks;
}

/** The no-backend adapter: link + file generation only. */
export const localCalendarService: CalendarService = {
  createEventLinks(event) {
    return {
      googleUrl: buildGoogleCalendarUrl(event),
      ics: buildIcsFile(event),
    };
  },
};

/**
 * UTC basic format required by both outputs: YYYYMMDDTHHMMSSZ.
 * Timezones are handled here, explicitly and only here: JS Dates carry an
 * absolute instant; we always serialize the UTC reading of that instant.
 */
export function toUtcBasic(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}
