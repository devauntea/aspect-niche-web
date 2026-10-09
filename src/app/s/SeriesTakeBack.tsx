"use client";

// A series with no game to answer -- ended, or nothing scheduled -- still
// lets a guest take back the answers they gave. The privacy page promises
// it, and a list of names that outlives its games is exactly when somebody
// wants off it.
//
// One `leave`, which removes every answer under the name, played games
// included: this page shows none of those, and an answer to last week's game
// is what keeps a name on the list. Nothing is claimed removed until the
// server says so, and a name with nothing under it is told so.

import { useState, useSyncExternalStore } from "react";
import { cleanSeriesName } from "@/lib/series";
import { leaveSeries } from "@/lib/seriesApi";
import { readSavedName, watchSavedName } from "./savedName";

export default function SeriesTakeBack({ id }: { id: string }) {
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
    const me = cleanSeriesName(name);
    if (!me) {
      setProblem("Add your name first.");
      return;
    }
    setBusy(true);
    const r = await leaveSeries(id, me);
    setBusy(false);
    if (!r.ok) setProblem(r.message);
    else setDone(r.removed > 0 ? "Your answers are removed." : "There is nothing under that name.");
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
