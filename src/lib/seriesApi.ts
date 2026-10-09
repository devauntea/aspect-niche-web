import { validateSeriesDoc, type Series, type SeriesAnswer, type SeriesStatus } from "@/lib/series";

// The web side of the `series` function. Deployed without JWT checks, so no
// key travels from the browser; the function's own rules are the guard.

export type SeriesPage = { series: Series; answers: SeriesAnswer[]; members: number };

const endpoint = () => `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/functions/v1/series`;

async function post(body: Record<string, unknown>): Promise<{ status: number; data: Record<string, unknown> | null }> {
  try {
    const r = await fetch(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return { status: r.status, data: (await r.json().catch(() => null)) as Record<string, unknown> | null };
  } catch {
    return { status: 0, data: null };
  }
}

const isAnswer = (a: unknown): a is SeriesAnswer => {
  const x = a as Record<string, unknown> | null;
  return (
    !!x &&
    typeof x.game === "string" &&
    typeof x.name === "string" &&
    (x.status === "going" || x.status === "maybe" || x.status === "out")
  );
};

/**
 * "missing" is only the function saying it does not know this id (or the id
 * is malformed). Any other 404 -- the function not deployed, a bad URL -- is
 * "failed": telling a guest the host deleted their series because of an
 * outage would be a false claim about the host.
 */
export async function getSeries(id: string): Promise<SeriesPage | "missing" | "failed"> {
  const r = await post({ action: "get", id });
  if (r.status === 400 || (r.status === 404 && r.data?.error === "unknown series")) return "missing";
  if (r.status !== 200 || !r.data) return "failed";
  const doc = validateSeriesDoc(r.data.series);
  if (!doc) return "failed";
  return {
    series: { ...doc, id },
    answers: Array.isArray(r.data.answers) ? r.data.answers.filter(isAnswer) : [],
    members: typeof r.data.members === "number" ? r.data.members : 0,
  };
}

export type AnswerResult = { ok: true; name: string | null } | { ok: false; message: string };

/** `name` on success is the spelling the server kept; adopt it. */
export async function sendAnswer(
  id: string,
  game: string,
  name: string,
  status: SeriesStatus | null,
): Promise<AnswerResult> {
  const r = await post(status ? { action: "answer", id, game, name, status } : { action: "clear", id, game, name });
  const retry = { ok: false, message: "Could not save your answer. Try again." } as const;
  // A 200 whose body cannot be read is not evidence the answer was kept.
  if (r.status === 200) {
    if (!r.data || r.data.ok !== true) return retry;
    return { ok: true, name: typeof r.data.name === "string" ? r.data.name : null };
  }
  if (r.status === 409 && r.data?.error === "this series has ended") {
    return { ok: false, message: "This series has ended." };
  }
  if (r.status === 409 && r.data?.full === true && typeof r.data.error === "string") {
    return { ok: false, message: r.data.error };
  }
  if (r.status === 400) return { ok: false, message: "That game is no longer open for answers." };
  if (r.status === 404 && r.data?.error === "unknown series") {
    return { ok: false, message: "This plan no longer exists." };
  }
  return retry;
}

export type LeaveResult = { ok: true; removed: number } | { ok: false; message: string };

/**
 * "Take back my answers": every answer under this name, played games
 * included -- the page shows only the games still to come, and an answer to
 * last week's game is what keeps a name on the list. `removed` is how many
 * went, so the page can say when a name had none. Never refused for timing.
 */
export async function leaveSeries(id: string, name: string): Promise<LeaveResult> {
  const r = await post({ action: "leave", id, name });
  if (r.status === 200 && r.data?.ok === true) {
    return { ok: true, removed: typeof r.data.removed === "number" ? r.data.removed : 0 };
  }
  if (r.status === 404 && r.data?.error === "unknown series") {
    return { ok: false, message: "This plan no longer exists." };
  }
  return { ok: false, message: "Could not remove your answers. Try again." };
}
