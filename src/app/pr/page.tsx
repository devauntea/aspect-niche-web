import type { Metadata } from "next";
import Link from "next/link";
import { decodePlanReply } from "@/lib/planLink";
import "../i/invite.css";

// The page a date-plan ANSWER opens, for the person who sent the plan.
//
// The same shape and the same honesty as `/r`. The app applies the answer when
// it opens this URL; a browser cannot, because there is nothing to apply it
// into. So this page says clearly what the answer was and where it needs to
// go, rather than implying something was saved.
//
// It says what somebody agreed to, never who they are beyond the name they
// typed — the reply carries no more than that, which is the point.

export const metadata: Metadata = {
  title: "An answer to your plan — Aspect Niche",
  robots: { index: false, follow: false },
};

export default async function PlanReplyPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const reply = d ? decodePlanReply(d) : null;

  if (!reply) {
    return (
      <main className="invite-page">
        <article className="invite-shell">
          <h1 className="invite-broken-title">This answer did not open</h1>
          <p className="invite-broken-body">
            The link may have been cut short in transit. Ask them to send it
            again, and tap it rather than copying it.
          </p>
          <footer className="invite-foot">
            <Link href="/">What is Aspect Niche?</Link>
          </footer>
        </article>
      </main>
    );
  }

  const guest = reply.guestName || "They";
  const yes = Object.values(reply.response.activityVotes).filter(
    (v) => v === "up",
  ).length;
  const times = reply.response.windowVotes.length;

  return (
    <main className="invite-page">
      <article className="invite-shell">
        <p className="invite-kicker">Plan a date</p>
        <h1 className="invite-title">{guest} answered</h1>

        <dl className="invite-facts">
          <div>
            <dt>Ideas they liked</dt>
            <dd>
              {yes === 0
                ? "None of them — worth asking what they would rather do"
                : `${yes} of the ones you offered`}
            </dd>
          </div>
          <div>
            <dt>Times that work</dt>
            <dd>
              {times === 0
                ? "None of the ones you offered"
                : `${times} of the ones you offered`}
            </dd>
          </div>
        </dl>

        <p className="invite-note">
          Open this same link on the phone that sent the plan and Aspect Niche
          will put {guest}&rsquo;s answer on it, then work out where the two of
          you agree. Opening it here, in a browser, cannot record it — there is
          no account holding your plans, which is the same reason nobody else
          can see them.
        </p>
        <p className="invite-caveat">
          If you do not have the app on this device, the summary above is the
          whole message.
        </p>

        <footer className="invite-foot">
          <Link href="/">What is Aspect Niche?</Link>
        </footer>
      </article>
    </main>
  );
}
