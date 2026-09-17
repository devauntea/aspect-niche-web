// Invitations: one hobby session or one date, sent to one person.
//
// **There is no server, and the design follows from that.** An invitation is
// the whole event encoded into a link. The host shares that link however they
// already talk to the person; opening it in the app decodes it back into an
// invitation. The guest's answer travels the same way, as a much shorter reply
// link the host taps once.
//
// So the guest list is what the host has *heard back*, not a live roster. That
// is a real difference from a hosted invite and it is stated on the screen
// rather than hidden — a list that silently lags is worse than one that says
// what it is.
//
// Everything here is pure: encoding, decoding, and the shapes. It is the part
// worth testing, because a link that decodes wrong is a party nobody can find.

export type RsvpStatus = "going" | "maybe" | "out";

/**
 * `short` is what fits on the card, where three choices share one row and the
 * third was arriving as "CAN'T MAKE…". `label` is for prose, where the full
 * phrase reads better than the abbreviation.
 */
export const RSVP_CHOICES: {
  id: RsvpStatus;
  label: string;
  short: string;
}[] = [
  { id: "going", label: "Going", short: "Going" },
  { id: "maybe", label: "Maybe", short: "Maybe" },
  { id: "out", label: "Can't make it", short: "Can't go" },
];

export function rsvpLabel(status: RsvpStatus): string {
  return RSVP_CHOICES.find((c) => c.id === status)?.label ?? "Going";
}

export type Invite = {
  id: string;
  /** What the host called themselves when they sent it. */
  host: string;
  /** A hobby session, or a date. Changes the wording, not the mechanics. */
  kind: "hobby" | "date";
  title: string;
  /** Set when the invitation came from a hobby, so the card can draw its mark. */
  activityId?: string;
  category: Category;
  /** ISO 8601. */
  startsAt: string;
  durationMinutes: number;
  /**
   * Minutes east of UTC in the HOST's zone, at this instant. Optional, because
   * links sent before this field existed do not carry it.
   *
   * `startsAt` is an instant, and an instant alone cannot say what time the
   * host meant. Rendering it in whatever zone the reader happens to be in got
   * the preview card wrong for everyone: the page is server-rendered on a box
   * running UTC, so an invitation set for 6pm in New York went out to every
   * guest as 10pm. A guest in another zone reading their own local time is the
   * same bug wearing a friendlier face — "6pm at Far Rockaway" means 6pm
   * there, and a meetup has one clock, the host's.
   *
   * An offset rather than an IANA name because the link's length is paid for
   * in every message thread it sits in (see `encodeInvite`), and the offset for
   * one known instant is exactly as correct as the name it came from. It is
   * captured at the event's own date, so a summer event keeps summer time.
   */
  tzOffset?: number;
  /** Free text: a venue, an address, or empty. */
  place: string;
  /** The host's own description. This is the part that makes it an invitation. */
  note: string;
};

/** Someone the host has heard back from. */
export type Guest = {
  name: string;
  status: RsvpStatus;
  /** ISO 8601, when the host recorded it. */
  at: string;
};

export type SentInvite = { invite: Invite; guests: Guest[] };
export type ReceivedInvite = { invite: Invite; myStatus: RsvpStatus | null };

// ---------------------------------------------------------------------------
// Link encoding
//
// Base64url of compact JSON. Hand-rolled rather than `btoa`, which React Native
// does not ship, and rather than a dependency, because this is thirty lines and
// it has to round-trip exactly. Keys are one character each: the whole event
// travels in a URL that people paste into a text message, and a link that wraps
// onto three lines looks like spam.
// ---------------------------------------------------------------------------

const B64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** UTF-8 bytes of a string, so non-ASCII names and notes survive the trip. */
function utf8Bytes(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000)
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 63),
        0x80 | ((cp >> 6) & 63),
        0x80 | (cp & 63),
      );
  }
  return out;
}

function fromUtf8(bytes: number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    let cp: number;
    if (b < 0x80) {
      cp = b;
      i += 1;
    } else if (b < 0xe0) {
      cp = ((b & 31) << 6) | (bytes[i + 1] & 63);
      i += 2;
    } else if (b < 0xf0) {
      cp = ((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63);
      i += 3;
    } else {
      cp =
        ((b & 7) << 18) |
        ((bytes[i + 1] & 63) << 12) |
        ((bytes[i + 2] & 63) << 6) |
        (bytes[i + 3] & 63);
      i += 4;
    }
    out += String.fromCodePoint(cp);
  }
  return out;
}

export function encodeBase64Url(text: string): string {
  const bytes = utf8Bytes(text);
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    if (b === undefined) break;
    out += B64[((b & 15) << 2) | ((c ?? 0) >> 6)];
    if (c === undefined) break;
    out += B64[c & 63];
  }
  return out;
}

export function decodeBase64Url(text: string): string {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of text) {
    const v = B64.indexOf(ch);
    // Padding and stray characters are skipped rather than thrown on: these
    // arrive from a link someone pasted, and a trailing "=" is not corruption.
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return fromUtf8(bytes);
}

/**
 * The wire shape.
 *
 * A positional array rather than an object, because the whole invitation
 * travels inside the link and every key name is paid for twice — once in the
 * JSON and again in base64. Dropping the names, storing the time as base36
 * epoch minutes and trimming trailing blanks took a typical invitation from 207
 * characters of link to 126. That is the difference between a message bubble
 * with a wall of blue in it and one with a line of it.
 *
 * Positions never change meaning. New fields append; a reader that predates
 * them ignores what it does not recognise, and `V2` marks the format so the
 * object form that shipped first still decodes.
 */
const V2 = 2;

/** Category as an index. The order is frozen — append only: the index is what
 *  goes on the wire, so reordering this list silently re-labels every link
 *  already out there. This file exists in two repositories and must stay
 *  byte-for-byte identical between them, which is why the type is derived from
 *  the list here rather than imported from a theme registry only one of the two
 *  repositories has. */
const CATEGORIES = [
  "creative",
  "mind",
  "tech",
  "outdoor",
  "nature",
  "craft",
  "fitness",
  "social",
  "community",
  "culinary",
  "adventure",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** The object form the first version sent. Still decoded, never written. */
type WireV1 = {
  i: string;
  h: string;
  k: "hobby" | "date";
  t: string;
  a?: string;
  c: string;
  s: string;
  d: number;
  p: string;
  n: string;
};

/** Minutes since the epoch, base36. Seconds are noise on a calendar invite. */
function packTime(iso: string): string {
  return Math.round(Date.parse(iso) / 60000).toString(36);
}

function unpackTime(packed: unknown): string | null {
  if (typeof packed === "number") {
    // A number here means the sender wrote milliseconds, which nothing does
    // today but is the obvious way for a future version to get this wrong.
    return new Date(packed).toISOString();
  }
  if (typeof packed !== "string") return null;
  const minutes = parseInt(packed, 36);
  if (!Number.isFinite(minutes)) return null;
  const d = new Date(minutes * 60000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function encodeInvite(invite: Invite): string {
  const categoryIndex = CATEGORIES.indexOf(invite.category);
  const wire: unknown[] = [
    V2,
    invite.id,
    invite.host,
    invite.kind === "date" ? 1 : 0,
    invite.title,
    // An unknown category travels as its name rather than being lost.
    categoryIndex >= 0 ? categoryIndex : invite.category,
    packTime(invite.startsAt),
    invite.durationMinutes,
    invite.place,
    invite.note,
    invite.activityId ?? "",
    // Appended, which is the only way this format grows: positions never
    // change meaning, so an older reader stops at activityId and still
    // decodes everything before it.
    typeof invite.tzOffset === "number" ? invite.tzOffset : "",
  ];
  // Trailing blanks carry nothing; a missing tail reads as empty on the way in.
  while (wire.length > 8 && (wire[wire.length - 1] === "" || wire[wire.length - 1] == null)) {
    wire.pop();
  }
  return encodeBase64Url(JSON.stringify(wire));
}

function decodeV1(wire: Partial<WireV1>): Invite | null {
  const { i, h, t, c, s } = wire;
  if (!i || !h || !t || !c || !s) return null;
  if (Number.isNaN(Date.parse(s))) return null;
  return {
    id: i,
    host: h,
    kind: wire.k === "date" ? "date" : "hobby",
    title: t,
    activityId: wire.a,
    category: c as Category,
    startsAt: s,
    durationMinutes: typeof wire.d === "number" && wire.d > 0 ? wire.d : 90,
    place: wire.p ?? "",
    note: wire.n ?? "",
  };
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** null for anything that is not an invitation this version understands. */
export function decodeInvite(encoded: string): Invite | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeBase64Url(encoded));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  if (!Array.isArray(parsed)) return decodeV1(parsed as Partial<WireV1>);
  if (parsed[0] !== V2) return null;

  const [
    ,
    id,
    host,
    kind,
    title,
    category,
    time,
    duration,
    place,
    note,
    activityId,
    tzOffset,
  ] = parsed;
  const startsAt = unpackTime(time);
  if (!str(id) || !str(host) || !str(title) || !startsAt) return null;

  const resolved =
    typeof category === "number" ? CATEGORIES[category] : (category as Category);
  if (!resolved) return null;

  return {
    id: str(id),
    host: str(host),
    kind: kind === 1 ? "date" : "hobby",
    title: str(title),
    activityId: str(activityId) || undefined,
    category: resolved,
    startsAt,
    durationMinutes:
      typeof duration === "number" && duration > 0 ? duration : 90,
    place: str(place),
    note: str(note),
    ...(typeof tzOffset === "number" && Number.isFinite(tzOffset)
      ? { tzOffset }
      : {}),
  };
}

/**
 * Invitations travel as https links on our own domain, not as `aspectniche://`.
 *
 * The custom scheme was the whole reason sharing was broken. Messaging apps do
 * not reliably turn an unknown scheme into something tappable — plenty render
 * it as grey text — and for anyone who has not installed the app, tapping it
 * does nothing at all. An invitation that only works if you already have the
 * app is not an invitation.
 *
 * An https link is always tappable, can carry a preview, and opens a real page
 * that shows the invitation and takes an answer. Where the app *is* installed
 * and the domain is associated, iOS hands the same link straight to it, so the
 * app path is unchanged — it is the fallback that is new.
 *
 * `APP_SCHEME` stays for links already sitting in people's message threads.
 */
const WEB_ORIGIN = "https://aspectniche.com";
export const APP_SCHEME = "aspectniche://";

export function inviteLink(invite: Invite): string {
  return `${WEB_ORIGIN}/i?d=${encodeInvite(invite)}`;
}

export function replyLink(
  inviteId: string,
  name: string,
  status: RsvpStatus,
): string {
  const n = encodeBase64Url(name);
  return `${WEB_ORIGIN}/r?i=${encodeURIComponent(inviteId)}&n=${n}&s=${status}`;
}

export function decodeReply(params: {
  i?: string;
  n?: string;
  s?: string;
}): Guest & { inviteId: string } | null {
  const { i, n, s } = params;
  if (!i || !n) return null;
  const status: RsvpStatus =
    s === "maybe" ? "maybe" : s === "out" ? "out" : "going";
  const name = decodeBase64Url(n).trim();
  if (!name) return null;
  return { inviteId: i, name, status, at: new Date().toISOString() };
}

/** A stable id that does not need a server or a uuid dependency. */
export function newInviteId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Wording
// ---------------------------------------------------------------------------

/** "Friday, Sept 18 · 9:00 PM" — the header line on the invitation card. */
export function formatInviteWhen(iso: string, tzOffset?: number): string {
  const d = new Date(iso);
  // No offset: an old link, so fall back to the reader's own zone. Wrong in
  // the ways `Invite.tzOffset` describes, and still better than refusing to
  // render a link somebody is holding.
  if (typeof tzOffset !== "number" || !Number.isFinite(tzOffset)) {
    const day = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const time = d
      .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      .toLowerCase();
    return `${day} · ${time}`;
  }
  // Shift the instant by the host's offset and read it back as UTC. The
  // portable way to render a fixed offset: `timeZone` takes IANA names, and
  // offset strings like "+04:00" are a recent addition that Hermes cannot be
  // relied on for. The locale stays the reader's — only the clock is the
  // host's.
  const shifted = new Date(d.getTime() + tzOffset * 60000);
  const day = shifted.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const time = shifted
    .toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    })
    .toLowerCase();
  return `${day} · ${time}`;
}

// There is deliberately no `inviteMessage` any more.
//
// The host used to send the whole invitation written out as text with the link
// as a footer, because at the time the link was an `aspectniche://` scheme with
// no page behind it: nothing could preview it, so the words had to carry the
// invitation on their own. Both halves of that have changed. The link is an
// https URL on our own domain, and `/i` renders the invitation and serves a
// per-invitation preview card — so the text was a second, worse copy of the
// card sitting directly above it in the same thread.
//
// The trade this accepts: a client that does not unfurl links now shows a bare
// URL. Every messaging app the feature is actually used in does unfurl.

/** The guest's reply, which is the link plus enough words to make sense alone. */
export function replyMessage(
  invite: Invite,
  name: string,
  status: RsvpStatus,
): string {
  return `${name}: ${rsvpLabel(status)} — ${invite.title}\n\n${replyLink(invite.id, name, status)}`;
}

/** "3 going · 1 maybe", or null when nobody has replied yet. */
export function guestSummary(guests: Guest[]): string | null {
  if (guests.length === 0) return null;
  const going = guests.filter((g) => g.status === "going").length;
  const maybe = guests.filter((g) => g.status === "maybe").length;
  const out = guests.filter((g) => g.status === "out").length;
  const parts: string[] = [];
  if (going) parts.push(`${going} going`);
  if (maybe) parts.push(`${maybe} maybe`);
  if (out) parts.push(`${out} out`);
  return parts.join(" · ");
}
