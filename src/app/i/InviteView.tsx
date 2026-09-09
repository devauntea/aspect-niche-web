"use client";

// The invitation itself, and the answer.
//
// The RSVP is the interesting part. There is no server, so a reply cannot be
// written anywhere central — it goes back the way it came, as a link the guest
// sends to the host. That is stated plainly rather than hidden behind a
// hopeful "Sent!", because a guest who thinks they have replied and has not is
// worse off than one who knows they still have to press send.

import { useState } from "react";
import Link from "next/link";
import {
  RSVP_CHOICES,
  replyLink,
  rsvpLabel,
  type Invite,
  type RsvpStatus,
} from "@/lib/invite";

const APP_SCHEME = "aspectniche://";

export default function InviteView({
  invite,
  when,
}: {
  invite: Invite;
  when: string;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const [copied, setCopied] = useState(false);

  const ready = name.trim().length > 0 && status !== null;
  const reply = ready ? replyLink(invite.id, name.trim(), status) : "";

  async function send() {
    const text = `${name.trim()}: ${rsvpLabel(status!)} — ${invite.title}\n\n${reply}`;
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
      <article className="invite-shell">
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
            />
          </label>

          <button
            type="button"
            className="invite-send"
            disabled={!ready}
            onClick={send}
          >
            Send your answer to {invite.host}
          </button>

          {copied && (
            <p className="invite-copied" role="status">
              Copied. Paste it into your reply to {invite.host} — that is what
              records your answer.
            </p>
          )}

          <p className="invite-caveat">
            Aspect Niche has no server, so your answer travels back to{" "}
            {invite.host} as a message rather than syncing on its own. Nothing
            is sent until you press the button above.
          </p>
        </section>

        <footer className="invite-foot">
          <a className="invite-open-app" href={`${APP_SCHEME}i?d=${encodeURIComponent(new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("d") ?? "")}`}>
            Open in the app
          </a>
          <Link href="/">What is Aspect Niche?</Link>
        </footer>
      </article>
    </main>
  );
}
