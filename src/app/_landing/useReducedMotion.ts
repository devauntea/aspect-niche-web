"use client";

import { useSyncExternalStore } from "react";

// The OS reduced-motion preference, as external state: read rather than
// copied into an effect, so a change to it re-renders on its own. The server
// snapshot is `false`, the only honest answer before there is a window.

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Calls back once, the first time the element is at least `threshold` on
 *  screen. Without an observer it calls back straight away, so whatever it
 *  reveals is never stranded hidden. */
export function onFirstView(
  el: Element,
  callback: () => void,
  threshold = 0.3,
) {
  if (typeof IntersectionObserver === "undefined") {
    callback();
    return () => {};
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        callback();
      }
    },
    { threshold },
  );
  observer.observe(el);
  return () => observer.disconnect();
}
