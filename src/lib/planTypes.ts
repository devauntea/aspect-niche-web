// The shapes a date plan is made of, and nothing else.
//
// Split out of `plan.ts` because these types travel: `planLink.ts` encodes
// them into a link, and that file exists in this repo AND in the web one that
// renders the link's page. A types-only module with no imports of its own is
// what lets all three be copied across byte for byte — `plan.ts` still holds
// the merge, which needs the catalogue and stays here.
//
// See `scripts/check-invite-parity.sh` for what keeps the copies in step.

export type BudgetRange = { min: number; max: number };

export type TimeWindow = {
  id: string;
  /** ISO 8601 instant. */
  start: string;
  /**
   * When it is over, ISO 8601. Absent when the host named no end.
   *
   * Optional, and required by nobody. Every dating-safety source names a
   * predetermined end time as the thing that makes a first meeting easy to
   * leave — so the field exists for the person who wants one, rather than as
   * a question the app puts to everybody.
   */
  end?: string;
};

export type PlanParticipant = {
  name: string;
  interestIds: string[];
};

export type PlanStatus = "draft" | "invited" | "responded" | "merged";

export type GuestResponse = {
  /** "up" = sounds fun, "down" = pass. Unvoted candidates are neutral. */
  activityVotes: Record<string, "up" | "down">;
  budget: BudgetRange;
  dinnerVotes: string[];
  /** Window ids that work for the guest. */
  windowVotes: string[];
  /**
   * The guest asked to meet somewhere public.
   *
   * Merges by OR, not by agreement: either person asking settles it. A safety
   * preference is a floor rather than a negotiation — the opposite of budget,
   * which intersects, and of a meal, which both have to pick.
   */
  preferPublic?: boolean;
};

export type DatePlan = {
  id: string;
  createdAt: number;
  status: PlanStatus;
  inviter: PlanParticipant;
  guest?: PlanParticipant;
  proposal: {
    activityIds: string[];
    budget: BudgetRange;
    /**
     * Which meals are on the table — breakfast through drinks, from
     * data/mealOptions.
     *
     * Still called "dinner" because the name is written into every plan
     * already on a device. Renaming the field would read those back as a plan
     * with no meal picked, which is a worse outcome than a field whose name is
     * a version behind its meaning.
     */
    dinnerOptionIds: string[];
    /**
     * What the host called this plan. Absent when they named nothing.
     *
     * Never written automatically. A suggested title that applied itself
     * would occupy its slot in every link ever encoded, which is the one
     * thing an appending wire format exists to avoid — and a joke nobody
     * chose is worse than no joke.
     */
    title?: string;
    /** The host asked to meet somewhere public. See `GuestResponse`. */
    preferPublic?: boolean;
    windows: TimeWindow[];
  };
  response?: GuestResponse;
  /** Manual conflict resolutions picked on the merged screen. */
  resolutions?: {
    activityId?: string;
    dinnerId?: string;
    windowId?: string;
    budget?: BudgetRange;
  };
};
