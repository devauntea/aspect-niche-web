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
    if (b < 0x80) (cp = b), (i += 1);
    else if (b < 0xe0) (cp = ((b & 31) << 6) | (bytes[i + 1] & 63)), (i += 2);
    else if (b < 0xf0)
      (cp =
        ((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63)),
        (i += 3);
    else
      (cp =
        ((b & 7) << 18) |
        ((bytes[i + 1] & 63) << 12) |
        ((bytes[i + 2] & 63) << 6) |
        (bytes[i + 3] & 63)),
        (i += 4);
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
 *  already out there. It used to live in the theme registry the web demo drew
 *  its palette from; that registry went with the demo, and this is now the only
 *  definition, with the type derived from the list so the two cannot drift. */
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

  const [, id, host, kind, title, category, time, duration, place, note, activityId] =
    parsed;
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
  };
}

/** The app's own scheme, so a tapped link opens the invitation rather than a page. */
const SCHEME = "aspectniche://";

export function inviteLink(invite: Invite): string {
  return `${SCHEME}invite?d=${encodeInvite(invite)}`;
}

export function replyLink(
  inviteId: string,
  name: string,
  status: RsvpStatus,
): string {
  const n = encodeBase64Url(name);
  return `${SCHEME}rsvp?i=${encodeURIComponent(inviteId)}&n=${n}&s=${status}`;
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
export function formatInviteWhen(iso: string): string {
  const d = new Date(iso);
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

/** The message body the host sends alongside the link. */
/**
 * What actually gets sent.
 *
 * The invitation has to read as an invitation in the message bubble itself,
 * because the link cannot show a preview — there is no page behind it to
 * preview, only the app. So the words carry it and the link is a footer: the
 * whole thing is legible to someone who never taps it.
 *
 * The last line says what tapping does. Without it a long opaque URL from a
 * friend looks like something you should not tap, which is the opposite of the
 * intention.
 */
export function inviteMessage(invite: Invite): string {
  const lines = [
    `${invite.host} invited you to ${invite.title}`,
    formatInviteWhen(invite.startsAt),
  ];
  if (invite.place) lines.push(invite.place);
  if (invite.note) lines.push("", invite.note);
  lines.push("", "Tap to see it and reply:", inviteLink(invite));
  return lines.join("\n");
}

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
