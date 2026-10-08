"use client";

// An ended series takes no new answers, but a guest can still take back the
// ones they gave. The privacy page promises it, and a list of names that
// outlives its games is exactly when somebody wants off it.
//
// It clears what this page holds: "usually in" and the games the series would
// have listed next. Answers to games more than 90 days past are cleared the
// next time anyone opens the series or changes an answer in it, as the
// privacy page says -- never on a timer -- and the host can remove a name
// from every game at any time. Nothing is claimed removed until the server
// says so.

import { useState, useSyncExternalStore } from "react";
import { type SeriesAnswer } from "@/lib/series";
import { sendAnswer } from "@/lib/seriesApi";
import { answeredGames } from "@/lib/seriesChoice";
import { readSavedName, watchSavedName } from "./savedName";

export default function SeriesTakeBack({ id, answers: initial }: { id: string; answers: SeriesAnswer[] }) {
  const [answers, setAnswers] = useState(initial);
  const saved = useSyncExternalStore(watchSavedName, readSavedName, () => "");
  const [typed, setName] = useState<string | null>(null);
  const name = typed ?? saved;
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const takeBack = async () => {
    if (busy) return;
    setDone(null);
    setProblem(null);
    const games = answeredGames(answers, name);
    if (!name.trim()) {
      setProblem("Add your name first.");
      return;
    }
    if (games.length === 0) {
      setDone("There is nothing under that name.");
      return;
    }
    setBusy(true);
    const key = name.trim().toLowerCase();
    let failed = false;
    for (const game of games) {
      const r = await sendAnswer(id, game, name.trim(), null);
      if (!r.ok) {
        failed = true;
        continue;
      }
      setAnswers((prev) => prev.filter((a) => !(a.game === game && a.name.toLowerCase() === key)));
    }
    setBusy(false);
    if (failed) setProblem("Could not remove your answers. Try again.");
    else setDone("Your answers are removed.");
  };

  return (
    <section className="series">
      <noscript>
        <p className="invite-caveat">Turn on JavaScript in your browser to take back your answers.</p>
      </noscript>
      <form
        className="series-form"
        onSubmit={(e) => {
          e.preventDefault();
          void takeBack();
        }}
      >
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
            onChange={(e) => {
              setName(e.target.value);
              setDone(null);
              setProblem(null);
            }}
          />
        </div>
        <div className="invite-choices">
          <button type="submit" className="invite-choice" aria-disabled={busy}>
            Take back my answers
          </button>
        </div>
        <p className="series-status" role="status">
          {busy ? "Removing" : (done ?? "")}
        </p>
        <p className="series-message" role="alert">
          {problem}
        </p>
      </form>
    </section>
  );
}
