import type { Metadata } from "next";
import Link from "next/link";
import { decodePlan } from "@/lib/planLink";
import "../i/invite.css";

// The page a date-plan link opens.
//
// The same reason `/i` exists, for the other half of the same idea. Plan a
// Date was built around handing somebody your phone, which works when they are
// standing next to you and is the whole feature otherwise. The proposal now
// travels as a link, and a link needs a page: messaging apps do not make an
// unknown scheme tappable, and for anyone without the app, tapping one does
// nothing at all.
//
// Everything needed to render the proposal is inside the link, so this page
// needs no database and no account — the same property that makes the feature
// work with no backend makes it work for a stranger on a browser.
//
// It renders the proposal and stops there. Answering happens in the app,
// because the answer is a second link and only the app can make one. Saying so
// plainly is the honest version of a design that has no server; pretending a
// browser could record something would not be.

const ORIGIN = "https://aspectniche.com";

function whenLabel(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function budgetLabel(budget: { min: number; max: number }): string {
  // The open end is a large sentinel rather than Infinity, because the plan is
  // written to storage and JSON turns Infinity into null — which reads back as
  // a budget nobody set. Anything above the top named stop is that sentinel.
  if (budget.max >= 1_000_000) return "No limit";
  if (budget.max === 0) return "Free";
  return `Up to $${budget.max}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}): Promise<Metadata> {
  const { d } = await searchParams;
  const plan = d ? decodePlan(d) : null;

  const title = plan
    ? `${plan.inviterName || "Someone"} wants to plan a date`
    : "A date plan — Aspect Niche";
  const description = plan
    ? [
        `${plan.activityIds.length} ${plan.activityIds.length === 1 ? "idea" : "ideas"}`,
        `${plan.windows.length} ${plan.windows.length === 1 ? "time" : "times"} that work for them`,
      ].join(" · ")
    : "A date plan from Aspect Niche.";

  return {
    metadataBase: new URL(ORIGIN),
    title,
    description,
    // Same posture as the invitation: preview fetchers do not obey robots the
    // way crawlers do, which is what makes the unfurl work at all, and a plan
    // with somebody's name and evenings in it has no business in an index.
    robots: { index: false, follow: false },
    openGraph: { type: "website", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const plan = d ? decodePlan(d) : null;

  if (!plan) {
    return (
      <main className="invite-page">
        <article className="invite-shell">
          <h1 className="invite-broken-title">This plan did not open</h1>
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

  const host = plan.inviterName || "Someone";

  return (
    <main className="invite-page">
      <article className="invite-shell">
        <p className="invite-kicker">Plan a date</p>
        <h1 className="invite-title">{host} wants to plan something</h1>

        <dl className="invite-facts">
          <div>
            <dt>Budget</dt>
            <dd>{budgetLabel(plan.budget)}</dd>
          </div>
          {plan.windows.length > 0 && (
            <div>
              <dt>{plan.windows.length === 1 ? "Time" : "Times that work for them"}</dt>
              <dd>
                {plan.windows
                  .map((w) => whenLabel(w.start))
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
          )}
          {plan.activityIds.length > 0 && (
            <div>
              <dt>Ideas</dt>
              <dd>
                {plan.activityIds.length}{" "}
                {plan.activityIds.length === 1 ? "hobby" : "hobbies"} to choose between
              </dd>
            </div>
          )}
        </dl>

        <p className="invite-note">
          Open this link on a phone with Aspect Niche and it becomes the plan
          itself: {host}&rsquo;s ideas, their budget and the evenings they
          offered, with somewhere to say which of them work for you. Your answer
          goes back as a second link they tap once.
        </p>
        <p className="invite-caveat">
          It cannot be answered here. There is no account holding{" "}
          {host}&rsquo;s plans — which is the same reason nobody else can see
          them.
        </p>

        <footer className="invite-foot">
          <Link href="/">What is Aspect Niche?</Link>
        </footer>
      </article>
    </main>
  );
}
