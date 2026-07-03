// Deterministic plan convergence — no AI anywhere in this path. Given the
// inviter's proposal and the guest's response, derive the shared plan and
// name every conflict explicitly so the UI can offer a resolution (no dead
// ends). Ties break by proposal order, so merges are repeatable.

import { interests } from "@/data/activities";
import type { BudgetRange, DatePlan } from "./store";

export type MergedPlan = {
  sharedInterestIds: string[];
  /** Interests only one side picked (for the overlap graph). */
  inviterOnlyIds: string[];
  guestOnlyIds: string[];
  activityId: string | null;
  activityNote: "both-in" | "shared-interest" | "needs-pick";
  budget: BudgetRange | null;
  budgetConflict: boolean;
  dinnerId: string | null;
  dinnerConflict: boolean;
  windowId: string | null;
  timeConflict: boolean;
};

function interestOfActivity(activityId: string): string | null {
  return interests.find((i) => i.activityIds.includes(activityId))?.id ?? null;
}

export function mergePlan(plan: DatePlan): MergedPlan {
  const proposal = plan.proposal;
  const response = plan.response;
  const inviterInterests = plan.inviter.interestIds;
  const guestInterests = plan.guest?.interestIds ?? [];

  const guestSet = new Set(guestInterests);
  const sharedInterestIds = inviterInterests.filter((id) => guestSet.has(id));
  const sharedSet = new Set(sharedInterestIds);
  const inviterOnlyIds = inviterInterests.filter((id) => !sharedSet.has(id));
  const guestOnlyIds = guestInterests.filter((id) => !sharedSet.has(id));

  // ── Activity: guest-approved first, shared-interest boost, stable order ──
  const votes = response?.activityVotes ?? {};
  const scored = proposal.activityIds
    .filter((id) => votes[id] !== "down")
    .map((id, index) => {
      const inShared = sharedSet.has(interestOfActivity(id) ?? "");
      let score = 0;
      if (votes[id] === "up") score += 2;
      if (inShared) score += 1;
      return { id, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const top = scored[0] ?? null;
  const activityId = top?.id ?? null;
  const activityNote: MergedPlan["activityNote"] =
    top && votes[top.id] === "up"
      ? "both-in"
      : top && sharedSet.has(interestOfActivity(top.id) ?? "")
        ? "shared-interest"
        : "needs-pick";

  // ── Budget: intersection of the two ranges ──
  let budget: BudgetRange | null = null;
  let budgetConflict = false;
  if (response) {
    const min = Math.max(proposal.budget.min, response.budget.min);
    const max = Math.min(proposal.budget.max, response.budget.max);
    if (min <= max) budget = { min, max };
    else budgetConflict = true;
  } else {
    budget = proposal.budget;
  }

  // ── Dinner: first option both picked ──
  const dinnerVotes = new Set(response?.dinnerVotes ?? []);
  const dinnerId =
    proposal.dinnerOptionIds.find((id) => dinnerVotes.has(id)) ?? null;
  const dinnerConflict = response != null && dinnerId === null;

  // ── Time: first proposed window that works for the guest ──
  const windowVotes = new Set(response?.windowVotes ?? []);
  const windowId =
    proposal.windows.find((w) => windowVotes.has(w.id))?.id ?? null;
  const timeConflict = response != null && windowId === null;

  return {
    sharedInterestIds,
    inviterOnlyIds,
    guestOnlyIds,
    activityId,
    activityNote,
    budget,
    budgetConflict,
    dinnerId,
    dinnerConflict,
    windowId,
    timeConflict,
  };
}

/** The merged result with any manual resolutions applied on top. */
export function resolvedPlan(plan: DatePlan): MergedPlan {
  const merged = mergePlan(plan);
  const r = plan.resolutions;
  if (!r) return merged;
  return {
    ...merged,
    activityId: r.activityId ?? merged.activityId,
    activityNote: r.activityId ? "both-in" : merged.activityNote,
    dinnerId: r.dinnerId ?? merged.dinnerId,
    dinnerConflict: r.dinnerId ? false : merged.dinnerConflict,
    windowId: r.windowId ?? merged.windowId,
    timeConflict: r.windowId ? false : merged.timeConflict,
    budget: r.budget ?? merged.budget,
    budgetConflict: r.budget ? false : merged.budgetConflict,
  };
}
