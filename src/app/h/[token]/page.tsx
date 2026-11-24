import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { APP_STORE_ID, APP_STORE_URL } from "@/lib/appStore";
import {
  SHARED_DISCLOSURE,
  inviteHeadline,
  isShareToken,
  peekShare,
  peopleLine,
  shareAppLink,
  shareLink,
} from "@/lib/sharedHobby";
import "../../i/invite.css";

// A shared hobby's invite link: aspectniche.com/h/<token>.
//
// With the app installed, iOS opens the app instead (the AASA file lists
// /h/*), so this page is for everyone else: it says who invited you to keep
// which hobby together and how many are in it, and nothing about who. It
// never joins anyone -- joining needs the app and an account.
//
// If the look fails for any reason other than the link being dead (the
// function not deployed yet, an outage), the page still offers the app
// rather than a broken state.

type Props = { params: Promise<{ token: string }> };

// The metadata and the page both need the look; ask once per request.
const load = cache(peekShare);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const result = await load(token);
  const valid = isShareToken(token);
  // The preview carries only who sent it and the hobby, and nothing else.
  const title =
    result.kind === "found"
      ? inviteHeadline(result.share)
      : "A shared hobby on Aspect Niche";
  return {
    title,
    description: null,
    robots: { index: false, follow: false },
    openGraph: { title },
    twitter: { card: "summary", title },
    itunes: valid
      ? { appId: APP_STORE_ID, appArgument: shareLink(token) }
      : { appId: APP_STORE_ID },
  };
}

function Foot() {
  return (
    <footer className="invite-foot">
      <Link href="/support">Help and support</Link>
      <Link href="/">About Aspect Niche</Link>
    </footer>
  );
}

export default async function SharedHobbyPage({ params }: Props) {
  const { token } = await params;
  const result = await load(token);

  if (result.kind === "gone") {
    return (
      <main className="invite-page">
        <article className="invite-shell">
          <p className="invite-kicker">Shared hobby</p>
          <h1 className="invite-broken-title">This link no longer works</h1>
          <p className="invite-broken-body">
            Ask whoever sent it for a new one.
          </p>
          <p className="invite-caveat">
            <a className="invite-open-app" href={APP_STORE_URL}>
              Download on the App Store
            </a>
          </p>
          <Foot />
        </article>
      </main>
    );
  }

  if (result.kind === "failed") {
    return (
      <main className="invite-page">
        <article className="invite-shell">
          <p className="invite-kicker">Shared hobby</p>
          <h1 className="invite-title">A hobby to keep together</h1>
          <p className="invite-note">
            Someone invited you to keep a hobby together in Aspect Niche. Open
            this link in the app to see it and join. If you don&rsquo;t have the
            app yet, it is on the App Store.
          </p>
          <a
            className="invite-send invite-link-button"
            href={shareAppLink(token)}
          >
            Open in Aspect Niche
          </a>
          <p className="invite-caveat">
            <a className="invite-open-app" href={APP_STORE_URL}>
              Download on the App Store
            </a>
          </p>
          <p className="invite-caveat">
            Joining happens in the app, with an account.
          </p>
          <Foot />
        </article>
      </main>
    );
  }

  const { share } = result;
  return (
    <main className="invite-page">
      <article className="invite-shell">
        <p className="invite-kicker">Shared hobby</p>
        <h1 className="invite-title">{inviteHeadline(share)}</h1>
        <p className="invite-note">{peopleLine(share.people)}</p>
        <p className="invite-caveat">{SHARED_DISCLOSURE}</p>
        <a
          className="invite-send invite-link-button"
          href={shareAppLink(token)}
        >
          Open in Aspect Niche
        </a>
        <p className="invite-caveat">
          <a className="invite-open-app" href={APP_STORE_URL}>
            Download on the App Store
          </a>
        </p>
        <p className="invite-caveat">
          Joining needs the app and an account, because a shared hobby is other
          people.
        </p>
        <Foot />
      </article>
    </main>
  );
}
