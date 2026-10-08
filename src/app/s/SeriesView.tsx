"use client";

// The roster and the three answers for a repeating game.
//
// The roster and the dates are rendered on the server, so reading works with
// no JavaScript; answering needs it. Answers apply here at once and a reload
// shows the server's copy. Nothing is claimed saved until the server says so.

import { useState, useSyncExternalStore } from "react";
import {
  USUAL,
  cleanSeriesName,
  effectiveStatus,
  formatGameWhen,
  roster,
  type Game,
  type Series,
  type SeriesAnswer,
  type SeriesStatus,
} from "@/lib/series";
import { sendAnswer } from "@/lib/seriesApi";
import { afterTap } from "@/lib/seriesChoice";
import { NAME_KEY, readSavedName, watchSavedName } from "./savedName";

const CHOICES: { id: SeriesStatus; label: string }[] = [
  { id: "going", label: "Going" },
  { id: "maybe", label: "Maybe" },
  { id: "out", label: "Out" },
];

const HEADINGS: Record<SeriesStatus, string> = { going: "Going", maybe: "Maybe", out: "Out" };

export default function SeriesView({
  id,
  series,
  games,
  answers: initial,
}: {
  id: string;
  series: Series;
  games: Game[];
  answers: SeriesAnswer[];
}) {
  const [answers, setAnswers] = useState(initial);
  const saved = useSyncExternalStore(watchSavedName, readSavedName, () => "");
  const [typed, setName] = useState<string | null>(null);
  const name = typed ?? saved;
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const me = cleanSeriesName(name);
  const usual = !!me && answers.some((a) => a.game === USUAL && a.name.toLowerCase() === me.toLowerCase());

  const answer = async (game: string, status: SeriesStatus | null) => {
    if (busy) return;
    if (!me) {
      setMessage("Add your name first.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const r = await sendAnswer(id, game, me, status);
    setBusy(false);
    if (!r.ok) {
      setMessage(r.message);
      return;
    }
    // The server may have kept an earlier spelling of the same name; use it.
    // (A withdrawal returns none, so the typed name stands.)
    const kept = r.name ?? me;
    setName(kept);
    try {
      localStorage.setItem(NAME_KEY, kept);
    } catch {
      // Not remembered; nothing else changes.
    }
    setAnswers((prev) => {
      const key = kept.toLowerCase();
      const rest = prev.filter((a) => !(a.game === game && a.name.toLowerCase() === key));
      return status ? [...rest, { game, name: kept, status }] : rest;
    });
  };

  // Pressing the answer you gave for a game takes it back.
  const tap = (game: string, choice: SeriesStatus) => {
    if (!me) {
      setMessage("Add your name first.");
      return;
    }
    return answer(game, afterTap(answers, me, game, choice));
  };

  const next = games[0];
  const nextWhen = formatGameWhen(next.startsAt, series.timeZone);
  const r = roster(answers, next.date);
  const nobody = r.going.length + r.maybe.length + r.out.length === 0;

  return (
    <section className="series">
      <h2 className="series-next">{`Next game · ${nextWhen}`}</h2>
      {next.place && next.place !== series.place ? <p className="series-place">{`At ${next.place}`}</p> : null}

      {nobody ? (
        <p className="series-empty">Nobody has answered for this game yet.</p>
      ) : (
        <dl className="invite-facts series-roster">
          {(["going", "maybe", "out"] as const).map((k) =>
            r[k].length ? (
              <div key={k}>
                <dt>{`${HEADINGS[k]} (${r[k].length})`}</dt>
                <dd>{r[k].join(", ")}</dd>
              </div>
            ) : null,
          )}
        </dl>
      )}
      {r.usualOnly.length ? (
        <p className="series-usual">{`${r.usualOnly.join(", ")} usually ${r.usualOnly.length === 1 ? "comes" : "come"} and ${r.usualOnly.length === 1 ? "hasn't" : "haven't"} answered yet.`}</p>
      ) : null}

      <noscript>
        <p className="invite-caveat">Turn on JavaScript in your browser to answer.</p>
      </noscript>

      <form className="series-form" onSubmit={(e) => e.preventDefault()}>
        <div className="invite-field">
          <label htmlFor="series-name">
            <span>Your name</span>
          </label>
          <p id="series-privacy" className="series-privacy">
            Your name is shown to everyone with this link.
          </p>
          <input
            id="series-name"
            value={name}
            maxLength={60}
            autoComplete="given-name"
            aria-describedby="series-privacy"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="invite-choices" role="group" aria-label={`Your answer for ${nextWhen}`}>
          {CHOICES.map((c) => {
            const on = !!me && effectiveStatus(answers, me, next.date) === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                className={`invite-choice${on ? " is-picked" : ""}`}
                aria-disabled={busy}
                onClick={() => tap(next.date, c.id)}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <label className="series-usual-toggle">
          <input
            type="checkbox"
            checked={usual}
            aria-disabled={busy}
            onChange={(e) => answer(USUAL, e.target.checked ? "going" : null)}
          />
          <span>{"I'm usually in. Count me as going every game unless I say otherwise."}</span>
        </label>
        <p className="series-status" role="status">
          {busy ? "Saving" : ""}
        </p>
        <p className="series-message" role="alert">
          {message}
        </p>
      </form>

      {games.length > 1 ? (
        <>
          <h3 className="series-later">Later games</h3>
          <ul className="series-games">
            {games.slice(1).map((g) => {
              const mine = me ? effectiveStatus(answers, me, g.date) : null;
              const when = formatGameWhen(g.startsAt, series.timeZone);
              return (
                <li key={g.date}>
                  <span>{when}</span>
                  <span className="series-count">{`${roster(answers, g.date).going.length} going`}</span>
                  <span className="series-mini" role="group" aria-label={`Your answer for ${when}`}>
                    {CHOICES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={mine === c.id}
                        className={`invite-choice${mine === c.id ? " is-picked" : ""}`}
                        aria-disabled={busy}
                        onClick={() => tap(g.date, c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}
