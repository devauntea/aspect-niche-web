import type { Metadata } from "next";
import Link from "next/link";
import { decodePlan } from "@/lib/planLink";
import { datePreview, posterQuery } from "./preview";
import DateView from "./DateView";
import { artUrl } from "../i/art";
import "./date.css";

// A date invitation, for somebody who may not have the app.
//
// Two representations, kept apart on purpose. The METADATA -- the title,
// description and poster a messaging app shows before anyone taps -- is
// `datePreview`: the host, what they called it, and the day. The PAGE is the
// invitation itself: times, where to meet, the note and the plan, which the
// host chose to share with whoever opens the link. Private planning never
// reaches either; it was never put in the link.
//
// An unlisted link can be forwarded, and the page says nothing more than the
// link carries.

const ORIGIN = "https://aspectniche.com";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}): Promise<Metadata> {
  const { d } = await searchParams;
  const preview = datePreview(d ? decodePlan(d) : null);
  // Only the preview fields go to the poster, never the whole invitation.
  const card = `${ORIGIN}/p/card?${posterQuery(preview)}`;
  return {
    metadataBase: new URL(ORIGIN),
    title: preview.headline,
    description: preview.description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title: preview.headline,
      description: preview.description,
      images: [{ url: card, width: 1200, height: 630, alt: preview.headline }],
    },
    twitter: { card: "summary_large_image", title: preview.headline, description: preview.description, images: [card] },
  };
}

export default async function DatePage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const plan = d ? decodePlan(d) : null;

  if (!plan) {
    return (
      <main className="date-page">
        <article className="date-shell">
          <h1 className="date-title">This invitation did not open</h1>
          <p className="date-quiet">
            The link may have been cut short in transit. Ask them to send it
            again, and tap it rather than copying it.
          </p>
          <footer className="date-foot">
            <Link href="/">What is Aspect Niche?</Link>
          </footer>
        </article>
      </main>
    );
  }

  return <DateView plan={plan} encoded={d ?? ""} art={artUrl(plan.extras?.background)} />;
}
