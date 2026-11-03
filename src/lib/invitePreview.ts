import { decodeInvite, type Invite } from "./invite";
type InvitePreview = Pick<Invite, "id" | "host" | "title" | "startsAt" | "tzOffset" | "place" | "background">;
/** Public previews use the registered document; changing link text cannot replace it. */
export async function verifiedInvite(encoded?: string): Promise<InvitePreview | null> {
  const decoded = encoded && encoded.length <= 18000 ? decodeInvite(encoded) : null;
  if (!decoded || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/safety`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preview", kind: "invite", targetId: decoded.id }),
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    const result = await response.json();
    return response.ok && result.doc?.id === decoded.id ? result.doc as InvitePreview : null;
  } catch { return null; }
}
