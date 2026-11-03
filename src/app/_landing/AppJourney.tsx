"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef } from "react";
import { useMotion } from "./useMotion";
import {
  previewChapter,
  previewReducer,
  type PreviewScreen,
} from "./appPreviewState";

const CHAPTERS = [
  {
    title: "Find your spark.",
    word: "spark.",
    intro: "Find your",
    copy: "Start with what you love. Open a hobby, get a feel for it, and keep the ones that pull you in.",
    screen: "graph",
  },
  {
    title: "Make room for it.",
    word: "for it.",
    intro: "Make room",
    copy: "A little time is all it takes to begin. Pick a day, a duration, and somewhere to give it a go.",
    screen: "plan",
  },
  {
    title: "Let a story grow.",
    word: "grow.",
    intro: "Let a story",
    copy: "The first session. A photograph. A few words. Your collection becomes a record of the things you try.",
    screen: "progress",
  },
] as const;
const SCREENS: Record<
  PreviewScreen,
  { alt: string; label: string; action: string; next: PreviewScreen }
> = {
  graph: {
    alt: "Actual Aspect Niche iOS graph with connected hobby nodes and five navigation tabs",
    label: "The connected hobby map",
    action: "Read about Pottery",
    next: "about",
  },
  about: {
    alt: "Actual Pottery About screen: description, Collect this hobby and beginner information",
    label: "A closer look at Pottery",
    action: "Collect this hobby",
    next: "plan",
  },
  plan: {
    alt: "Actual Pottery Plan pane with Plan a session and preparation steps",
    label: "The Pottery planning pane",
    action: "Plan a session",
    next: "session",
  },
  session: {
    alt: "Actual iOS session editor showing date, time, duration, place and optional calendar",
    label: "The real session editor",
    action: "Back to the plan",
    next: "plan",
  },
  progress: {
    alt: "Actual Pottery Progress pane with Log your first session, Add photo and Write a reflection",
    label: "Where your story begins",
    action: "Explore the memory sample",
    next: "progress",
  },
  gallery: {
    alt: "Actual iOS hobby graph in the warm paper Gallery theme",
    label: "The same map, in Gallery",
    action: "Return to Midnight",
    next: "graph",
  },
};

export default function AppJourney() {
  const { paused } = useMotion();
  const [state, dispatch] = useReducer(previewReducer, {
    screen: "graph",
    manual: false,
  });
  const sectionRef = useRef<HTMLElement>(null),
    deviceRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null),
    travelerRef = useRef<SVGCircleElement>(null);
  const progress = useRef(0);
  const chapter = previewChapter(state.screen),
    scene = CHAPTERS[chapter],
    screen = SCREENS[state.screen];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (paused) {
      section.style.setProperty("--journey-p", "0");
      return;
    }
    let frame = 0,
      visible = false;
    const length = routeRef.current?.getTotalLength() ?? 0;
    const update = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const rect = section.getBoundingClientRect();
      const wide = window.matchMedia(
        "(min-width: 901px) and (min-height: 740px)",
      ).matches;
      const p = wide
        ? Math.max(
            0,
            Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)),
          )
        : 0;
      progress.current = p;
      section.style.setProperty("--journey-p", String(p));
      if (routeRef.current && travelerRef.current) {
        const point = routeRef.current.getPointAtLength(p * length);
        travelerRef.current.setAttribute("cx", String(point.x));
        travelerRef.current.setAttribute("cy", String(point.y));
      }
      if (wide) dispatch({ type: "scroll", progress: p });
    };
    const schedule = () => {
      if (!frame && visible && !document.hidden)
        frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [paused]);

  useEffect(() => {
    if (paused || !deviceRef.current) return;
    const animation = deviceRef.current.animate(
      [
        {
          opacity: 0.25,
          transform: "perspective(1400px) rotateY(-8deg) scale(.975)",
        },
        { opacity: 1, transform: "perspective(1400px) rotateY(0deg) scale(1)" },
      ],
      { duration: 440, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    return () => animation.cancel();
  }, [state.screen, paused]);

  const choose = (next: PreviewScreen) =>
    dispatch({ type: "choose", screen: next });
  return (
    <section
      ref={sectionRef}
      id="app"
      className="app-journey"
      data-journey-scene
      aria-labelledby="app-title"
      data-chapter={chapter}
    >
      <div className="app-journey-sticky">
        <div className="app-constellation" aria-hidden="true">
          <svg viewBox="0 0 1400 900" fill="none">
            <path d="M-100 800C260 800 110 155 460 180S790 770 1070 490S1190 140 1510 90" />
            <path d="M-100 300C300 80 390 680 770 600S1120 100 1500 390" />
            <circle cx="460" cy="180" r="6" />
            <circle cx="1070" cy="490" r="8" />
            <circle cx="770" cy="600" r="4" />
            <path
              ref={routeRef}
              className="app-route"
              d="M460 180C760 80 1250 230 1070 490S640 790 770 600"
            />
            <circle
              ref={travelerRef}
              className="app-traveler"
              cx="460"
              cy="180"
              r="10"
            />
          </svg>
        </div>
        <div className="app-journey-copy">
          <p className="eyebrow">01 / A LITTLE WORLD IN YOUR POCKET</p>
          <h2 key={scene.title} id="app-title" className="app-scene-title">
            {scene.intro}
            <br />
            <em>{scene.word}</em>
          </h2>
          <p className="app-intro">{scene.copy}</p>
          <div
            className="app-chapters"
            role="group"
            aria-label="App walkthrough chapters"
          >
            {CHAPTERS.map((item, index) => (
              <button
                key={item.title}
                onClick={() => choose(item.screen)}
                aria-pressed={chapter === index}
              >
                <span>0{index + 1}</span>
                {item.title}
              </button>
            ))}
          </div>
          <div className="app-step-actions">
            {state.screen === "progress" ? (
              <a className="app-try" href="#memories">
                {screen.action} <span aria-hidden="true">↘</span>
              </a>
            ) : (
              <button className="app-try" onClick={() => choose(screen.next)}>
                {screen.action} <span aria-hidden="true">↗</span>
              </button>
            )}
            {state.manual && !paused && (
              <button
                className="follow-scroll"
                onClick={() =>
                  dispatch({ type: "follow", progress: progress.current })
                }
              >
                Follow scroll again
              </button>
            )}
          </div>
          <p className="app-preview-note">
            Captured in the iOS app. A guided preview.
            <br />
            Selections here do not change your collection.
          </p>
        </div>
        <div className="app-device-scene">
          <div className="device-orbit orbit-back" aria-hidden="true" />
          <div className="device-orbit orbit-front" aria-hidden="true" />
          <span className="device-coordinate" aria-hidden="true">
            CURIOSITY / 0{chapter + 1}
          </span>
          <div className="device-travel">
            <div className="app-device" ref={deviceRef}>
              <div className="device-edge" aria-hidden="true" />
              <div className="device-screen">
                <Image
                  src={`/landing/app-preview/${state.screen}.webp`}
                  alt={screen.alt}
                  width={804}
                  height={1748}
                  sizes="(max-width: 900px) 280px, 340px"
                  unoptimized
                  className="native-screen"
                />
                {state.screen === "about" && (
                  <button
                    className="screen-hotspot hotspot-collect"
                    aria-label="Collect this hobby in the guided preview"
                    onClick={() => choose("plan")}
                  />
                )}
                {state.screen === "plan" && (
                  <>
                    <button
                      className="screen-hotspot hotspot-plan"
                      aria-label="Plan a session in the guided preview"
                      onClick={() => choose("session")}
                    />
                    <button
                      className="screen-hotspot hotspot-progress"
                      aria-label="Show the Progress pane"
                      onClick={() => choose("progress")}
                    />
                  </>
                )}
                {state.screen === "progress" && (
                  <button
                    className="screen-hotspot hotspot-tab-plan"
                    aria-label="Show the Plan pane"
                    onClick={() => choose("plan")}
                  />
                )}
                {state.screen === "session" && (
                  <button
                    className="screen-hotspot hotspot-cancel"
                    aria-label="Close the sample session editor without saving"
                    onClick={() => choose("plan")}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="device-caption">
            <span aria-live="polite">{screen.label}</span>
            <button
              onClick={() =>
                choose(state.screen === "gallery" ? "graph" : "gallery")
              }
              aria-pressed={state.screen === "gallery"}
            >
              {state.screen === "gallery" ? "Midnight" : "Try Gallery"}{" "}
              <span aria-hidden="true">◐</span>
            </button>
          </div>
          <div className="mobile-device-action">
            {state.screen === "progress" ? (
              <a className="app-try" href="#memories">
                {screen.action} <span aria-hidden="true">↘</span>
              </a>
            ) : (
              <button className="app-try" onClick={() => choose(screen.next)}>
                {screen.action} <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        </div>
        <a className="app-next-node" href="#discover">
          <span className="journey-bead" />
          Now follow a connection <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
