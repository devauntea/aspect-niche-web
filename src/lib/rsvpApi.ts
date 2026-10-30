import type { RsvpStatus } from "@/lib/invite";

// The web side of the `rsvp` function: a guest's answer from the /i page.
// Deployed without JWT checks, like `series`, so no key travels from the
// browser; the function's own rules are the guard. Web-only on purpose --
// not one of the modules shared byte-for-byte with the app.

const endpoint = () => `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/functions/v1/rsvp`;

/**
 * "unknown" is only the function saying no host registered this invitation
 * -- one sent from an app too old to register it. "failed" is everything
 * else: offline, the function not deployed, a full invitation. Either way
 * the page offers the reply link, so the guest is never stuck.
 */
export type RsvpResult = { ok: true } | { ok: false; reason: "unknown" | "failed" };

export async function sendRsvp(inviteId: string, guestName: string, status: RsvpStatus): Promise<RsvpResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { ok: false, reason: "failed" };
  try {
    const r = await fetch(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId, guestName, status }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = (await r.json().catch(() => null)) as Record<string, unknown> | null;
    // A 200 whose body cannot be read is not evidence the answer was kept.
    if (r.status === 200 && data?.ok === true) return { ok: true };
    if (r.status === 404 && data?.error === "unknown invitation") return { ok: false, reason: "unknown" };
    return { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
