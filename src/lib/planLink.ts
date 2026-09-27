import { decodeBase64Url, encodeBase64Url, packBackground, unpackBackground } from "@/lib/invite";
import type {
  BudgetRange,
  DatePlan,
  GuestResponse,
  SharedDateExtras,
  TimeWindow,
} from "@/lib/planTypes";

// Sending a date plan, and getting an answer back.
//
// Plan a Date was built around handing someone your phone. That works when
// they are standing next to you and is the whole feature otherwise — there was
// no way to ask somebody who is not in the room. This is that way, and it
// borrows the invitation's shape exactly, because the constraint is the same:
// there is no server, so the proposal IS the link and the answer IS a second,
// shorter link.
//
// Two links rather than one round trip through an account. An account is
// optional here (CLAUDE.md, "accounts are optional twice over"), and a feature
// that only works when both people have signed in is not the feature; it is a
// second, worse version of it that most people never see.
//
// The wire format follows `invite.ts`'s: a positional array, a version marker,
// trailing blanks trimmed. Every key name would be paid for twice, once in the
// JSON and again in base64, and this link is longer than an invitation's to
// begin with — it carries a list of hobbies, a budget, meals and every time
// somebody offered.

const WEB_ORIGIN = "https://aspectniche.com";

/**
 * The first slot is a KIND marker, not just a version, and the two kinds must
 * never share a number.
 *
 * They did, briefly, and a test caught it: with both at 1, `decodePlan`
 * happily accepted a reply link and handed back a proposal built out of a
 * guest's votes. Two links that look alike travel in the same message threads
 * and get pasted into the same place, so telling them apart cannot rest on
 * which route the person happened to open.
 *
 * Bumped only if a position's meaning ever has to change; new fields append.
 */
const PLAN_V1 = 1;
const REPLY_V1 = 2;

/** Minutes since the epoch, base36 — same trick, and the same reason, as
 * `invite.ts`'s `packTime`: seconds are noise on a calendar. */
function packTime(iso: string): string {
  return Math.round(Date.parse(iso) / 60000).toString(36);
}

function unpackTime(packed: unknown): string | null {
  if (typeof packed !== "string") return null;
  const minutes = parseInt(packed, 36);
  if (!Number.isFinite(minutes)) return null;
  const d = new Date(minutes * 60000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/** Trailing blanks carry nothing; a short tail reads as empty on the way in. */
function trimTail(wire: unknown[], keepAtLeast: number): unknown[] {
  const out = [...wire];
  while (
    out.length > keepAtLeast &&
    (out[out.length - 1] === "" ||
      out[out.length - 1] == null ||
      (Array.isArray(out[out.length - 1]) &&
        (out[out.length - 1] as unknown[]).length === 0))
  ) {
    out.pop();
  }
  return out;
}

// ---------------------------------------------------------------------------
// The proposal
// ---------------------------------------------------------------------------

/**
 * Flags travel as a string of letters, never as a bitfield number.
 *
 * `trimTail` drops an empty string and KEEPS a numeric zero, so a numeric
 * field would sit on the end of every link that sets no flags at all. Letters
 * cost the same to read and vanish when there are none, which is what keeps
 * an unchanged plan encoding to an unchanged link.
 */
const FLAG_PUBLIC = "p";

/** On a reply only: the guest cannot make it. */
const FLAG_DECLINED = "d";

function packFlags(preferPublic: boolean | undefined, declined?: boolean): string {
  return `${preferPublic ? FLAG_PUBLIC : ""}${declined ? FLAG_DECLINED : ""}`;
}

function unpackPublic(v: unknown): boolean {
  return typeof v === "string" && v.includes(FLAG_PUBLIC);
}

function unpackDeclined(v: unknown): boolean {
  return typeof v === "string" && v.includes(FLAG_DECLINED);
}

// The shared extras, packed positionally like everything else here and
// appended at the END of the proposal, so a decoder from before them reads
// the rest unchanged. Each stop is [title, start, place, note, optional].
function packExtras(extras: SharedDateExtras | undefined): unknown {
  if (!extras) return "";
  return trimTail(
    [
      extras.meetAt,
      extras.meetUndecided ? 1 : 0,
      extras.note,
      extras.stops.map((s) =>
        trimTail([s.title, s.start ? packTime(s.start) : "", s.place, s.note, s.optional ? 1 : 0], 1),
      ),
      extras.bring,
      extras.wear,
      extras.access,
      packBackground(extras.background),
    ],
    0,
  );
}

function unpackExtras(v: unknown): SharedDateExtras | undefined {
  if (!Array.isArray(v) || v.length === 0) return undefined;
  const [meetAt, undecided, note, stops, bring, wear, access, background] = v;
  const bg = unpackBackground(background);
  return {
    meetAt: str(meetAt),
    meetUndecided: undecided === 1,
    note: str(note),
    stops: Array.isArray(stops)
      ? stops
          .filter((s): s is unknown[] => Array.isArray(s))
          .map((s) => {
            const start = s[1] ? unpackTime(s[1]) : null;
            return {
              title: str(s[0]),
              ...(start ? { start } : {}),
              place: str(s[2]),
              note: str(s[3]),
              ...(s[4] === 1 ? { optional: true } : {}),
            };
          })
      : [],
    bring: str(bring),
    wear: str(wear),
    access: str(access),
    ...(bg ? { background: bg } : {}),
  };
}

/** What the other person needs in order to answer. */
export type PlanProposalWire = {
  planId: string;
  inviterName: string;
  inviterInterestIds: string[];
  activityIds: string[];
  budget: BudgetRange;
  dinnerOptionIds: string[];
  windows: TimeWindow[];
  /** "" when the host named nothing. */
  title: string;
  preferPublic: boolean;
  /** Absent on links made before extras existed, or with nothing to show. */
  extras?: SharedDateExtras;
};

/**
 * `extras` is passed in rather than read from the plan: the host's copy
 * never stores them, and the only thing that builds them is an allowlist
 * (`sharedExtras` in the app).
 */
export function encodePlan(plan: DatePlan, extras?: SharedDateExtras): string {
  const wire: unknown[] = [
    PLAN_V1,
    plan.id,
    plan.inviter.name,
    plan.inviter.interestIds,
    plan.proposal.activityIds,
    plan.proposal.budget.min,
    plan.proposal.budget.max,
    plan.proposal.dinnerOptionIds,
    // A window is its id and its instant. The id travels because the ANSWER
    // refers to windows by id, and a guest's reply has to name something the
    // host's own copy of the plan will recognise.
    // The end appends INSIDE the tuple, so an older decoder reads the first
    // two entries and ignores a third it was never told about.
    plan.proposal.windows.map((w) =>
      w.end
        ? [w.id, packTime(w.start), packTime(w.end)]
        : [w.id, packTime(w.start)],
    ),
    plan.proposal.title ?? "",
    packFlags(plan.proposal.preferPublic),
    packExtras(extras),
  ];
  return encodeBase64Url(JSON.stringify(trimTail(wire, 7)));
}

export function decodePlan(encoded: string): PlanProposalWire | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeBase64Url(encoded));
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed[0] !== PLAN_V1) return null;
  const [, id, name, interestIds, activityIds, min, max, dinners, windows, title, flags, extras] =
    parsed;
  const planId = str(id);
  if (!planId) return null;

  const decodedWindows: TimeWindow[] = Array.isArray(windows)
    ? windows
        .map((w) => {
          if (!Array.isArray(w)) return null;
          const wid = str(w[0]);
          const start = unpackTime(w[1]);
          if (!wid || !start) return null;
          const end = w.length > 2 ? unpackTime(w[2]) : null;
          return end ? { id: wid, start, end } : { id: wid, start };
        })
        .filter((w): w is TimeWindow => w !== null)
    : [];

  return {
    planId,
    // "You" is what `newPlan` uses when nobody typed a name, and it is exactly
    // wrong on the receiving end — the guest would read "You invited you".
    inviterName: str(name).trim() && str(name) !== "You" ? str(name) : "",
    inviterInterestIds: strList(interestIds),
    activityIds: strList(activityIds),
    budget: { min: num(min, 0), max: num(max, 60) },
    dinnerOptionIds: strList(dinners),
    windows: decodedWindows,
    title: str(title),
    preferPublic: unpackPublic(flags),
    ...(unpackExtras(extras) ? { extras: unpackExtras(extras) } : {}),
  };
}

export function planLink(plan: DatePlan, extras?: SharedDateExtras): string {
  return `${WEB_ORIGIN}/p?d=${encodePlan(plan, extras)}`;
}

/**
 * Whether a plan has enough on it to be worth sending.
 *
 * Mirrors `isProposalReady` exactly, and deliberately. The two disagreed: that
 * one dropped its meal requirement when the "Food, if any" contradiction was
 * fixed, and this one kept it — so a plan the draft screen called ready was
 * one this refused to send, and the screen could offer no reason.
 *
 * Food is optional. "Climbing at two on Saturday" is a whole date, and
 * `mergePlan` already reads an empty meal list as a question nobody asked
 * rather than as a disagreement.
 */
//
// The something to do is a hobby from the catalogue or, since a date need not
// start from a hobby, the host's own words in the title.
export function isPlanSendable(plan: DatePlan): boolean {
  return (
    (plan.proposal.activityIds.length > 0 || !!plan.proposal.title?.trim()) &&
    plan.proposal.windows.length > 0
  );
}

// ---------------------------------------------------------------------------
// The answer
// ---------------------------------------------------------------------------

export type PlanReplyWire = {
  planId: string;
  guestName: string;
  guestInterestIds: string[];
  response: GuestResponse;
};

/**
 * Votes travel as two lists rather than a map.
 *
 * `activityVotes` is `Record<string, "up" | "down">`, and an object in JSON
 * pays for every key twice over. Splitting it into the ids voted up and the
 * ids voted down carries the same information in a fraction of the characters,
 * and an id in neither list is the neutral the type already allows.
 */
export function encodePlanReply(
  planId: string,
  guestName: string,
  guestInterestIds: string[],
  response: GuestResponse,
): string {
  const up: string[] = [];
  const down: string[] = [];
  for (const [id, vote] of Object.entries(response.activityVotes)) {
    (vote === "up" ? up : down).push(id);
  }
  const wire: unknown[] = [
    REPLY_V1,
    planId,
    guestName,
    guestInterestIds,
    up,
    down,
    response.budget.min,
    response.budget.max,
    response.dinnerVotes,
    response.windowVotes,
    packFlags(response.preferPublic, response.declined),
    response.suggestion ?? "",
  ];
  return encodeBase64Url(JSON.stringify(trimTail(wire, 3)));
}

export function decodePlanReply(encoded: string): PlanReplyWire | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeBase64Url(encoded));
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed[0] !== REPLY_V1) return null;
  const [, id, name, interestIds, up, down, min, max, dinners, windows, flags, suggestion] =
    parsed;
  const planId = str(id);
  if (!planId) return null;

  const activityVotes: Record<string, "up" | "down"> = {};
  for (const a of strList(up)) activityVotes[a] = "up";
  // Down after up, so a malformed link that lists the same id in both ends up
  // with the cautious answer rather than depending on key order.
  for (const a of strList(down)) activityVotes[a] = "down";

  return {
    planId,
    guestName: str(name).trim(),
    guestInterestIds: strList(interestIds),
    response: {
      activityVotes,
      budget: { min: num(min, 0), max: num(max, 60) },
      dinnerVotes: strList(dinners),
      windowVotes: strList(windows),
      // Spread rather than set, so a guest who asked for nothing decodes to a
      // response with no such key. `preferPublic` is optional, absent and
      // false mean the same thing to `mergePlan`, and decode(encode(x)) === x
      // is a property two tests already hold this file to.
      ...(unpackPublic(flags) ? { preferPublic: true } : {}),
      ...(unpackDeclined(flags) ? { declined: true } : {}),
      ...(str(suggestion).trim() ? { suggestion: str(suggestion).trim().slice(0, 200) } : {}),
    },
  };
}

export function planReplyLink(
  planId: string,
  guestName: string,
  guestInterestIds: string[],
  response: GuestResponse,
): string {
  return `${WEB_ORIGIN}/pr?d=${encodePlanReply(planId, guestName, guestInterestIds, response)}`;
}

/**
 * Rebuilds the host's plan from an answer that came back.
 *
 * The host already holds the proposal; the reply carries only the guest's half.
 * Applying it here rather than in the screen keeps the one rule that matters
 * testable: a reply for a DIFFERENT plan is refused rather than pasted over
 * the plan you happen to have open.
 */
export function applyPlanReply(
  plan: DatePlan,
  reply: PlanReplyWire,
): DatePlan | null {
  if (plan.id !== reply.planId) return null;
  return {
    ...plan,
    status: "responded",
    guest: {
      name: reply.guestName || "Them",
      interestIds: reply.guestInterestIds,
    },
    response: reply.response,
  };
}
