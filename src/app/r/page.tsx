import type { Metadata } from "next";
import { decodeReply, rsvpLabel } from "@/lib/invite";
import "../i/invite.css";
import Link from "next/link";

// The page a reply link opens, for the host.
//
// The app records the answer when it opens this URL; the browser cannot,
// because there is nothing to record it into. So this page's job is to say
// clearly what the answer was and where it needs to go — which is honest about
// a design that has no server, rather than pretending something was saved.

export const metadata: Metadata = {
  title: "An answer to your invitation — Aspect Niche",
  robots: { index: false, follow: false },
};

export default async function ReplyPage({
  searchParams,
}: {
  searchParams: Promise<{ i?: string; n?: string; s?: string }>;
}) {
  const { i, n, s } = await searchParams;
  const reply = decodeReply({ i, n, s });

  return (
    <main className="invite-page">
      <article className="invite-shell">
        {reply ? (
          <>
            <p className="invite-kicker">Someone answered</p>
            <h1 className="invite-title">
              {reply.name} is {rsvpLabel(reply.status).toLowerCase()}
            </h1>
            <p className="invite-note">
              Open this same link on the phone that sent the invitation and
              Aspect Niche will add {reply.name} to the guest list. Opening it
              here, in a browser, cannot record it — there is no account holding
              your invitations, which is the same reason nobody else can see
              them.
            </p>
            <p className="invite-caveat">
              If you do not have the app on this device, the answer above is the
              whole message: {reply.name} said{" "}
              {rsvpLabel(reply.status).toLowerCase()}.
            </p>
          </>
        ) : (
          <>
            <h1 className="invite-broken-title">This reply did not open</h1>
            <p className="invite-broken-body">
              The link may have been cut short in transit. Ask them to send it
              again, and tap it rather than copying it.
            </p>
          </>
        )}
        <footer className="invite-foot">
          <Link href="/">What is Aspect Niche?</Link>
        </footer>
      </article>
    </main>
  );
}
