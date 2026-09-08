"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMotion } from "./useMotion";
import { useReveal } from "./useReveal";

// A camera that walks through what you kept.
//
// The rules this has to hold, all of which are about a timer outliving the
// thing it was started for:
//
//   Nothing plays until asked.        no autoplay on load
//   One timer, ever.                  a new move cancels the pending one
//   Leaving stops it.                 tab hidden, scrolled away, unmounted
//   The end is the end.               replay is an explicit action
//   Notes off means gone.             not in the collage, not in the queue
//
// The timer lives in a ref and every path out goes through `pause()`, so there
// is one place to look when asking whether it can leak.

type Entry = {
  kind: "photo" | "note";
  title: string;
  /** Where the camera sits, in the memory world's own coordinates. */
  x: number;
  y: number;
  width: number;
  height: number;
};

const ENTRIES: Entry[] = [
  { kind: "photo", title: "Learning to let it be imperfect.", x: 295, y: 272, width: 370, height: 445 },
  { kind: "photo", title: "A little further than last time.", x: 945, y: 316, width: 450, height: 430 },
  { kind: "note", title: "It doesn’t have to be perfect to be worth keeping.", x: 1550, y: 280, width: 320, height: 350 },
];

/** Reference dwell: a photo reads in 6s, a note needs longer to actually read. */
const PHOTO_DWELL = 6000;
const NOTE_DWELL = 8500;

export default function MemoryWalk() {
  const { paused: motionPaused } = useMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [notes, setNotes] = useState(false);
  const [view, setView] = useState<"collage" | "cinema">("collage");
  const [announcement, setAnnouncement] = useState("");

  const worldRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useReveal<HTMLDivElement>();

  // Notes off removes the note from the queue entirely — it is not merely
  // hidden, so it cannot be reached by previous/next or by playback.
  const queue = useMemo(() => (notes ? [0, 1, 2] : [0, 1]), [notes]);
  const position = queue.indexOf(index);
  const atEnd = position >= queue.length - 1;

  // Derived rather than stored. The journey stops at the last entry and when
  // motion is paused, and deriving that means those two facts cannot disagree
  // with a `playing` flag someone forgot to clear — the timer effect below
  // simply has nothing to schedule.
  const running = playing && !atEnd && !motionPaused;

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const centre = useCallback(() => {
    const world = worldRef.current;
    const viewport = viewportRef.current;
    if (!world || !viewport) return;
    if (view !== "cinema") {
      world.style.transform = "";
      return;
    }
    const stop = ENTRIES[index];
    // Fit width AND height, so a tall card is never cropped to fit a wide one.
    const scale = Math.min(
      (viewport.clientWidth * 0.79) / stop.width,
      (viewport.clientHeight * 0.84) / stop.height,
      1.1,
    );
    const x = viewport.clientWidth / 2 - stop.x * scale;
    const y = viewport.clientHeight / 2 - stop.y * scale;
    world.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  }, [index, view]);

  useEffect(centre, [centre]);

  const show = useCallback(
    (next: number, alsoPause = true) => {
      if (!queue.includes(next)) return;
      if (alsoPause) pause();
      setIndex(next);
      setView("cinema");
      setAnnouncement(ENTRIES[next].title);
    },
    [pause, queue],
  );

  // The one scheduler. It re-arms from the current entry, and every dependency
  // change clears the previous timeout first, so switching notes or stepping by
  // hand mid-journey cannot leave a second timer behind. The last entry
  // schedules nothing, which is how playback ends: the memory stays on screen
  // and replay is a deliberate second press.
  useEffect(() => {
    clearTimer();
    if (!running || view !== "cinema") return;
    const at = queue.indexOf(index);
    timer.current = setTimeout(
      () => show(queue[at + 1], false),
      ENTRIES[index].kind === "note" ? NOTE_DWELL : PHOTO_DWELL,
    );
    return clearTimer;
  }, [running, index, view, queue, show, clearTimer]);

  // Everything that should stop a journey.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      clearTimer();
    };
  }, [pause, clearTimer]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) pause();
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pause]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => centre());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [centre]);

  const toggleNotes = (on: boolean) => {
    pause();
    setNotes(on);
    // If the note was on screen when it was switched off, fall back rather
    // than sitting on an entry that no longer exists.
    if (!on && index === 2) setIndex(1);
  };

  const playLabel = running
    ? "Pause journey"
    : atEnd
      ? "Replay journey"
      : "Play the journey";

  return (
    <section className="memories section-pad" id="memories" aria-labelledby="memory-title">
      <div className="memory-heading reveal" ref={headingRef}>
        <p className="eyebrow">03 / MORE THAN A COLLECTION</p>
        <h2 id="memory-title">
          You found a hobby.
          <br />
          <em>Then you made a story.</em>
        </h2>
        <p>
          The first try. The small win. The &ldquo;I made that.&rdquo;
          <br />
          Flip your graph and wander through what you&rsquo;ve been becoming.
        </p>
      </div>

      <div
        className={`memory-view${notes ? " with-notes" : ""}`}
        data-view={view}
        ref={sectionRef}
      >
        <div className="memory-top">
          <span>
            <Image src="/landing/photo-node.svg" alt="" width={20} height={20} />
            Memory Walk
          </span>
          <div className="memory-options">
            <label>
              <input
                type="checkbox"
                checked={notes}
                onChange={(e) => toggleNotes(e.target.checked)}
              />
              Include notes
            </label>
            <button
              aria-pressed={view === "collage"}
              onClick={() => {
                pause();
                setView((v) => (v === "collage" ? "cinema" : "collage"));
              }}
            >
              Collage
            </button>
          </div>
        </div>

        <div className="memory-viewport" ref={viewportRef}>
          <div className="memory-world" ref={worldRef}>
            <svg className="memory-thread" viewBox="0 0 1800 620" aria-hidden="true">
              <path d="M330 285Q630 80 950 320T1550 250" />
            </svg>

            <button
              className={`memory-card photo-card card-clay${index === 0 ? " active" : ""}`}
              aria-pressed={index === 0 && view === "cinema"}
              onClick={() => show(0)}
            >
              <Image
                src="/landing/pottery.webp"
                alt="Hands shaping a ceramic bowl on a pottery wheel"
                width={370}
                height={330}
              />
              <span>
                <strong>Learning to let it be imperfect.</strong>
                <small>Pottery · 06 September 2026 · sample</small>
              </span>
            </button>

            <button
              className={`memory-card photo-card card-ridge${index === 1 ? " active" : ""}`}
              aria-pressed={index === 1 && view === "cinema"}
              onClick={() => show(1)}
            >
              <Image
                src="/landing/hiking.webp"
                alt="An alpine ridge with a hiker in a yellow jacket"
                width={450}
                height={320}
              />
              <span>
                <strong>A little further than last time.</strong>
                <small>Hiking · 07 September 2026 · sample</small>
              </span>
            </button>

            {/* Unmounted when notes are off: out of the layout as well as the
                queue, which is what "excluded from the collage" has to mean. */}
            {notes && (
              <button
                className={`memory-card note-card${index === 2 ? " active" : ""}`}
                aria-pressed={index === 2 && view === "cinema"}
                onClick={() => show(2)}
              >
                <span className="note-pin" aria-hidden="true" />
                <small>A NOTE TO MYSELF</small>
                <strong>It doesn’t have to be perfect to be worth keeping.</strong>
                <span>Pottery · Posted 08 September 2026 · sample</span>
              </button>
            )}
          </div>
        </div>

        <div className="memory-controls">
          <span>
            {view === "collage"
              ? notes
                ? "Two photos. One note. Your little world."
                : "Two moments. One little world."
              : `${position + 1} / ${queue.length} · ${
                  index === 2 ? "A note to myself" : index === 0 ? "Pottery" : "Hiking"
                }`}
          </span>
          <div>
            <button
              aria-label="Previous memory"
              disabled={position <= 0}
              onClick={() => show(queue[Math.max(0, position - 1)])}
            >
              ←
            </button>
            <button
              onClick={() => {
                if (running) {
                  pause();
                  return;
                }
                // Replaying from the end starts over rather than sitting still.
                show(atEnd ? queue[0] : index, false);
                setPlaying(true);
              }}
            >
              {playLabel}{" "}
              <span aria-hidden="true">
                {running ? "Ⅱ" : atEnd ? "↻" : "▷"}
              </span>
            </button>
            <button
              aria-label="Next memory"
              disabled={atEnd}
              onClick={() => show(queue[Math.min(queue.length - 1, position + 1)])}
            >
              →
            </button>
          </div>
          <span className="sample-label">ILLUSTRATIVE MEMORIES</span>
        </div>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      <p className="memory-footnote">
        Photos first. Notes when you want them. All the little things that make it
        yours.
      </p>
    </section>
  );
}
