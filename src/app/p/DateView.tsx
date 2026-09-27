"use client";

// The date invitation page and its three answers: I'd love to, suggest
// another time, can't make it.
//
// The answer goes back the way it always has -- as a reply link the guest
// sends to the host -- and the page says so. Picking an answer sends
// nothing; only "Share my reply" does, and nothing here claims it arrived.
// A different time is a suggestion; a decline carries no votes.

import { useState } from "react";
import Link from "next/link";
import { planReplyLink, type PlanProposalWire } from "@/lib/planLink";
import type { GuestResponse } from "@/lib/planTypes";

const APP_SCHEME = "aspectniche://";
const NO_LIMIT = 1_000_000;

type Choice = "love" | "other" | "decline";

function when(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function clock(iso: string): string {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? "" : at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function DateView({
  plan,
  encoded,
  art,
}: {
  plan: PlanProposalWire;
  encoded: string;
  /** The background picture's address, when the host chose one. */
  art: string | null;
}) {
  const layout = art ? plan.extras?.background?.layout : undefined;
  const [choice, setChoice] = useState<Choice | null>(null);
  const [times, setTimes] = useState<string[]>(plan.windows.length === 1 ? [plan.windows[0].id] : []);
  const [suggestion, setSuggestion] = useState("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const host = plan.inviterName.trim() || null;
  const title = plan.title.trim() || "A date";
  const extras = plan.extras;
  const windows = [...plan.windows].sort((a, b) => a.start.localeCompare(b.start));

  const response = (): GuestResponse | null => {
    const base: GuestResponse = { activityVotes: {}, budget: { min: 0, max: NO_LIMIT }, dinnerVotes: [], windowVotes: [] };
    if (choice === "decline") return { ...base, declined: true };
    if (choice === "other") return suggestion.trim() ? { ...base, suggestion: suggestion.trim().slice(0, 200) } : null;
    if (choice === "love" && times.length > 0) {
      return {
        ...base,
        activityVotes: Object.fromEntries(plan.activityIds.map((a) => [a, "up" as const])),
        dinnerVotes: plan.dinnerOptionIds,
        windowVotes: times,
      };
    }
    return null;
  };
  const r = response();
  const ready = !!r && name.trim().length > 0;

  async function send() {
    if (!r) return;
    const link = planReplyLink(plan.planId, name.trim(), [], r);
    const text = `${name.trim()} answered your invitation: ${title}\n\n${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // Dismissed, or not allowed: fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="date-page">
      <article
        className={`date-shell${layout === "full" ? " has-art-full" : ""}`}
        style={layout === "full" ? ({ "--date-art": `url("${art}")` } as React.CSSProperties) : undefined}
      >
        {layout === "banner" ? (
          <div className="date-art" aria-hidden="true" style={{ backgroundImage: `url("${art}")` }} />
        ) : layout === "full" ? (
          <div className="date-art-space" aria-hidden="true" />
        ) : (
          <div className="date-sky" aria-hidden="true">
            <span className="date-moon" />
            <span className="date-hill date-hill-a" />
            <span className="date-hill date-hill-b" />
          </div>
        )}
        <div className="date-body">
          <p className="date-signature">Aspect Niche</p>
          <p className="date-kicker">{host ? `${host} would love to take you out` : "You're invited out"}</p>
          <h1 className="date-title">{title}</h1>

          <dl className="date-facts">
            {windows.length > 0 && (
              <div>
                <dt>{windows.length > 1 ? "Any of these" : "When"}</dt>
                {windows.map((w) => (
                  <dd key={w.id}>{when(w.start)}</dd>
                ))}
              </div>
            )}
            {extras && (extras.meetAt || extras.meetUndecided) && (
              <div>
                <dt>Meet at</dt>
                <dd>{extras.meetAt || "To decide together"}</dd>
              </div>
            )}
            {plan.budget.max < NO_LIMIT && (
              <div>
                <dt>Budget</dt>
                <dd>{plan.budget.max === 0 ? "Free" : `Up to $${plan.budget.max}`}</dd>
              </div>
            )}
          </dl>

          {extras?.note && <p className="date-note">{extras.note}</p>}

          {extras && extras.stops.length > 0 && (
            <section className="date-plan" aria-labelledby="plan-heading">
              <h2 id="plan-heading">The plan</h2>
              <ol>
                {extras.stops.map((s, i) => (
                  <li key={i}>
                    <strong>
                      {[s.start ? clock(s.start) : null, s.title || "A stop"].filter(Boolean).join(" · ")}
                      {s.optional ? " (if there's time)" : ""}
                    </strong>
                    {s.place && <span>{s.place}</span>}
                    {s.note && <span>{s.note}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {extras && (extras.bring || extras.wear || extras.access) && (
            <dl className="date-facts">
              {extras.bring && (<div><dt>Bring</dt><dd>{extras.bring}</dd></div>)}
              {extras.wear && (<div><dt>Wear</dt><dd>{extras.wear}</dd></div>)}
              {extras.access && (<div><dt>Getting in</dt><dd>{extras.access}</dd></div>)}
            </dl>
          )}

          <section className="date-answer" aria-labelledby="answer-heading">
            <h2 id="answer-heading">Can you make it?</h2>
            <div className="date-choices" role="radiogroup" aria-label="Your answer">
              {(
                [
                  ["love", "I'd love to"],
                  ["other", "Suggest another time"],
                  ["decline", "Can't make it"],
                ] as [Choice, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={choice === id}
                  className={`date-choice ${choice === id ? "is-picked" : ""} ${id === "decline" ? "is-quiet" : ""}`}
                  onClick={() => setChoice(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {choice === "love" && windows.length > 1 && (
              <fieldset className="date-times">
                <legend>Which times work?</legend>
                {windows.map((w) => (
                  <label key={w.id}>
                    <input
                      type="checkbox"
                      checked={times.includes(w.id)}
                      onChange={() => setTimes((t) => (t.includes(w.id) ? t.filter((x) => x !== w.id) : [...t, w.id]))}
                    />
                    {when(w.start)}
                  </label>
                ))}
              </fieldset>
            )}

            {choice === "other" && (
              <label className="date-field">
                <span>When would work better?</span>
                <input value={suggestion} maxLength={200} onChange={(e) => setSuggestion(e.target.value)} placeholder="Sunday afternoon, or any evening next week" />
              </label>
            )}

            {choice && (
              <label className="date-field">
                <span>Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="So they know who answered" autoComplete="name" />
              </label>
            )}

            <button type="button" className="date-send" disabled={!ready} onClick={send}>
              Share my reply
            </button>
            {copied && (
              <p className="date-quiet" role="status">
                Copied. Paste it into your message to {host ?? "them"}; that is what records your answer.
              </p>
            )}
            <p className="date-quiet">
              Send your reply back to {host ?? "them"}. Nothing is sent until you do, and a suggested time is not agreed until {host ?? "they"} answers it.
            </p>
          </section>

          <footer className="date-foot">
            <a href={`${APP_SCHEME}p?d=${encodeURIComponent(encoded)}`}>Open in the app</a>
            <Link href="/">What is Aspect Niche?</Link>
          </footer>
        </div>
      </article>
    </main>
  );
}
