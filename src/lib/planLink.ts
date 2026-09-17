import { decodeBase64Url, encodeBase64Url } from "@/lib/invite";
import type {
  BudgetRange,
  DatePlan,
  GuestResponse,
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

/** What the other person needs in order to answer. */
export type PlanProposalWire = {
  planId: string;
  inviterName: string;
  inviterInterestIds: string[];
  activityIds: string[];
  budget: BudgetRange;
  dinnerOptionIds: string[];
  windows: TimeWindow[];
};

export function encodePlan(plan: DatePlan): string {
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
    plan.proposal.windows.map((w) => [w.id, packTime(w.start)]),
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
  const [, id, name, interestIds, activityIds, min, max, dinners, windows] = parsed;
  const planId = str(id);
  if (!planId) return null;

  const decodedWindows: TimeWindow[] = Array.isArray(windows)
    ? windows
        .map((w) => {
          if (!Array.isArray(w)) return null;
          const wid = str(w[0]);
          const start = unpackTime(w[1]);
          return wid && start ? { id: wid, start } : null;
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
  };
}

export function planLink(plan: DatePlan): string {
  return `${WEB_ORIGIN}/p?d=${encodePlan(plan)}`;
}

/** Whether a plan has enough on it to be worth sending. Mirrors the screen's
 * own readiness rule: something to do, something to eat, some time to do it. */
export function isPlanSendable(plan: DatePlan): boolean {
  return (
    plan.proposal.activityIds.length > 0 &&
    plan.proposal.dinnerOptionIds.length > 0 &&
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
  const [, id, name, interestIds, up, down, min, max, dinners, windows] = parsed;
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
