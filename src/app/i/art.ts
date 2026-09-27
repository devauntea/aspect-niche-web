import { INVITE_ART, backgroundPhotoUrl, type InviteBackground } from "@/lib/invite";

// Where an invitation's background picture is, for the link pages.
//
// The app's own artwork is served from /invite-art. A photo is built from
// THIS site's storage project and a key that `unpackBackground` already
// held to twenty-odd safe characters, never from a URL in the link -- so an
// invitation cannot make a guest's browser fetch from anywhere else. With no
// project configured, a photo is simply not drawn.

export function artUrl(bg: InviteBackground | undefined): string | null {
  if (!bg) return null;
  if (bg.art === "photo") {
    return bg.photo ? backgroundPhotoUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", bg.photo) : null;
  }
  return (INVITE_ART as readonly string[]).includes(bg.art) ? `/invite-art/${bg.art}-${bg.layout}.webp` : null;
}
