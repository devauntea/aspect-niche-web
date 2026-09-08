"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotion } from "./useMotion";

// Explore, collect, flip.
//
// Session-only sample state. Nothing here touches the app's storage or a real
// account: this is a marketing demonstration of a mechanic, and collecting
// "pottery" on a landing page must never mean anything to a real collection.
//
// The invariants worth naming, because they are the ones a refactor would
// quietly break:
//
//   Discovery never shows progress.       mode = explore  ⇒ no photo, no note
//   Flipping shows only what is kept.     mode = collected ⇒ collected only
//   Progress belongs to one hobby.        entries ⊆ the focused collected hobby
//
// They are enforced in one place — `showProgress` below — rather than spread
// across the markup, so there is a single line to read when checking them.

type HobbyKey = "pottery" | "coding" | "foraging" | "photography";

type Hobby = {
  key: HobbyKey;
  title: string;
  description: string;
  /** The edge the paint streak travels, in the connection SVG's own viewBox. */
  path: string;
  icon: string;
  pigment: string;
  x: string;
  y: string;
};

const HOBBIES: Hobby[] = [
  {
    key: "pottery",
    title: "Pottery",
    description: "Slow down. Make something with your hands.",
    path: "M395 295Q290 220 180 140",
    icon: "gallery-craft.svg",
    pigment: "#a991e9",
    x: "22.5%",
    y: "22.2%",
  },
  {
    key: "coding",
    title: "Creative coding",
    description: "Turn a few lines of code into something unexpected.",
    path: "M395 295Q520 195 630 135",
    icon: "pocket-tech.svg",
    pigment: "#a4c6d6",
    x: "78.8%",
    y: "21.4%",
  },
  {
    key: "foraging",
    title: "Foraging",
    description: "Get to know the wild things growing around you.",
    path: "M395 295Q535 380 638 445",
    icon: "gallery-nature.svg",
    pigment: "#a7b97e",
    x: "79.8%",
    y: "70.6%",
  },
  {
    key: "photography",
    title: "Film photography",
    description: "Notice a little more. Keep a moment.",
    path: "M395 295Q315 450 250 495",
    icon: "gallery-creative.svg",
    pigment: "#d0a77e",
    x: "31.3%",
    y: "78.6%",
  },
];

const CHAPTERS = [
  {
    strong: "Start with a spark.",
    copy: "Pick an interest. Watch a world unfold.",
    announce: "Explore the sample hobby graph.",
  },
  {
    strong: "Keep what pulls you in.",
    copy: "Collect a hobby. Give curiosity a home.",
    announce: "Sample pottery added to the collection.",
  },
  {
    strong: "See the other side.",
    copy: "Flip your graph. Your progress grows here.",
    announce: "Flipped to the sample pottery progress graph.",
  },
];

/** Only pottery carries sample progress; everything else explains the gap. */
const PROGRESS_HOBBY: HobbyKey = "pottery";

export default function DiscoveryStory() {
  const { paused } = useMotion();
  const [collected, setCollected] = useState<Set<HobbyKey>>(new Set());
  const [selected, setSelected] = useState<HobbyKey | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const shellRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<SVGPathElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const lastBand = useRef(-1);

  const paint = useCallback(
    (path: string, colour?: string) => {
      const streak = streakRef.current;
      if (!streak || paused) return;
      streak.classList.remove("run");
      streak.setAttribute("d", path);
      streak.style.stroke = colour ?? "#b8a0dc";
      // Force a reflow so removing and re-adding the class restarts the
      // animation rather than being collapsed into no change at all.
      void streak.getBoundingClientRect();
      streak.classList.add("run");
    },
    [paused],
  );

  const selectHobby = useCallback(
    (key: HobbyKey, isFlipped = flipped) => {
      // On the flipped side only a collected hobby can be focused.
      if (isFlipped && !collected.has(key)) return;
      const hobby = HOBBIES.find((h) => h.key === key)!;
      setSelected(key);
      if (!isFlipped) paint(hobby.path, hobby.pigment);
      setAnnouncement(`${hobby.title} selected.`);
    },
    [collected, flipped, paint],
  );

  const applyChapter = useCallback(
    (index: number) => {
      setChapter(index);
      if (index === 0) {
        setFlipped(false);
        setSelected(null);
      }
      if (index === 1) {
        setFlipped(false);
        setSelected(PROGRESS_HOBBY);
        setCollected((prev) => new Set(prev).add(PROGRESS_HOBBY));
        const hobby = HOBBIES.find((h) => h.key === PROGRESS_HOBBY)!;
        paint(hobby.path, hobby.pigment);
      }
      if (index === 2) {
        setCollected((prev) => new Set(prev).add(PROGRESS_HOBBY));
        setSelected(PROGRESS_HOBBY);
        setFlipped(true);
      }
    },
    [paint],
  );

  // Scroll changes which chapter is showing and nothing else. The listener is
  // passive and the work happens in a frame callback, so native scrolling is
  // never intercepted or delayed.
  useEffect(() => {
    const story = storyRef.current;
    if (!story || paused) return;

    let pending = false;
    const update = () => {
      pending = false;
      // Mirrors the stylesheet: no pin, no scroll-driven chapters. Below 760px
      // wide or 760px tall the scene is in normal flow and the buttons are the
      // only thing that should move it.
      if (window.innerWidth <= 760 || window.innerHeight <= 760) return;
      const rect = story.getBoundingClientRect();
      const travel = story.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, travel)));
      const band = Math.min(2, Math.floor(progress * 3));
      if (
        rect.top <= 80 &&
        rect.bottom >= window.innerHeight * 0.7 &&
        band !== lastBand.current
      ) {
        lastBand.current = band;
        applyChapter(band);
      }
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [applyChapter, paused]);

  const toggleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next && (!selected || !collected.has(selected))) setSelected(null);
    setAnnouncement(
      next ? "Showing collected hobbies only." : "Showing discovery graph.",
    );
    if (!paused && shellRef.current) {
      // The scene turns, not the page. A short perspective nudge rather than a
      // 180° flip, which would leave the labels mirrored and unreadable.
      shellRef.current.animate(
        [
          { transform: "perspective(1300px) rotateY(-5deg)", opacity: 0.6 },
          { transform: "perspective(1300px) rotateY(0)", opacity: 1 },
        ],
        { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    }
  };

  const collect = () => {
    if (!selected) return;
    setCollected((prev) => new Set(prev).add(selected));
    const hobby = HOBBIES.find((h) => h.key === selected)!;
    setAnnouncement(`${hobby.title} added to your collection.`);
  };

  const surprise = () => {
    const options = HOBBIES.filter((h) => h.key !== selected);
    const pick = options[Math.floor(Math.random() * options.length)];
    selectHobby(pick.key);
  };

  // The one place the progress invariants live.
  const showProgress =
    flipped && selected === PROGRESS_HOBBY && collected.has(PROGRESS_HOBBY);

  const selectedHobby = selected
    ? HOBBIES.find((h) => h.key === selected)!
    : null;
  const focusValid = selectedHobby && (!flipped || collected.has(selectedHobby.key));

  const detailTitle = focusValid
    ? selectedHobby.title
    : flipped
      ? collected.size
        ? "The things you’re getting into."
        : "Your collection is waiting."
      : "Where will you go first?";

  const detailCopy = focusValid
    ? flipped
      ? selectedHobby.key === PROGRESS_HOBBY
        ? "Your first photo. Your first note. A story taking shape."
        : "Your collection starts here. Add progress in the app."
      : selectedHobby.description
    : flipped
      ? collected.size
        ? "Tap a collected hobby to focus on it."
        : "Flip back and collect a hobby to begin."
      : "Tap a hobby to follow its connection.";

  return (
    <section
      className="discovery-story"
      id="discover"
      aria-labelledby="discovery-title"
      ref={storyRef}
    >
      <div className="story-sticky">
        <div className="story-copy">
          <p className="eyebrow">01 / FOLLOW THE THREAD</p>
          <h2 id="discovery-title">
            Little paths.
            <br />
            <em>Big possibilities.</em>
          </h2>
          <div className="chapter-buttons" role="group" aria-label="Graph story chapters">
            {CHAPTERS.map((c, i) => (
              <button
                key={c.strong}
                className={`chapter${chapter === i ? " active" : ""}`}
                aria-pressed={chapter === i}
                onClick={() => {
                  lastBand.current = i;
                  applyChapter(i);
                  setAnnouncement(c.announce);
                }}
              >
                <span>{`0${i + 1}`}</span>
                <div>
                  <strong>{c.strong}</strong>
                  <p>{c.copy}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="demo-label">Interactive concept · sample hobbies</p>
        </div>

        <div
          className="graph-shell"
          data-mode={flipped ? "collected" : "explore"}
          ref={shellRef}
        >
          <div className="graph-toolbar">
            <span className="graph-wordmark">Your little universe</span>
            <button className="icon-text" aria-pressed={flipped} onClick={toggleFlip}>
              <Image src="/landing/flip-graph.svg" alt="" width={18} height={18} />
              {flipped ? "Discover" : "Flip graph"}
            </button>
          </div>

          <div className="graph-map">
            <svg
              className="connections"
              viewBox="0 0 800 630"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g className="base-links">
                {HOBBIES.map((h) => (
                  <path
                    key={h.key}
                    d={h.path}
                    style={
                      flipped
                        ? { opacity: collected.has(h.key) ? 1 : 0 }
                        : undefined
                    }
                  />
                ))}
                <path
                  d="M180 140Q130 240 105 335"
                  style={flipped ? { opacity: 0 } : undefined}
                />
                <path
                  d="M630 135Q700 230 708 280"
                  style={flipped ? { opacity: 0 } : undefined}
                />
              </g>
              <path ref={streakRef} id="paint-streak" pathLength={1} d={HOBBIES[0].path} />
            </svg>

            <div className="graph-hub" style={{ "--x": "49.4%", "--y": "46.8%" } as React.CSSProperties}>
              <Image src="/landing/rabbit.svg" alt="" width={38} height={40} />
              <span>You</span>
            </div>

            {HOBBIES.map((h) => (
              <button
                key={h.key}
                className={[
                  "hobby-node",
                  h.key,
                  selected === h.key ? "selected" : "",
                  collected.has(h.key) ? "collected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-hobby={h.key}
                aria-label={`${h.title}${collected.has(h.key) ? ", collected" : ""}`}
                style={
                  { "--x": h.x, "--y": h.y, "--pigment": h.pigment } as React.CSSProperties
                }
                onClick={() => selectHobby(h.key)}
              >
                <span className="node-orb">
                  <Image src={`/landing/${h.icon}`} alt="" width={30} height={30} />
                  <i className="collected-check">✓</i>
                </span>
                <span>{h.title}</span>
              </button>
            ))}

            <span className="minor-node mn-one" style={{ "--x": "13.1%", "--y": "53.2%" } as React.CSSProperties}>
              Raku firing
            </span>
            <span className="minor-node mn-two" style={{ "--x": "88.5%", "--y": "44.4%" } as React.CSSProperties}>
              Generative art
            </span>

            {/* Progress exists only on the flipped side, for the one focused
                collected hobby. Unmounted rather than hidden, so there is no
                way for it to be revealed by a stray stylesheet change. */}
            {showProgress && (
              <>
                <svg
                  className="connections"
                  id="progress-connections"
                  viewBox="0 0 800 630"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M180 140Q380 95 650 245M180 140Q290 400 390 475"
                    fill="none"
                    stroke="#c9b6bb55"
                    strokeWidth={1.2}
                  />
                </svg>
                <div className="progress-nodes">
                  <div className="progress-photo">
                    <Image
                      src="/landing/pottery.webp"
                      alt="Sample pottery progress"
                      width={150}
                      height={110}
                    />
                    <span>
                      First day with clay <small>06 Sep · sample</small>
                    </span>
                  </div>
                  <div className="progress-note">
                    A little wonky.
                    <br />
                    A lot more mine.
                    <small>Note · 07 Sep · sample</small>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="graph-detail" id="graph-detail">
            <div>
              <span className="detail-kicker">LET CURIOSITY CHOOSE</span>
              <strong id="hobby-title">{detailTitle}</strong>
              <p id="hobby-description">{detailCopy}</p>
            </div>
            {focusValid && !flipped && (
              <button
                className="collect"
                onClick={collect}
                disabled={collected.has(selectedHobby.key)}
              >
                {collected.has(selectedHobby.key) ? "Collected ✓" : "Collect hobby +"}
              </button>
            )}
          </div>

          <div className="graph-bottom">
            <span>
              {collected.size} {collected.size === 1 ? "hobby" : "hobbies"} collected
            </span>
            {!flipped && (
              <button className="icon-text" onClick={surprise}>
                <Image src="/landing/random-hobby.svg" alt="" width={18} height={18} />
                Surprise me
              </button>
            )}
          </div>

          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </div>
      </div>
    </section>
  );
}
