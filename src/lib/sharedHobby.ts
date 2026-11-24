// The look before joining a shared hobby, for the /h/<token> link page.
//
// A shared hobby is unreadable to anyone outside it, so only the app's
// `shared-hobby` function can answer for somebody who has not joined: the
// hobby, who sent it and how many are in it, never who. This page asks with
// the anon key alone, server side, and never joins anyone -- joining happens
// in the app, signed in.
//
// Spec: the mobile repo's CLAUDE.md ("/h/<token> shares no module") and
// docs/launch/shared-hobbies-legal.md.

/** 128 random bits as 22 base64url characters, minted by the database. */
export const SHARE_TOKEN_RE = /^[A-Za-z0-9_-]{22}$/;
export const isShareToken = (t: unknown): t is string =>
  typeof t === "string" && SHARE_TOKEN_RE.test(t);

/** Word for word the app's SHARED_DISCLOSURE (src/lib/sharedHobbies.ts in the mobile repo). */
export const SHARED_DISCLOSURE =
  "Everyone in it sees the photos, videos and notes each of you chooses to add, who added each one, the name you give here, and your sessions and hours on this hobby added together with theirs. Your own hobby stays yours: leaving takes out only what you added here, and everything stays on your phone.";

export const shareLink = (token: string) =>
  `https://aspectniche.com/h/${token}`;
export const shareAppLink = (token: string) => `aspectniche://h/${token}`;

export type SharePeek = { title: string; from: string; people: number };

/**
 * "gone" is the function saying the link no longer works (replaced, closed,
 * or a suspended owner all look the same), or a token that cannot be one.
 * Everything else -- no backend configured, the function not deployed yet,
 * a timeout, a body we cannot read -- is "failed": the page then offers the
 * app rather than claiming the link is dead.
 */
export type PeekResult =
  { kind: "found"; share: SharePeek } | { kind: "gone" } | { kind: "failed" };

export async function peekShare(token: string): Promise<PeekResult> {
  if (!isShareToken(token)) return { kind: "gone" };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { kind: "failed" };
  let status: number;
  let data: Record<string, unknown> | null;
  try {
    const r = await fetch(`${url}/functions/v1/shared-hobby`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "peek", token }),
      // A replaced link has to stop previewing, so a look is never cached.
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    status = r.status;
    data = (await r.json().catch(() => null)) as Record<string, unknown> | null;
  } catch {
    return { kind: "failed" };
  }
  // The function's own 404 carries `error`; the platform's "no such
  // function" 404 does not, and must not read as a dead link.
  if (status === 404 && typeof data?.error === "string")
    return { kind: "gone" };
  if (status !== 200 || data?.ok !== true) return { kind: "failed" };
  const s = data.share as Record<string, unknown> | null | undefined;
  if (
    !s ||
    typeof s.title !== "string" ||
    !s.title.trim() ||
    typeof s.from !== "string" ||
    !s.from.trim() ||
    typeof s.people !== "number" ||
    !Number.isFinite(s.people) ||
    s.people < 0
  ) {
    return { kind: "failed" };
  }
  return {
    kind: "found",
    share: {
      title: s.title.trim(),
      from: s.from.trim(),
      people: Math.floor(s.people),
    },
  };
}

export const inviteHeadline = (share: SharePeek) =>
  `${share.from} invited you to keep ${share.title} together`;
export const peopleLine = (people: number) =>
  `${people} ${people === 1 ? "person" : "people"} in it so far.`;
