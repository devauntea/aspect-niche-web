import { INVITE_ART, backgroundPhotoUrl, type InviteBackground } from "@/lib/invite";

// The background behind a LINK PREVIEW, which is what a guest sees first in
// Messages -- before the page, and often instead of it.
//
// The preview is drawn by `next/og`, which reads JPEG and PNG but not the
// WebP the page uses, so each artwork has a card-sized JPEG beside it
// (`<art>-card.jpg`, 1200x630). A photo is the host's own upload, already a
// JPEG. Either layout gives the card the same picture: a card is landscape,
// and the banner cut is the landscape one.
//
// The picture is fetched here, with a short limit, and handed to the card as
// data. An image the renderer fails to fetch fails the whole card, and a
// link with no preview at all is worse than one with the plain look.

export function cardArtUrl(bg: InviteBackground | undefined, origin: string): string | null {
  if (!bg) return null;
  if (bg.art === "photo") {
    return bg.photo ? backgroundPhotoUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", bg.photo) : null;
  }
  return (INVITE_ART as readonly string[]).includes(bg.art) ? `${origin}/invite-art/${bg.art}-card.jpg` : null;
}

export async function loadCardArt(url: string | null, ms = 2500): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > 2_500_000) return null;
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:${type.split(";")[0]};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}
