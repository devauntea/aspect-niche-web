"use client";

import { useEffect, useRef, useState } from "react";
import { onFirstView, useReducedMotion } from "./useReducedMotion";

// The film's second beat: the thought that stalls.
//
// "I should try that." types itself once, the first time it scrolls into view,
// the way the film types it; the caret stops when the sentence does, so
// nothing is left blinking. Screen readers get the whole sentence at once,
// and with reduced motion so does everyone else.

const THOUGHT = "I should try that.";

export default function Stall() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const [typed, setTyped] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const stop = onFirstView(
      el,
      () => {
        let n = 0;
        const tick = () => {
          n += 1;
          setTyped(n);
          if (n < THOUGHT.length) timer = setTimeout(tick, n === 1 ? 260 : 62);
        };
        setTyped(0);
        timer = setTimeout(tick, 420);
      },
      0.6,
    );
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, [reduced]);

  // Null means typing never started (no script yet, or reduced motion): show
  // the sentence whole.
  const shown = typed === null ? THOUGHT : THOUGHT.slice(0, typed);
  const typing = typed !== null && typed < THOUGHT.length;

  return (
    <section className="stall" aria-labelledby="stall-title">
      <div className="container stall-inner">
        <h2 id="stall-title" ref={ref} className="stall-line">
          Most of us never get past{" "}
          <span className="stall-thought">
            <span className="sr-only">&ldquo;{THOUGHT}&rdquo;</span>
            <span aria-hidden="true">
              &ldquo;{shown}
              {typing ? <span className="caret" /> : <>&rdquo;</>}
            </span>
          </span>
        </h2>
        <p className="stall-voice voice">
          Not for lack of curiosity. For lack of a way in.
        </p>
        <p className="stall-answer">
          Aspect Niche is the way in. It starts from what already pulls at you,
          shows you what each hobby really asks of you, and stays with you
          through the plan, the people you bring, and the photos afterwards.
        </p>
      </div>
    </section>
  );
}
