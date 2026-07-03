// RFC 5545 iCalendar (.ics) generation — the universal "add to calendar"
// path: Apple Calendar, Outlook, and Google all import it. When guests are
// present the file becomes an invitation (METHOD:REQUEST + ATTENDEE), which
// the user forwards themselves in C1; auto-send is the backend-gated C2.

import { toUtcBasic, type CalendarEvent } from "./service";

const PRODID = "-//Aspect Niche//Hobby Graph//EN";

/** RFC 5545 §3.3.11 TEXT escaping: backslash, semicolon, comma, newline. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * RFC 5545 §3.1 line folding: content lines are limited to 75 octets;
 * continuations start with a single space. Counted in UTF-8 bytes so
 * multi-byte characters never straddle the limit.
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = "";
  let currentBytes = 0;
  // First line gets 75 octets; continuation lines get 74 (the space counts)
  let limit = 75;
  for (const ch of line) {
    const chBytes = encoder.encode(ch).length;
    if (currentBytes + chBytes > limit) {
      out.push(current);
      current = " ";
      currentBytes = 1;
      limit = 75;
    }
    current += ch;
    currentBytes += chBytes;
  }
  out.push(current);
  return out.join("\r\n");
}

export type IcsOptions = {
  /** Injectable for deterministic tests; defaults to a random UUID. */
  uid?: string;
  /** Injectable "now" for DTSTAMP; defaults to the current time. */
  now?: Date;
};

export function buildIcsFile(
  event: CalendarEvent,
  options: IcsOptions = {},
): { filename: string; content: string } {
  const uid = options.uid ?? `${crypto.randomUUID()}@aspect-niche`;
  const now = options.now ?? new Date();
  const hasGuests = !!event.guests && event.guests.length > 0;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
  ];
  if (hasGuests) lines.push("METHOD:REQUEST");

  lines.push(
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUtcBasic(now)}`,
    `DTSTART:${toUtcBasic(event.start)}`,
    `DTEND:${toUtcBasic(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  );
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }
  if (event.organizer) {
    const cn = event.organizer.name
      ? `;CN=${escapeIcsText(event.organizer.name)}`
      : "";
    lines.push(`ORGANIZER${cn}:mailto:${event.organizer.email}`);
  }
  if (hasGuests) {
    for (const guest of event.guests!) {
      const cn = guest.name ? `;CN=${escapeIcsText(guest.name)}` : "";
      lines.push(
        `ATTENDEE${cn};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${guest.email}`,
      );
    }
  }
  lines.push("END:VEVENT", "END:VCALENDAR");

  const content = lines.map(foldIcsLine).join("\r\n") + "\r\n";
  const filename = `${slugify(event.title)}.ics`;
  return { filename, content };
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "event";
}
