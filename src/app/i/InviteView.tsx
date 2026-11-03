"use client";

// Replies are accepted only through the authenticated, moderated server route.

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  RSVP_CHOICES,
  type Invite,
  type RsvpStatus,
} from "@/lib/invite";
import { sendRsvp } from "@/lib/rsvpApi";
import { NAME_KEY, readSavedName, watchSavedName } from "../s/savedName";

const APP_SCHEME = "aspectniche://";

export default function InviteView({
  invite,
  when,
  art,
  encoded,
}: {
  invite: Invite;
  when: string;
  /** The link's own payload, from the server, so "Open in the app" carries it
   *  in the first HTML rather than only after hydration -- React does not
   *  patch an attribute that differed, so reading it from `window` during
   *  render left the server's empty link in place. */
  encoded: string;
  /** The background picture's address, when the host chose one. */
  art: string | null;
}) {
  const layout = art ? invite.background?.layout : undefined;
  // The same remembered name the series page uses: one person, one name.
  const saved = useSyncExternalStore(watchSavedName, readSavedName, () => "");
  const [typed, setName] = useState<string | null>(null);
  const name = typed ?? saved;
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  /** What the server holds from this page, so pressing again is a change of mind, not a repeat. */
  const [sent, setSent] = useState<{ name: string; status: RsvpStatus } | null>(null);
  const [sending, setSending] = useState(false);
  /** Why the answer has to travel as a message instead; null while the server path stands. */
  const [fallback, setFallback] = useState<"unknown" | "failed" | null>(null);

  const who = name.trim();
  const ready = who.length > 0 && status !== null;
  const unchanged = !!sent && sent.name === who && sent.status === status;

  async function send() {
    if (!ready || sending) return;
    setSending(true);
    const r = await sendRsvp(invite.id, who, status!);
    setSending(false);
    if (r.ok) {
      setSent({ name: who, status: status! });
      setFallback(null);
      try {
        localStorage.setItem(NAME_KEY, who);
      } catch {
        // Not remembered; nothing else changes.
      }
      return;
    }
    setFallback(r.reason);
  }


  return (
    <main className="invite-page">
      <article
        className={`invite-shell${layout === "full" ? " has-art-full" : ""}${layout === "banner" ? " has-art-banner" : ""}`}
        style={layout === "full" ? ({ "--invite-art": `url("${art}")` } as React.CSSProperties) : undefined}
      >
        {layout === "banner" && (
          <div className="invite-banner" aria-hidden="true" style={{ backgroundImage: `url("${art}")` }} />
        )}
        <p className="invite-kicker">{invite.host} invited you to</p>
        <h1 className="invite-title">{invite.title}</h1>

        <dl className="invite-facts">
          <div>
            <dt>When</dt>
            <dd>{when}</dd>
          </div>
          {invite.place && (
            <div>
              <dt>Where</dt>
              <dd>
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(invite.place)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {invite.place}
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt>How long</dt>
            <dd>{Math.round(invite.durationMinutes / 60 * 10) / 10} hours</dd>
          </div>
        </dl>

        {invite.note && <p className="invite-note">{invite.note}</p>}

        <section className="invite-rsvp" aria-labelledby="rsvp-heading">
          <h2 id="rsvp-heading">Can you make it?</h2>

          <div className="invite-choices" role="group" aria-label="Your answer">
            {RSVP_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={`invite-choice ${status === choice.id ? "is-picked" : ""}`}
                aria-pressed={status === choice.id}
                onClick={() => setStatus(choice.id)}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <label className="invite-field">
            <span>Your name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="So they know who replied"
              autoComplete="name"
              maxLength={60}
            />
          </label>

          <button type="button" className="invite-send" disabled={!ready || sending || unchanged} onClick={send}>
            {sending ? "Sending…" : sent ? "Change your answer" : "Send your answer"}
          </button>
          <p className="invite-status" role="status">
            {sent && !fallback ? `Saved. ${invite.host} will see your answer.` : fallback ? "Could not save your answer. Check your sign-in and connection, or choose another display name if yours is already used." : ""}
          </p>
          <p className="invite-caveat">Your name and answer are shared with the host and linked to your account for reporting and blocking. Nothing is sent until you press the button.</p>
        </section>

        <footer className="invite-foot">
          <a className="invite-open-app" href={`${APP_SCHEME}i?d=${encodeURIComponent(encoded)}`}>
            Open in the app
          </a>
          <Link href="/">What is Aspect Niche?</Link>
        </footer>
      </article>
    </main>
  );
}
