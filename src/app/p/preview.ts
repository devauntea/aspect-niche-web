import type { PlanProposalWire } from "@/lib/planLink";

// What a date invitation shows BEFORE anyone opens it: the link preview's
// title, description and poster.
//
// A preview is forwarded, cached by messaging apps and shown to whoever the
// link lands in front of, so it carries the least that still says what this
// is: the host's name, what they named the date, and the day. Never the
// meeting point (it can be a home address), never the note, never the
// itinerary -- those are for the person who opens the link, on the page.

export type DatePreview = {
  host: string | null;
  title: string;
  /** "Saturday, October 3", or null when no time was offered. */
  day: string | null;
  headline: string;
  description: string;
};

export function datePreview(plan: PlanProposalWire | null): DatePreview {
  if (!plan) {
    return {
      host: null,
      title: "A date",
      day: null,
      headline: "An invitation — Aspect Niche",
      description: "A date invitation from Aspect Niche.",
    };
  }
  const host = plan.inviterName.trim() || null;
  const title = plan.title.trim() || "A date";
  const first = [...plan.windows].sort((a, b) => a.start.localeCompare(b.start))[0];
  const day = first
    ? new Date(first.start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : null;
  const more = plan.windows.length > 1 ? ` (or ${plan.windows.length - 1} other ${plan.windows.length === 2 ? "time" : "times"})` : "";
  return {
    host,
    title,
    day,
    headline: host ? `${host} would love to take you out` : "You're invited out",
    description: [title, day ? `${day}${more}` : null].filter(Boolean).join(" · "),
  };
}

/**
 * The poster's own query: the three preview fields and nothing else, so the
 * image URL a messaging app fetches and caches never carries the rest of the
 * invitation. The page URL has the whole invitation because the page is the
 * invitation; the poster is only its cover.
 */
export function posterQuery(p: DatePreview): string {
  const q = new URLSearchParams();
  if (p.host) q.set("h", p.host.slice(0, 60));
  q.set("t", p.title.slice(0, 80));
  if (p.day) q.set("w", p.day);
  return q.toString();
}

export function previewFromQuery(q: URLSearchParams): DatePreview {
  const host = q.get("h")?.trim() || null;
  const title = q.get("t")?.trim().slice(0, 80) || "A date";
  const day = q.get("w")?.trim().slice(0, 40) || null;
  return {
    host,
    title,
    day,
    headline: host ? `${host} would love to take you out` : "You're invited out",
    description: [title, day].filter(Boolean).join(" · "),
  };
}
