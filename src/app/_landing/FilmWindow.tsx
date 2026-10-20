"use client";

import { useEffect, useRef, useState } from "react";
import { FILM, playFilm } from "../_site/film";
import { useReducedMotion } from "./useReducedMotion";

// The film's window on the page.
//
// A silent, looping 18-second excerpt plays while the window is on screen, so
// the first thing below the headline is the product moving. It is muted by
// necessity (browsers allow nothing else unasked), so it is only ever a
// preview: the real film, with its narration, is one press away, and it has
// its own pause control because anything that moves on its own for more than
// five seconds needs one.
//
// The window opens up as it rises into view: a transform and a radius, read
// from scroll on a passive listener inside a frame callback, never layout.

export default function FilmWindow() {
  const reduced = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);

  // Reduced motion starts paused; the button still plays it on request.
  const paused = userPaused ?? reduced;

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        threshold: 0.25,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !paused) video.play().catch(() => {});
    else video.pause();
  }, [inView, paused]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || reduced) {
      el?.style.removeProperty("--open");
      return;
    }
    let pending = false;
    const update = () => {
      pending = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the window's top enters the bottom of the screen, 1 by the time
      // it reaches 30% from the top.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.7)));
      el.style.setProperty("--open", p.toFixed(3));
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <section id="film" className="film" aria-labelledby="film-title">
      <div className="container">
        <div className="film-window" ref={frameRef}>
          <video
            ref={videoRef}
            className="film-teaser"
            muted
            loop
            playsInline
            preload="none"
            poster={FILM.teaserPoster}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={FILM.teaser} type="video/mp4" />
          </video>
          <div className="film-scrim" aria-hidden="true" />

          <button type="button" className="film-play" onClick={playFilm}>
            <span className="film-play-disc" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 14 14">
                <path
                  d="M3.4 1.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L4.3 1.3a.6.6 0 0 0-.9.5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="sr-only">
              Play the launch film with sound, {FILM.duration}
            </span>
          </button>

          <div className="film-caption">
            <h2 id="film-title">The launch film</h2>
            <p>
              Two minutes and twenty seconds, narrated, with captions. Every
              screen in it is the real app.
            </p>
          </div>

          <button
            type="button"
            className="film-preview-toggle"
            aria-pressed={paused}
            onClick={() => setUserPaused(!paused)}
          >
            {paused ? (
              <>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                >
                  <path
                    d="M3 1.8v10.4a.6.6 0 0 0 .9.5l8.4-5.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z"
                    fill="currentColor"
                  />
                </svg>
                Play preview
              </>
            ) : (
              <>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
                >
                  <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" />
                </svg>
                Pause preview
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
