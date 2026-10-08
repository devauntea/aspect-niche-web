import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { formatGameWhen, nextGames, repeatLabel, UPCOMING_GAMES, type Series } from "@/lib/series";
import { getSeries } from "@/lib/seriesApi";
import SeriesView from "./SeriesView";
import SeriesTakeBack from "./SeriesTakeBack";
import "../i/invite.css";
import "./series.css";

// A series link: one link pinned in a group chat for a game that repeats.
// Unlike /i, the event is not in the link -- it is fetched, so this week's
// cancellation shows up on a link sent months ago. Names are shown to
// everyone with the link; that is the point, and the form says so.
//
// The preview never carries names: a link preview is shown to everyone in a
// chat, including people who never open it. It is the title, the host and the
// next time, and nothing a guest typed.
//
// Read per request (it depends on searchParams), never at build, so a build
// needs no Supabase variables.

type Props = { searchParams: Promise<{ id?: string }> };

// The metadata and the page both need the series; ask once per request.
const load = cache(getSeries);

// Games are relative to the moment of the request; a function outside the
// component keeps that impurity out of render.
const upcoming = (series: Series, count: number) => nextGames(series, Date.now(), count);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id } = await searchParams;
  const page = id ? await load(id) : "missing";
  const found = typeof page === "object" ? page : null;
  const title = found ? `${found.series.title}, hosted by ${found.series.host}` : "A repeating plan on Aspect Niche";
  const next = found ? upcoming(found.series, 1)[0] : undefined;
  const description = found
    ? next
      ? `Next: ${formatGameWhen(next.startsAt, found.series.timeZone)}. Tap to say if you're in.`
      : found.series.ended
        ? "This series has ended."
        : "No games are scheduled."
    : "Say if you're in.";
  return { title, description, robots: { index: false, follow: false }, openGraph: { title, description } };
}

export default async function SeriesPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const page = id ? await load(id) : "missing";

  if (typeof page !== "object") {
    return (
      <main className="invite-page">
        <article className="invite-shell">
          <h1 className="invite-broken-title">
            {page === "missing" ? "This plan no longer exists" : "This plan did not load"}
          </h1>
          <p className="invite-broken-body">
            {page === "missing"
              ? "The host may have deleted it. Ask them for the current link."
              : "Check your connection and open the link again."}
          </p>
          <footer className="invite-foot">
            <Link href="/">What is Aspect Niche?</Link>
          </footer>
        </article>
      </main>
    );
  }

  const { series } = page;
  const games = upcoming(series, UPCOMING_GAMES);
  return (
    <main className="invite-page">
      <article className="invite-shell">
        <p className="invite-kicker">{`${series.host} · ${repeatLabel(series.repeat)}`}</p>
        <h1 className="invite-title">{series.title}</h1>
        {series.place ? <p className="series-place">{series.place}</p> : null}
        {series.note ? <p className="invite-note">{series.note}</p> : null}
        {series.ended ? (
          <>
            <p className="invite-note">This series has ended.</p>
            <SeriesTakeBack id={series.id} answers={page.answers} />
          </>
        ) : games.length === 0 ? (
          <p className="invite-note">No games are scheduled.</p>
        ) : (
          <SeriesView id={series.id} series={series} games={games} answers={page.answers} />
        )}
        <footer className="invite-foot">
          <Link href="/">What is Aspect Niche?</Link>
        </footer>
      </article>
    </main>
  );
}
