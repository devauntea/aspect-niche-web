"use client";

import { useEffect, useRef } from "react";

/**
 * Fades a block in when it first scrolls into view.
 *
 * The element is visible by default in CSS; the hidden state only applies under
 * `.js-motion`, which the page adds once this is actually running. So a
 * scripting failure, a missing IntersectionObserver, or an observer that never
 * fires leaves the copy readable rather than invisible — which is the one way
 * an entrance animation can genuinely break a page.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
