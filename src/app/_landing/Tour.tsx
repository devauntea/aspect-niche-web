"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { encodeInvite } from "@/lib/invite";
import { useReducedMotion } from "./useReducedMotion";

// How it works: eight moments from the app, in the order you would live them.
//
// Every clip is a real recording of the app (the iOS Simulator captures the
// launch film was cut from, at the same in-points), and every claim beside it
// is one the film's narration makes and a recording shows. The copy says what
// a feature does; the phone shows it doing it.
//
// One phone stays pinned on wide screens while the steps scroll past it; on
// narrow screens each step carries its own. Clips load nothing until their
// step is on screen, play muted only while it is, and one control pauses
// them all. Reduced motion starts them paused, on their first frame.

type Step = {
  id: string;
  title: string;
  /** The narrator's line for this moment, from the film. */
  voice: string;
  body: string;
  clip: string;
  /** What the recording shows, for anyone who cannot see it. */
  alt: string;
};

const STEPS: Step[] = [
  {
    id: "map",
    title: "Map what you love",
    voice: "Tell it what pulls at you, and a living map unfolds.",
    body: "Pick two or more interest clusters and the app builds a graph of hobbies around them, each linked to everything it has in common with the others. Then you explore.",
    clip: "map",
    alt: "Clusters ticked on the onboarding screen, then the graph drawing itself in.",
  },
  {
    id: "card",
    title: "See what it really takes",
    voice: "Every hobby has its own rabbit hole.",
    body: "Tap a hobby for where it happens, how often, how hard it is to start and what it costs. If it hooks you, go further: each one opens onto a deeper niche, like Pottery's reduction firing and glaze chemistry.",
    clip: "card",
    alt: "The Pottery card: Indoors, Regular, Beginner, Social, Some gear, and its rabbit hole.",
  },
  {
    id: "collect",
    title: "Keep the ones that speak to you",
    voice: "Together, they become your constellation.",
    body: "Collect a hobby and it stays with you. Flip the graph, and the ones you kept are all that is left: a map of what you are actually getting into.",
    clip: "collect",
    alt: "The flipped graph, showing only the collected hobbies.",
  },
  {
    id: "board",
    title: "Give a new idea room to grow",
    voice: "A board that is all yours.",
    body: "Every hobby can have a vision board: shapes, a pen, notes and the paper of your choice, for the ideas that are not plans yet.",
    clip: "board",
    alt: "A vision board being drawn on with the pen.",
  },
  {
    id: "plan",
    title: "Turn someday into a plan",
    voice: "Pick a time, pick a place, and it’s waiting in Plans.",
    body: "Schedule a session with a live place search, put it on your calendar if you like, and find it again under Plans when the day comes.",
    clip: "plan",
    alt: "Choosing a place for a session by searching for Somerville, Massachusetts.",
  },
  {
    id: "invite",
    title: "Bring someone",
    voice: "An invitation is just a link, and it opens for anyone, app or not.",
    body: "Send it through any messaging app. Your friend answers in their browser with just their name: no account, no download.",
    clip: "invite",
    alt: "The share sheet for an invitation link on aspectniche.com.",
  },
  {
    id: "dates",
    title: "Plan a date together",
    voice: "Offer a few ideas, then pass the phone, and decide together.",
    body: "Put a few ideas and times forward, hand the phone over, and see where the two of you agree. Or send the plan as a link and let them answer from their own phone.",
    clip: "dates",
    alt: "Reviewing a date invitation, with the Pass the phone button.",
  },
  {
    id: "memories",
    title: "Walk back through it",
    voice: "Every photo and every note stays with the hobby it belongs to.",
    body: "Add photos and notes as you go. Later, take a Memory Walk through them and see how far you have come.",
    clip: "memories",
    alt: "Rock Climbing's progress: five photos and a note, then the Memory Walk.",
  },
];

const noSubscription = () => () => {};

/** The width at which the phone pins beside the steps (landing.css). */
const WIDE = "(min-width: 1000px)";
function subscribeWide(onChange: () => void) {
  const q = window.matchMedia(WIDE);
  q.addEventListener("change", onChange);
  return () => q.removeEventListener("change", onChange);
}

/** A sample invitation for the "Bring someone" step: the same encoder the app
 *  uses, so the page it opens is exactly what a guest would see. */
function sampleInviteHref(): string {
  const start = new Date();
  start.setDate(start.getDate() + ((6 - start.getDay() + 7) % 7 || 7));
  start.setHours(14, 0, 0, 0);
  const encoded = encodeInvite({
    id: "sample",
    host: "Sam",
    kind: "hobby",
    title: "Pottery taster (a sample invitation)",
    activityId: "pottery",
    category: "craft",
    startsAt: start.toISOString(),
    durationMinutes: 120,
    tzOffset: -start.getTimezoneOffset(),
    place: "Somerville, Massachusetts",
    note: "This is a sample from aspectniche.com, so nobody is expecting you. A real invitation looks exactly like this.",
  });
  return `/i?d=${encodeURIComponent(encoded)}`;
}

function Clip({
  name,
  playing,
  alt,
  shown = true,
}: {
  name: string;
  playing: boolean;
  alt: string;
  shown?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);
  return (
    <video
      ref={ref}
      className="clip"
      data-shown={shown}
      muted
      loop
      playsInline
      preload="none"
      poster={`/film/clips/${name}.jpg`}
      aria-label={alt}
    >
      <source src={`/film/clips/${name}.mp4`} type="video/mp4" />
    </video>
  );
}

export default function Tour() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const paused = userPaused ?? reduced;
  // Only the phone that is actually laid out plays: the pinned one on wide
  // screens, the step's own one on narrow ones.
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );

  // The sample's date is "next Saturday" by the reader's own clock, which the
  // server cannot know, so the server renders a plain link to the page and
  // the browser swaps in the dated one as it hydrates.
  const inviteHref = useSyncExternalStore(
    noSubscription,
    sampleInviteHref,
    () => "/i",
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const steps = Array.from(
      section.querySelectorAll<HTMLElement>("[data-step]"),
    );
    const stepObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.forEach((s) => stepObserver.observe(s));
    const sectionObserver = new IntersectionObserver(([e]) =>
      setInView(e.isIntersecting),
    );
    sectionObserver.observe(section);
    return () => {
      stepObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const playing = inView && !paused;

  return (
    <section
      className="tour"
      id="tour"
      aria-labelledby="tour-title"
      ref={sectionRef}
    >
      <div className="container tour-head">
        <h2 id="tour-title">
          From &ldquo;I should try that&rdquo; to actually trying it.
        </h2>
        <p>
          Eight moments from the app, in the order you would live them. Every
          clip is recorded straight from Aspect Niche.
        </p>
        <button
          type="button"
          className="btn btn-quiet clip-toggle"
          aria-pressed={paused}
          onClick={() => setUserPaused(!paused)}
        >
          {paused ? "Play the clips" : "Pause the clips"}
        </button>
      </div>

      <div className="container tour-grid">
        <div className="tour-stage" aria-hidden="true">
          <div className="device device-stage">
            <div className="device-screen">
              {STEPS.map((s, i) => (
                <Clip
                  key={s.id}
                  name={s.clip}
                  alt={s.alt}
                  playing={playing && wide && active === i}
                  shown={active === i}
                />
              ))}
            </div>
          </div>
          <ol className="tour-progress">
            {STEPS.map((s, i) => (
              <li key={s.id} data-on={active === i} />
            ))}
          </ol>
        </div>

        <ol className="tour-steps">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className="tour-step"
              data-step={i}
              data-active={active === i}
              id={`tour-${s.id}`}
            >
              <span className="step-number" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{s.title}</h3>
              <p className="step-voice voice">{s.voice}</p>
              <p className="step-body">{s.body}</p>
              {s.id === "invite" && (
                <p className="step-link">
                  <a className="text-link" href={inviteHref}>
                    Open a sample invitation
                  </a>{" "}
                  to see what a guest sees.
                </p>
              )}
              <div className="device device-inline">
                <div className="device-screen">
                  <Clip
                    name={s.clip}
                    alt={s.alt}
                    playing={playing && !wide && active === i}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
