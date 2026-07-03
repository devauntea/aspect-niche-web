import { describe, it, expect } from "vitest";
import { localCalendarService, toUtcBasic } from "./service";
import type { CalendarEvent } from "./service";
import { buildGoogleCalendarUrl } from "./google";
import { buildIcsFile, escapeIcsText, foldIcsLine } from "./ics";

// Dates built via Date.UTC so expectations don't depend on the machine's TZ
const start = new Date(Date.UTC(2026, 6, 11, 17, 0, 0)); // 2026-07-11 17:00Z
const end = new Date(Date.UTC(2026, 6, 11, 18, 30, 0));
const stamp = new Date(Date.UTC(2026, 6, 3, 12, 0, 0));

const baseEvent: CalendarEvent = {
  title: "Yoga session",
  description: "Build flexibility.\nBring a mat, water; comfy clothes.",
  location: "https://www.google.com/maps/search/yoga%20near%20me",
  start,
  end,
};

describe("toUtcBasic", () => {
  it("formats an instant as UTC basic YYYYMMDDTHHMMSSZ", () => {
    expect(toUtcBasic(start)).toBe("20260711T170000Z");
    expect(toUtcBasic(end)).toBe("20260711T183000Z");
  });
});

describe("buildGoogleCalendarUrl", () => {
  it("builds a template URL with UTC dates, title, details, location", () => {
    const url = new URL(buildGoogleCalendarUrl(baseEvent));
    expect(url.origin + url.pathname).toBe(
      "https://calendar.google.com/calendar/render",
    );
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Yoga session");
    expect(url.searchParams.get("dates")).toBe(
      "20260711T170000Z/20260711T183000Z",
    );
    expect(url.searchParams.get("details")).toContain("Build flexibility.");
    expect(url.searchParams.get("location")).toBe(baseEvent.location);
  });

  it("adds guests via the add param", () => {
    const url = new URL(
      buildGoogleCalendarUrl({
        ...baseEvent,
        guests: [{ email: "a@b.com" }, { email: "c@d.com", name: "C" }],
      }),
    );
    expect(url.searchParams.get("add")).toBe("a@b.com,c@d.com");
  });
});

describe("escapeIcsText", () => {
  it("escapes backslash, semicolon, comma, and newlines", () => {
    expect(escapeIcsText("a\\b;c,d\ne\r\nf")).toBe("a\\\\b\\;c\\,d\\ne\\nf");
  });
});

describe("foldIcsLine", () => {
  it("leaves short lines untouched", () => {
    expect(foldIcsLine("SUMMARY:Yoga")).toBe("SUMMARY:Yoga");
  });

  it("folds long lines to <= 75 octets with space continuations", () => {
    const folded = foldIcsLine("DESCRIPTION:" + "x".repeat(300));
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    const encoder = new TextEncoder();
    for (const part of parts) {
      expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
    }
    for (const part of parts.slice(1)) {
      expect(part.startsWith(" ")).toBe(true);
    }
    // Unfolding reproduces the original line
    expect(folded.replace(/\r\n /g, "")).toBe("DESCRIPTION:" + "x".repeat(300));
  });

  it("counts UTF-8 bytes, not characters", () => {
    const folded = foldIcsLine("SUMMARY:" + "é".repeat(100));
    const encoder = new TextEncoder();
    for (const part of folded.split("\r\n")) {
      expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
    }
  });
});

describe("buildIcsFile", () => {
  const opts = { uid: "test-uid@aspect-niche", now: stamp };

  it("produces a valid VEVENT with UTC times and CRLF endings", () => {
    const { filename, content } = buildIcsFile(baseEvent, opts);
    expect(filename).toBe("yoga-session.ics");
    expect(content).toContain("BEGIN:VCALENDAR\r\n");
    expect(content).toContain("VERSION:2.0\r\n");
    expect(content).toContain("BEGIN:VEVENT\r\n");
    expect(content).toContain("UID:test-uid@aspect-niche\r\n");
    expect(content).toContain("DTSTAMP:20260703T120000Z\r\n");
    expect(content).toContain("DTSTART:20260711T170000Z\r\n");
    expect(content).toContain("DTEND:20260711T183000Z\r\n");
    expect(content).toContain("SUMMARY:Yoga session\r\n");
    expect(content.endsWith("END:VCALENDAR\r\n")).toBe(true);
    // Every raw line respects the 75-octet limit
    const encoder = new TextEncoder();
    for (const line of content.split("\r\n")) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("escapes description text (commas, newlines)", () => {
    const { content } = buildIcsFile(baseEvent, opts);
    const unfolded = content.replace(/\r\n /g, "");
    expect(unfolded).toContain(
      "DESCRIPTION:Build flexibility.\\nBring a mat\\, water\\; comfy clothes.",
    );
  });

  it("has no METHOD when there are no guests", () => {
    const { content } = buildIcsFile(baseEvent, opts);
    expect(content).not.toContain("METHOD:");
    expect(content).not.toContain("ATTENDEE");
  });

  it("becomes an invitation when guests are present", () => {
    const { content } = buildIcsFile(
      {
        ...baseEvent,
        organizer: { email: "me@example.com", name: "Dev" },
        guests: [{ email: "date@example.com", name: "Alex" }],
      },
      opts,
    );
    expect(content).toContain("METHOD:REQUEST\r\n");
    expect(content).toContain("ORGANIZER;CN=Dev:mailto:me@example.com\r\n");
    const unfolded = content.replace(/\r\n /g, "");
    expect(unfolded).toContain(
      "ATTENDEE;CN=Alex;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:date@example.com",
    );
  });
});

describe("localCalendarService", () => {
  it("returns both outputs from one call", () => {
    const links = localCalendarService.createEventLinks(baseEvent);
    expect(links.googleUrl).toContain("calendar.google.com");
    expect(links.ics.filename).toBe("yoga-session.ics");
    expect(links.ics.content).toContain("BEGIN:VCALENDAR");
  });
});
