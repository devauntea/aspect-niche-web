// A series: one pinned link for a game that happens again and again.
//
// An invitation is a one-off, so its link can carry the whole event. A
// weekly game's link sits in a group chat for months while the host cancels
// a week, moves one and changes the field, and a link cannot change once it
// is sent. So a series lives on the server and the link carries only an id;
// this file is everything about it that is not I/O.
//
// IT IMPORTS NOTHING, on purpose. Three copies run: this one, a byte copy in
// supabase/functions/_shared for the edge function (Deno), and one in the web
// repo for /s. Any import would have to resolve in all three. The category is
// a plain string for that reason, and the background is the packed string
// lib/invite's `packBackground` already makes.
//
// A GAME IS KEYED BY ITS ORIGINAL DATE, in the host's zone, and that key
// never changes: moving Thursday's game to Friday leaves it "2026-10-15",
// so answers already given for it stay attached to it.
//
// TIMES ARE WALL-CLOCK in a named zone. A weekly 7pm is 7pm in March and in
// November; an offset (what invitations carry) is right for one instant and
// wrong for half a year of games.

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0

export type Repeat =
  | { kind: "weekly"; every: 1 | 2; weekdays: Weekday[] }
  | { kind: "monthly"; nth: 1 | 2 | 3 | 4 | -1; weekday: Weekday };

export type GameChange = { cancelled: true } | { startsAt: string; place?: string };

export type SeriesStatus = "going" | "maybe" | "out";

/** What is stored. The id is the database row's key, not part of the document. */
export type SeriesDoc = {
  host: string;
  title: string;
  activityId?: string;
  category: string;
  place: string;
  note: string;
  /** Host-local "YYYY-MM-DD": the first day a game can fall on. */
  startDate: string;
  /** Inclusive, host-local. */
  endDate?: string;
  /** Host-local "HH:MM". */
  time: string;
  durationMinutes: number;
  /** IANA, e.g. "America/New_York". */
  timeZone: string;
  repeat: Repeat;
  /** Keyed by a game's ORIGINAL date. */
  changes: Record<string, GameChange>;
  /** `packBackground()` output from lib/invite. */
  bg?: string;
  ended?: boolean;
  /** False when the host turned off "Remind people who haven't answered". Absent means on. */
  nudges?: false;
};

export type Series = SeriesDoc & { id: string };

export type Game = {
  date: string;
  startsAt: string;
  place: string;
  cancelled: boolean;
  moved: boolean;
};

export type SeriesAnswer = { game: string; name: string; status: SeriesStatus };

export type Roster = {
  /** Answered going for this game, then usually-in names that said nothing. */
  going: string[];
  maybe: string[];
  out: string[];
  /** The usually-in names counted in `going` without answering this game. */
  usualOnly: string[];
};

/** The `game` of an "I'm usually in" answer. */
export const USUAL = "usual";
export const MAX_SERIES_MEMBERS = 40;
export const MAX_OWNED_SERIES = 10;
/** The server's number only stops scripts; the app stops first and says why. */
export const SERVER_MAX_OWNED_SERIES = 20;
export const MAX_SERIES_CHANGES = 60;
export const MAX_SERIES_BYTES = 8192;
export const MAX_SERIES_TITLE = 80;
export const MAX_SERIES_PLACE = 160;
export const MAX_SERIES_NOTE = 500;
export const MAX_SERIES_NAME = 60;
export const ANSWER_RETENTION_DAYS = 90;
/** How many games a screen lists. */
export const UPCOMING_GAMES = 6;
/** How far ahead somebody may answer. */
export const ANSWERABLE_GAMES = 12;
export const SERIES_ORIGIN = "https://aspectniche.com";

const DAY = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function seriesLink(id: string): string {
  return `${SERIES_ORIGIN}/s?id=${encodeURIComponent(id)}`;
}

// --- Calendar dates. A date here is a label, so the arithmetic is in UTC. ---

function dayNumber(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
}

function dateOf(n: number): string {
  return new Date(n * DAY).toISOString().slice(0, 10);
}

function weekdayOf(n: number): Weekday {
  return new Date(n * DAY).getUTCDay() as Weekday;
}

function isRealDate(date: string): boolean {
  return DATE_RE.test(date) && dateOf(dayNumber(date)) === date;
}

// --- Wall clock and instants. ---

function zoneParts(instant: number, timeZone: string): Record<string, number> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const out: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") out[p.type] = Number(p.value);
  // Some engines write midnight as 24 under hour12: false.
  out.hour = (out.hour ?? 0) % 24;
  return out;
}

function offsetMinutes(instant: number, timeZone: string): number {
  const p = zoneParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(instant / 1000) * 1000) / 60_000);
}

/**
 * The instant a host-local date and time names. Two passes: the first guess
 * uses the offset at the wrong instant, the second corrects it, which also
 * settles the hour a DST change skips or repeats.
 */
export function wallTimeToInstant(date: string, time: string, timeZone: string): number {
  const [h, m] = time.split(":").map(Number);
  const wall = dayNumber(date) * DAY + (h * 60 + m) * 60_000;
  const first = wall - offsetMinutes(wall, timeZone) * 60_000;
  return wall - offsetMinutes(first, timeZone) * 60_000;
}

/** The host-local date and time of an instant: what the composer stores. */
export function localDateAndTime(instant: number, timeZone: string): { date: string; time: string } {
  const p = zoneParts(instant, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
}

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || !tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// --- The rule. ---

const weekStart = (n: number) => n - weekdayOf(n);

/** The first day on or after the start that the weekly rule's days include. */
function firstWeeklyDay(start: number, weekdays: Weekday[]): number {
  for (let n = start; n < start + 7; n += 1) if (weekdays.includes(weekdayOf(n))) return n;
  return start;
}

function isGameDay(doc: SeriesDoc, n: number): boolean {
  const start = dayNumber(doc.startDate);
  if (n < start) return false;
  if (doc.endDate && n > dayNumber(doc.endDate)) return false;
  const wd = weekdayOf(n);
  const r = doc.repeat;
  if (r.kind === "weekly") {
    if (!r.weekdays.includes(wd)) return false;
    if (r.every === 1) return true;
    // Counted from the week of the FIRST game, so a Tuesday game created on
    // a Saturday starts that coming Tuesday rather than a week later.
    const anchor = weekStart(firstWeeklyDay(start, r.weekdays));
    return Math.round((weekStart(n) - anchor) / 7) % 2 === 0;
  }
  if (wd !== r.weekday) return false;
  const d = new Date(n * DAY);
  const day = d.getUTCDate();
  if (r.nth === -1) {
    const daysInMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    return day + 7 > daysInMonth;
  }
  return Math.ceil(day / 7) === r.nth;
}

/**
 * Every game whose (possibly moved) start falls in the window, with changes
 * applied. Cancelled games are INCLUDED and marked, so the host can see and
 * restore them; anything showing games to attend uses `nextGames`.
 */
export function gamesBetween(doc: SeriesDoc, fromMs: number, toMs: number): Game[] {
  const out: Game[] = [];
  const emitted = new Set<string>();
  const first = Math.max(dayNumber(doc.startDate), Math.floor(fromMs / DAY) - 2);
  const end = doc.endDate ? dayNumber(doc.endDate) : Number.POSITIVE_INFINITY;
  const last = Math.min(end, Math.floor(toMs / DAY) + 2, first + 800);
  for (let n = first; n <= last; n += 1) {
    if (!isGameDay(doc, n)) continue;
    const date = dateOf(n);
    const change = doc.changes[date];
    const moved = !!change && "startsAt" in change;
    const startsAt = moved
      ? change.startsAt
      : new Date(wallTimeToInstant(date, doc.time, doc.timeZone)).toISOString();
    const when = Date.parse(startsAt);
    if (when < fromMs || when > toMs) continue;
    if (!emitted.has(date)) {
      out.push({
        date,
        startsAt,
        place: moved && change.place ? change.place : doc.place,
        cancelled: !!change && "cancelled" in change,
        moved,
      });
      emitted.add(date);
    }
  }
  // Also check moved games whose original dates are outside the scan window
  for (const [dateStr, change] of Object.entries(doc.changes)) {
    if (!("startsAt" in change) || emitted.has(dateStr)) continue;
    if (!isRealDate(dateStr)) continue;
    // A moved key must still be a day the rule produces (this also covers
    // startDate and endDate).
    if (!isGameDay(doc, dayNumber(dateStr))) continue;
    const when = Date.parse(change.startsAt);
    if (when < fromMs || when > toMs) continue;
    out.push({
      date: dateStr,
      startsAt: change.startsAt,
      place: change.place || doc.place,
      cancelled: false,
      moved: true,
    });
    emitted.add(dateStr);
  }
  return out.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

/** The next games to turn up to: not cancelled, not finished. */
export function nextGames(doc: SeriesDoc, now: number, count: number): Game[] {
  if (doc.ended) return [];
  const span = doc.durationMinutes * 60_000;
  return gamesBetween(doc, now - span, now + 400 * DAY)
    .filter((g) => !g.cancelled && Date.parse(g.startsAt) + span > now)
    .slice(0, count);
}

// --- Names and answers. ---

export function cleanSeriesName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim().replace(/\s+/g, " ").slice(0, MAX_SERIES_NAME).trim();
  return name || null;
}

/** Everyone who has answered anything, case-insensitively, first spelling kept. */
export function memberNames(answers: SeriesAnswer[]): string[] {
  const seen = new Map<string, string>();
  for (const a of answers) {
    const key = a.name.toLowerCase();
    if (!seen.has(key)) seen.set(key, a.name);
  }
  return [...seen.values()];
}

/** "sam" answering where "Sam" already has is Sam, not a second person. */
export function canonicalName(answers: SeriesAnswer[], name: string): string {
  const key = name.toLowerCase();
  return memberNames(answers).find((n) => n.toLowerCase() === key) ?? name;
}

/** Room for this name: it is already in, or the group is under the cap. */
export function mayAnswer(answers: SeriesAnswer[], name: string): boolean {
  const names = memberNames(answers);
  const key = name.toLowerCase();
  return names.some((n) => n.toLowerCase() === key) || names.length < MAX_SERIES_MEMBERS;
}

export function fullMessage(host: string): string {
  return `This group is full (${MAX_SERIES_MEMBERS} people). Ask ${host} to make room.`;
}

export function effectiveStatus(answers: SeriesAnswer[], name: string, game: string): SeriesStatus | null {
  const key = name.toLowerCase();
  const mine = answers.filter((a) => a.name.toLowerCase() === key);
  const forGame = mine.find((a) => a.game === game);
  if (forGame) return forGame.status;
  return mine.some((a) => a.game === USUAL) ? "going" : null;
}

export function roster(answers: SeriesAnswer[], game: string): Roster {
  const explicit = answers.filter((a) => a.game === game);
  const answered = new Set(explicit.map((a) => a.name.toLowerCase()));
  const usualOnly = answers
    .filter((a) => a.game === USUAL && !answered.has(a.name.toLowerCase()))
    .map((a) => a.name);
  const by = (s: SeriesStatus) => explicit.filter((a) => a.status === s).map((a) => a.name);
  return { going: [...by("going"), ...usualOnly], maybe: by("maybe"), out: by("out"), usualOnly };
}

/** Answers for games before this date are deleted on the next write. */
export function answerHorizon(now: number): string {
  return dateOf(Math.floor(now / DAY) - ANSWER_RETENTION_DAYS);
}

// --- Words. ---

export function formatGameWhen(startsAt: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(new Date(startsAt))
    .replace(/\u202f/g, " ");
}

const NTH_WORD: Record<string, string> = { "1": "First", "2": "Second", "3": "Third", "4": "Fourth", "-1": "Last" };

export function repeatLabel(repeat: Repeat): string {
  if (repeat.kind === "monthly") return `${NTH_WORD[String(repeat.nth)]} ${DAY_NAMES[repeat.weekday]} of the month`;
  const days = [...repeat.weekdays].sort((a, b) => a - b).map((d) => DAY_NAMES[d]);
  const list = days.length <= 1 ? days.join("") : `${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}`;
  return repeat.every === 2 ? `Every other ${list}` : `Every ${list}`;
}

/** The message "Nudge the chat" shares. The app never sends it itself. */
export function nudgeMessage(series: Series, game: Game, r: Roster): string {
  const where = game.place ? ` at ${game.place}` : "";
  return `${series.title}, ${formatGameWhen(game.startsAt, series.timeZone)}${where}. ${r.going.length} in so far. Tap to say if you're in: ${seriesLink(series.id)}`;
}

// --- Validation, shared by the app, the function and the page. ---

function utf8Length(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff) {
      bytes += 4;
      i += 1;
    } else bytes += 3;
  }
  return bytes;
}

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim().length <= max ? v.trim() : null;

function validRepeat(raw: unknown): Repeat | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const isDay = (d: unknown): d is Weekday => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6;
  if (r.kind === "weekly") {
    if (r.every !== 1 && r.every !== 2) return null;
    if (!Array.isArray(r.weekdays) || r.weekdays.length < 1 || r.weekdays.length > 7) return null;
    if (!r.weekdays.every(isDay) || new Set(r.weekdays).size !== r.weekdays.length) return null;
    return { kind: "weekly", every: r.every, weekdays: [...(r.weekdays as Weekday[])].sort((a, b) => a - b) };
  }
  if (r.kind === "monthly") {
    if (![1, 2, 3, 4, -1].includes(r.nth as number) || !isDay(r.weekday)) return null;
    return { kind: "monthly", nth: r.nth as 1 | 2 | 3 | 4 | -1, weekday: r.weekday };
  }
  return null;
}

function validChanges(raw: unknown): Record<string, GameChange> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > MAX_SERIES_CHANGES) return null;
  const out: Record<string, GameChange> = {};
  for (const [date, value] of entries) {
    if (!isRealDate(date) || !value || typeof value !== "object") return null;
    const v = value as Record<string, unknown>;
    if (v.cancelled === true) {
      out[date] = { cancelled: true };
      continue;
    }
    if (typeof v.startsAt !== "string" || Number.isNaN(Date.parse(v.startsAt))) return null;
    const place = v.place === undefined ? undefined : str(v.place, MAX_SERIES_PLACE);
    if (place === null) return null;
    out[date] = { startsAt: new Date(v.startsAt).toISOString(), ...(place ? { place } : {}) };
  }
  return out;
}

/**
 * A stored or submitted document, or null. Builds a fresh object field by
 * field, so nothing it does not know about is ever kept.
 */
export function validateSeriesDoc(raw: unknown): SeriesDoc | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const host = cleanSeriesName(r.host);
  const title = str(r.title, MAX_SERIES_TITLE);
  const place = str(r.place ?? "", MAX_SERIES_PLACE);
  const note = str(r.note ?? "", MAX_SERIES_NOTE);
  const category = str(r.category, 32);
  if (!host || !title || place === null || note === null || !category) return null;
  if (typeof r.startDate !== "string" || !isRealDate(r.startDate)) return null;
  if (r.endDate !== undefined && (typeof r.endDate !== "string" || !isRealDate(r.endDate) || r.endDate < r.startDate)) return null;
  if (typeof r.time !== "string" || !TIME_RE.test(r.time)) return null;
  const minutes = r.durationMinutes;
  if (!Number.isInteger(minutes) || (minutes as number) < 15 || (minutes as number) > 720) return null;
  if (!isValidTimeZone(r.timeZone)) return null;
  const repeat = validRepeat(r.repeat);
  const changes = validChanges(r.changes ?? {});
  if (!repeat || !changes) return null;
  if (r.activityId !== undefined && (typeof r.activityId !== "string" || r.activityId.length > 64)) return null;
  if (r.bg !== undefined && (typeof r.bg !== "string" || r.bg.length > 200)) return null;
  if (r.nudges !== undefined && typeof r.nudges !== "boolean") return null;

  const out: SeriesDoc = {
    host,
    title,
    ...(typeof r.activityId === "string" && r.activityId ? { activityId: r.activityId } : {}),
    category,
    place,
    note,
    startDate: r.startDate,
    ...(typeof r.endDate === "string" ? { endDate: r.endDate } : {}),
    time: r.time,
    durationMinutes: minutes as number,
    timeZone: r.timeZone as string,
    repeat,
    changes,
    ...(typeof r.bg === "string" && r.bg ? { bg: r.bg } : {}),
    ...(r.ended === true ? { ended: true } : {}),
    ...(r.nudges === false ? { nudges: false as const } : {}),
  };
  return utf8Length(JSON.stringify(out)) <= MAX_SERIES_BYTES ? out : null;
}
