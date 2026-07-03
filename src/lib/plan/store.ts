// PlanStore — the swappable persistence seam for Plan a Date (Track D).
//
// The interface is async on purpose: the localStorage adapter below resolves
// instantly, but a real backend (Vercel KV / Upstash / Supabase) implements
// the exact same contract, so cross-device invites drop in without touching
// any UI. Components must only ever talk to a `PlanStore`.

export type BudgetRange = { min: number; max: number };

export type TimeWindow = {
  id: string;
  /** datetime-local string (inviter's local time). */
  start: string;
};

export type PlanParticipant = {
  name: string;
  /** Optional — enables real calendar invites (ATTENDEE/ORGANIZER). */
  email?: string;
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
    dinnerOptionIds: string[];
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

export interface PlanStore {
  get(id: string): Promise<DatePlan | null>;
  save(plan: DatePlan): Promise<void>;
  remove(id: string): Promise<void>;
  /** The most recently saved plan id on this device, for resume. */
  latestId(): Promise<string | null>;
}

const PLANS_KEY = "an-date-plans";
const LATEST_KEY = "an-date-plan-latest";

function readAll(): Record<string, DatePlan> {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DatePlan>) : {};
  } catch {
    return {};
  }
}

function writeAll(plans: Record<string, DatePlan>) {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch {}
}

/** Same-device adapter. A backend adapter replaces this object, nothing else. */
export const localPlanStore: PlanStore = {
  async get(id) {
    return readAll()[id] ?? null;
  },
  async save(plan) {
    const all = readAll();
    all[plan.id] = plan;
    writeAll(all);
    try {
      localStorage.setItem(LATEST_KEY, plan.id);
    } catch {}
  },
  async remove(id) {
    const all = readAll();
    delete all[id];
    writeAll(all);
    try {
      if (localStorage.getItem(LATEST_KEY) === id)
        localStorage.removeItem(LATEST_KEY);
    } catch {}
  },
  async latestId() {
    try {
      return localStorage.getItem(LATEST_KEY);
    } catch {
      return null;
    }
  },
};

/** Short shareable code, e.g. "date-K3F9QZ". */
export function newPlanId(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `date-${code}`;
}
