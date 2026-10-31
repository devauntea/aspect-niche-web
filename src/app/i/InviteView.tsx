"use client";

// The invitation itself, and the answer.
//
// The answer goes to the server first: the `rsvp` function stores it and the
// host's phone is told, so the guest is done the moment they press the
// button -- no reply to send back. The reply link is the fallback, never the
// failure: an invitation from an app too old to register it, a page with no
// project behind it, or a bad connection all offer it, and say plainly that
// the answer still has to be sent. A guest who thinks they have replied and
// has not is worse off than one who knows they still have to press send.

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  RSVP_CHOICES,
  replyLink,
  rsvpLabel,
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
  const [copied, setCopied] = useState(false);

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

  async function sendAsMessage() {
    if (!ready) return;
    const text = `${who}: ${rsvpLabel(status!)} — ${invite.title}\n\n${replyLink(invite.id, who, status!)}`;
    // The share sheet where there is one, the clipboard where there is not.
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // Dismissed. Fall through to the clipboard so the answer is not lost.
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

          {fallback === "unknown" ? (
            <button type="button" className="invite-send" disabled={!ready} onClick={sendAsMessage}>
              Send your answer to {invite.host}
            </button>
          ) : (
            <button
              type="button"
              className="invite-send"
              disabled={!ready || sending || unchanged}
              onClick={send}
            >
              {sending ? "Sending…" : sent ? "Change your answer" : "Send your answer"}
            </button>
          )}

          <p className="invite-status" role="status">
            {sent && !fallback
              ? `Sent. ${invite.host} will see “${rsvpLabel(sent.status)}” on their guest list — there is nothing to send back.`
              : fallback === "unknown"
                ? `This invitation came from an older version of the app, so your answer goes back to ${invite.host} as a message.`
                : fallback === "failed"
                  ? `Could not reach Aspect Niche. Try again, or send your answer to ${invite.host} as a message.`
                  : ""}
          </p>

          {fallback === "failed" && (
            <button type="button" className="invite-message" disabled={!ready} onClick={sendAsMessage}>
              Send it as a message instead
            </button>
          )}

          {copied && (
            <p className="invite-copied" role="status">
              Copied. Paste it into your reply to {invite.host} — that is what
              records your answer.
            </p>
          )}

          {/* Only what is true of the path the answer is on: a reply link is
              never stored anywhere, so this page does not say it is. */}
          <p className="invite-caveat">
            {fallback === "unknown"
              ? `Your answer travels back to ${invite.host} as a message, and is not kept anywhere else.`
              : `Your name and answer are kept so ${invite.host} can see who is coming, and nothing else about you is.`}{" "}
            Nothing is sent until you press the button above.
          </p>
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
