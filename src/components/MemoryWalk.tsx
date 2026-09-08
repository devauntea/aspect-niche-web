"use client";

// Memory Walk: a camera moving through what you have already done.
//
// The queue, the ordering and the dwell times all live in lib/memoryWalk, which
// is ported from the app and tested without a canvas. This file is the viewer:
// one photograph at a time with its caption, a collage of the same entries, and
// the controls.
//
// Two rules the spec is emphatic about, and both are easy to get wrong:
//
//   **One timer and one transition, ever.** Every manual move cancels the
//   pending one. Callbacks carry an epoch, so a step already in flight cannot
//   advance past the entry you just chose by hand.
//
//   **Playback is opt-in.** It never autoplays on open, it stops on the last
//   entry rather than looping, and leaving cancels everything outstanding.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PACE_CHOICES,
  TRAVEL_MS,
  buildQueue,
  dwellMs,
  reconcileIndex,
  scopeOptions,
  type WalkPace,
  type WalkScope,
} from "@/lib/memoryWalk";
import type { HobbyPhoto, PinnedNote } from "@/lib/progress";

type Props = {
  collected: string[];
  photos: Record<string, HobbyPhoto[]>;
  notes: Record<string, PinnedNote[]>;
  labels: Record<string, string>;
  /** Opens scoped to one hobby when entered from a focused one. */
  initialScope?: WalkScope;
  onClose: () => void;
};

export default function MemoryWalk({
  collected,
  photos,
  notes,
  labels,
  initialScope,
  onClose,
}: Props) {
  const [scope, setScope] = useState<WalkScope>(initialScope ?? { kind: "all" });
  const [includeNotes, setIncludeNotes] = useState(false);
  const [pace, setPace] = useState<WalkPace>("slow");
  const [collage, setCollage] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const queue = useMemo(
    () => buildQueue({ collected, photos, notes, labels, scope, includeNotes }),
    [collected, photos, notes, labels, scope, includeNotes],
  );

  // The queue can change under the viewer — notes switched off mid-note, scope
  // narrowed. reconcileIndex walks the OLD order to pick the nearest survivor,
  // which is why the previous queue is kept rather than rebuilt.
  const prevQueue = useRef(queue);
  const currentId = useRef<string | null>(null);
  useEffect(() => {
    if (prevQueue.current !== queue) {
      const next = reconcileIndex(prevQueue.current, queue, currentId.current);
      setIndex(next < 0 ? 0 : next);
      setPlaying(false);
      prevQueue.current = queue;
    }
  }, [queue]);

  // Clamped during render, not only in the effect above. Turning notes off
  // shrinks the queue, and React renders with the new queue and the *old*
  // index before any effect runs — so `queue[index]` is briefly undefined and
  // reading `.entry` off it takes the whole viewer down. Found by doing exactly
  // that: stepping to a note, then switching notes off.
  const safeIndex = queue.length === 0 ? 0 : Math.min(index, queue.length - 1);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const epoch = useRef(0);

  const cancel = useCallback(() => {
    epoch.current += 1;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // Leaving, unmounting or backgrounding cancels outstanding work. Coming back
  // does not resume: restarting is a decision the viewer makes, not the tab.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) {
        cancel();
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      cancel();
    };
  }, [cancel]);

  useEffect(() => {
    if (!playing) return;
    const item = queue[safeIndex];
    if (!item) return;
    if (safeIndex >= queue.length - 1) {
      // Stop on the last entry. Replay is an explicit action.
      setPlaying(false);
      return;
    }
    const mine = ++epoch.current;
    const hold = dwellMs(item, pace);
    timer.current = setTimeout(() => {
      if (epoch.current !== mine) return;
      setIndex((i) => Math.min(i + 1, queue.length - 1));
    }, hold);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, safeIndex, queue, pace]);

  const go = useCallback(
    (next: number) => {
      cancel();
      setPlaying(false);
      setIndex(Math.max(0, Math.min(next, queue.length - 1)));
    },
    [cancel, queue.length],
  );

  const current = queue[safeIndex];
  currentId.current = current ? current.id : null;
  const scopes = useMemo(
    () => scopeOptions(collected, photos, notes, labels, includeNotes),
    [collected, photos, notes, labels, includeNotes],
  );

  return (
    <div className="mw-root" role="dialog" aria-modal="true" aria-label="Memory walk">
      <header className="mw-bar">
        <button type="button" onClick={onClose} className="mw-btn">
          Close
        </button>
        <span className="mw-count" aria-live="polite">
          {queue.length === 0
            ? "Nothing to show yet"
            : `${safeIndex + 1} of ${queue.length}`}
        </span>
        <button
          type="button"
          onClick={() => setCollage((c) => !c)}
          className="mw-btn"
          aria-pressed={collage}
        >
          {collage ? "Cinematic" : "Collage"}
        </button>
      </header>

      {queue.length === 0 ? (
        <div className="mw-empty">
          <p>
            {includeNotes
              ? "Nothing has been added to this hobby yet."
              : "No photos here yet. Turning on notes may show something."}
          </p>
        </div>
      ) : collage ? (
        <div className="mw-collage">
          {queue.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`mw-tile ${i === safeIndex ? "is-current" : ""}`}
              onClick={() => {
                go(i);
                setCollage(false);
              }}
              aria-label={`${item.hobbyLabel}. ${item.caption}`}
            >
              {item.entry.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.entry.photo.uri} alt="" className="mw-tile-img" />
              ) : (
                <span className="mw-tile-note">{item.entry.note.body}</span>
              )}
              <span className="mw-tile-cap">{item.caption}</span>
            </button>
          ))}
        </div>
      ) : (
        <figure className="mw-stage">
          {current.entry.kind === "photo" ? (
            // Contained, never cropped: the photograph is the thing being
            // looked at, and a fixed aspect ratio would cut it.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.entry.photo.uri}
              alt={`${current.hobbyLabel}, sample memory`}
              className="mw-photo"
            />
          ) : (
            <div className="mw-note">
              <p>{current.entry.note.body}</p>
            </div>
          )}
          <figcaption className="mw-caption">
            <strong>{current.hobbyLabel}</strong>
            <span>{current.caption}</span>
            <span className="mw-sample">sample</span>
          </figcaption>
        </figure>
      )}

      <footer className="mw-controls">
        <div className="mw-nav">
          <button
            type="button"
            className="mw-btn"
            onClick={() => go(safeIndex - 1)}
            disabled={safeIndex === 0 || queue.length === 0}
            aria-label="Previous memory"
          >
            ←
          </button>
          <button
            type="button"
            className="mw-btn mw-play"
            onClick={() => {
              if (playing) {
                cancel();
                setPlaying(false);
              } else {
                if (safeIndex >= queue.length - 1) setIndex(0);
                setPlaying(true);
              }
            }}
            disabled={queue.length < 2}
          >
            {playing
              ? "Pause"
              : safeIndex >= queue.length - 1 && queue.length > 1
                ? "Replay"
                : "Play"}
          </button>
          <button
            type="button"
            className="mw-btn"
            onClick={() => go(safeIndex + 1)}
            disabled={safeIndex >= queue.length - 1}
            aria-label="Next memory"
          >
            →
          </button>
        </div>

        <div className="mw-options">
          <label className="mw-check">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => {
                cancel();
                setPlaying(false);
                setIncludeNotes(e.target.checked);
              }}
            />
            Include notes
          </label>

          {scopes.length > 1 && (
            <label className="mw-check">
              <span className="mw-scope-label">Showing</span>
              <select
                value={scope.kind === "hobby" ? scope.hobbyId : "all"}
                onChange={(e) => {
                  cancel();
                  setPlaying(false);
                  setScope(
                    e.target.value === "all"
                      ? { kind: "all" }
                      : { kind: "hobby", hobbyId: e.target.value },
                  );
                }}
              >
                <option value="all">Everything</option>
                {scopes.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="mw-check">
            <span className="mw-scope-label">Pace</span>
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value as WalkPace)}
            >
              {PACE_CHOICES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </footer>
    </div>
  );
}

/** Exported for the travel timing the scene uses. */
export { TRAVEL_MS };
