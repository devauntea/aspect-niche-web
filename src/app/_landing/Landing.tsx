"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./landing.css";
import { MotionContext } from "./useMotion";
import { useReveal } from "./useReveal";
import Hero from "./Hero";
import DiscoveryStory from "./DiscoveryStory";
import ThemeStudio from "./ThemeStudio";
import MemoryWalk from "./MemoryWalk";

// The landing page.
//
// Everything is scoped under `.anl` — the reference ships a buildless
// stylesheet with bare `body`, `*` and `h2` rules, and dropping those into a
// site that already has a demo route and a privacy page would restyle both.
// The scope keeps the design intact without letting it leak.
//
// `js-motion` goes on the same element and is added only once this component
// has mounted, which is what makes the entrance animations safe: the hidden
// state is written against that class, so copy stays readable if the script
// never runs.

function Statement() {
  const eyebrow = useReveal<HTMLParagraphElement>();
  const heading = useReveal<HTMLHeadingElement>();
  const copy = useReveal<HTMLParagraphElement>();
  return (
    <section className="statement section-pad">
      <p className="eyebrow reveal" ref={eyebrow}>
        A DIFFERENT KIND OF DISCOVERY
      </p>
      <h2 className="reveal" ref={heading}>
        Your next obsession
        <br />
        is <em>one connection away.</em>
      </h2>
      <p className="statement-copy reveal" ref={copy}>
        Not another feed to get lost in. A living map of things to get into.
        <br />
        Start with what you love. Wander into what you might.
      </p>
    </section>
  );
}

function Closing() {
  const eyebrow = useReveal<HTMLParagraphElement>();
  const heading = useReveal<HTMLHeadingElement>();
  return (
    <section className="closing section-pad" aria-labelledby="closing-title">
      <div className="closing-orbit" aria-hidden="true" />
      <Image
        className="closing-rabbit"
        src="/landing/rabbit.svg"
        alt=""
        width={95}
        height={100}
      />
      <p className="eyebrow reveal" ref={eyebrow}>
        THERE&rsquo;S MORE TO YOU THAN YOU KNOW.
      </p>
      <h2 id="closing-title" className="reveal" ref={heading}>
        Go down
        <br />
        the <em>rabbit hole.</em>
      </h2>
      {/* The acquisition CTA goes to the real demo route, not back to the
          section above it. The reference pointed at its own graph because it
          had nowhere else to go. */}
      <Link className="button light" href="/demo">
        Find your first connection <span aria-hidden="true">↗</span>
      </Link>
      <p>A little curiosity looks good on you.</p>
    </section>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export default function Landing() {
  // The OS preference is external state, so it is read rather than copied into
  // an effect — that way a change to it re-renders on its own and there is no
  // moment where the two disagree. The server snapshot is `false`, which is the
  // only honest answer before there is a window to ask.
  const prefersReduced = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  // The pause control overrides the preference in either direction. Null means
  // nobody has touched it, so the OS still decides.
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? prefersReduced;
  const setPaused = useCallback((next: boolean) => setOverride(next), []);

  // `js-motion` is what the entrance animations hang their hidden state on, so
  // it must appear only once this is running in a browser. Added to the node
  // directly rather than held in state: it is a fact about the DOM, and routing
  // it through a render would mean a second pass on every load.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.classList.add("js-motion");
  }, []);

  return (
    <MotionContext.Provider value={{ paused, setPaused }}>
      <div ref={rootRef} className={`anl${paused ? " motion-paused" : ""}`}>
        <a className="skip" href="#discover">
          Skip to the interactive graph
        </a>

        <header className="masthead">
          <a className="brand" href="#top" aria-label="Aspect Niche home">
            <Image src="/landing/rabbit.svg" alt="" width={31} height={34} />
            <span>
              aspect niche<span className="brand-dot">.</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#discover">Discover</a>
            <a href="#studio">Make it yours</a>
            <a href="#memories">Your story</a>
          </nav>
          <Link className="nav-cta" href="/demo">
            Take a look <span aria-hidden="true">↗</span>
          </Link>
        </header>

        <main>
          <Hero />
          <Statement />
          <DiscoveryStory />
          <ThemeStudio />
          <MemoryWalk />
          <Closing />
        </main>

        <footer>
          <a className="brand" href="#top">
            aspect niche<span className="brand-dot">.</span>
          </a>
          <p>Follow your curiosity.</p>
          {/* Kept from the previous site: the store requires a reachable
              privacy policy and the footer is where a reviewer looks. */}
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
          <Link href="/demo">
            Try the demo <span aria-hidden="true">↗</span>
          </Link>
          <span>© 2026 Aspect Niche · Built by Devauntae Norman</span>
        </footer>

        <button
          className="motion-toggle"
          aria-pressed={paused}
          aria-label={paused ? "Enable decorative motion" : "Pause decorative motion"}
          onClick={() => setPaused(!paused)}
        >
          ◫ <span>{paused ? "Motion paused" : "Pause motion"}</span>
        </button>
      </div>
    </MotionContext.Provider>
  );
}
