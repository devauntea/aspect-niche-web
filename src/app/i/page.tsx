import type { Metadata } from "next";
import { decodeInvite, formatInviteWhen } from "@/lib/invite";
import SharedActivity from "@/app/_shared/SharedActivity";
import { verifiedInvite } from "@/lib/invitePreview";
import "./invite.css";

// The page an invitation link opens.
//
// This exists because the invite feature was broken for exactly the people it
// is meant to reach. Invitations used to be `aspectniche://` links: messaging
// apps do not reliably make an unknown scheme tappable, and for anyone without
// the app installed, tapping did nothing at all.
//
// The link identifies a registered invitation. Authenticated checks return
// the canonical document; anonymous crawlers receive only preview fields.

const ORIGIN = "https://aspectniche.com";

/**
 * The preview a messaging app draws for this link.
 *
 * Built per invitation, because the whole point is that the message says what
 * it is. A generic site preview under an opaque URL is the "big blue text box"
 * problem with a logo stapled on: the guest still has to tap before they know
 * whether they have been invited to a pottery class or a walk.
 *
 * `noindex` stays on. Preview fetchers do not obey robots the way crawlers do,
 * which is what makes this work at all, and an invitation with someone's name
 * and address in it has no business in a search index.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}): Promise<Metadata> {
  const { d } = await searchParams;
  const invite = await verifiedInvite(d);

  const title = invite
    ? `${invite.host} invited you to ${invite.title}`
    : "You're invited — Aspect Niche";
  const description = invite
    ? [formatInviteWhen(invite.startsAt, invite.tzOffset), invite.place]
        .filter(Boolean)
        .join(" · ")
    : "An invitation from Aspect Niche.";
  const card = `${ORIGIN}/i/card${d ? `?d=${encodeURIComponent(d)}` : ""}`;

  return {
    metadataBase: new URL(ORIGIN),
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: card, width: 1200, height: 630, alt: title }],
    },
    // Without this iMessage and most clients fall back to a small square
    // thumbnail beside the text, which is the layout being replaced.
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card],
    },
  };
}

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const invite = d ? decodeInvite(d) : null;

  if (!invite) {
    return (
      <main className="invite-page">
        <div className="invite-shell">
          <h1 className="invite-broken-title">This invitation did not open</h1>
          <p className="invite-broken-body">
            The link may have been cut short somewhere between the sender and
            here — messaging apps sometimes wrap long links across lines. Ask
            whoever sent it to send it again, and tap it rather than copying it.
          </p>
        </div>
      </main>
    );
  }

  return <SharedActivity kind="invite" id={invite.id} />;
}
