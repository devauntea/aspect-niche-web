"use client";

import { useEffect, useRef, useState } from "react";
import { FILM, PLAY_FILM_EVENT } from "../_site/film";

// The launch film, with sound, in a theater over the page.
//
// A native modal <dialog>: it traps focus, closes on Escape, makes the page
// behind it inert and hands focus back to whatever opened it, without any of
// that being re-implemented here. Any "Watch the film" control on the page
// opens it through one event, so there is exactly one film player.
//
// Nothing loads until it is opened (`preload="none"`), it starts from the top
// every time, and closing it stops the sound rather than leaving the film
// playing behind the page.

export default function FilmTheater() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const open = () => {
      const dialog = dialogRef.current;
      const video = videoRef.current;
      if (!dialog || !video) return;
      setFailed(false);
      if (!dialog.open) dialog.showModal();
      video.currentTime = 0;
      // Opened by a click, so sound is allowed. If the browser still refuses,
      // the controls are right there and the film waits on its poster.
      video.play().catch(() => {});
    };
    window.addEventListener(PLAY_FILM_EVENT, open);
    return () => window.removeEventListener(PLAY_FILM_EVENT, open);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="theater"
      aria-label={FILM.title}
      onClose={() => videoRef.current?.pause()}
      // A click on the dim backdrop (the dialog element itself, outside the
      // frame) closes it, as people expect of a lightbox.
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="theater-frame">
        <div className="theater-bar">
          <p>
            <span className="voice">Follow your curiosity.</span> The Aspect
            Niche launch film
          </p>
          <button
            type="button"
            className="theater-close"
            onClick={close}
            aria-label="Close the film"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="theater-screen">
          <video
            ref={videoRef}
            controls
            playsInline
            preload="none"
            poster={FILM.poster}
            onError={() => setFailed(true)}
          >
            {FILM.sources.map((s, i) => (
              <source
                key={s.src}
                src={s.src}
                type="video/mp4"
                {...("media" in s ? { media: s.media } : {})}
                // With <source> children the failure lands on the last
                // source tried, not on the video.
                onError={
                  i === FILM.sources.length - 1
                    ? () => setFailed(true)
                    : undefined
                }
              />
            ))}
            <track
              kind="captions"
              src={FILM.captions}
              srcLang="en"
              label="English"
            />
            Your browser cannot play this film.{" "}
            <a href={FILM.sources[1].src}>Download it instead</a>.
          </video>
        </div>
        {failed ? (
          <p className="theater-note" role="alert">
            The film did not load. Check your connection, or{" "}
            <a className="text-link" href={FILM.sources[1].src}>
              open the film file directly
            </a>
            .
          </p>
        ) : (
          <p className="theater-note">
            Narrated, with English captions under the{" "}
            <abbr title="closed captions">CC</abbr> control. Every screen in it
            is the real app.
          </p>
        )}
      </div>
    </dialog>
  );
}
