"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMotion } from "./useMotion";
import { useReveal } from "./useReveal";

// One graph, three appearances.
//
// This previews three of the app's themes, not its six icon families — the two
// are separate choices in the app and conflating them here would teach the
// wrong model. Geometry never changes between them: only material, colour and
// the pictogram family shown, so nothing shifts under the pointer.

type ThemeKey = "gallery" | "pocket" | "midnight";

const THEMES: Record<
  ThemeKey,
  { name: string; number: string; description: string; footer: string; prefix: string }
> = {
  gallery: {
    name: "Gallery",
    number: "01",
    description: "A canvas for every kind of curious.",
    footer: "Pigment that follows your path. Tap a node.",
    prefix: "gallery",
  },
  pocket: {
    name: "Pocket Tech",
    number: "02",
    description: "A familiar feeling. A new little world.",
    footer: "Smoked glass. Satin silver. A little after-hours nostalgia.",
    prefix: "pocket",
  },
  midnight: {
    name: "Midnight",
    number: "03",
    description: "For the rabbit holes that keep you up.",
    footer: "Soft light. Quiet connections. Room to wander.",
    prefix: "pocket",
  },
};

const NODES = [
  { cls: "tn-hub", icon: "creative", label: "Create", path: "M555 255Q740 215 860 145" },
  { cls: "tn-one", icon: "craft", label: "Pottery", path: "M555 255Q440 145 345 140" },
  { cls: "tn-two", icon: "tech", label: "Creative coding", path: "M555 255Q740 215 860 145" },
  { cls: "tn-three", icon: "nature", label: "Nature journaling", path: "M555 255Q670 330 800 365" },
  { cls: "tn-four", icon: "creative", label: "Photography", path: "M555 255Q420 355 355 375" },
];

export default function ThemeStudio() {
  const { paused } = useMotion();
  const [theme, setTheme] = useState<ThemeKey>("gallery");
  const brushRef = useRef<SVGPathElement>(null);
  const headingRef = useReveal<HTMLDivElement>();
  const active = THEMES[theme];

  const stroke = (path: string, icon: HTMLElement | null) => {
    const brush = brushRef.current;
    if (!brush || paused) return;
    brush.classList.remove("run");
    brush.setAttribute("d", path);
    void brush.getBoundingClientRect();
    brush.classList.add("run");
    icon?.animate(
      [
        { transform: "scale(.86)" },
        { transform: "scale(1.13)" },
        { transform: "scale(1)" },
      ],
      { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" },
    );
  };

  return (
    <section
      className="studio section-pad"
      id="studio"
      data-theme={theme}
      aria-labelledby="studio-title"
    >
      <div className="studio-heading reveal" ref={headingRef}>
        <div>
          <p className="eyebrow">02 / YOUR WORLD, YOUR WAY</p>
          <h2 id="studio-title">
            Same curiosity.
            <br />
            <em>A different feeling.</em>
          </h2>
        </div>
        <p>
          A quiet gallery. A little nostalgia.
          <br />
          A universe after dark.
          <br />
          Make your graph feel like you.
        </p>
      </div>

      <div className="theme-switch" role="group" aria-label="Choose a theme preview">
        {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
          <button
            key={key}
            aria-pressed={theme === key}
            onClick={() => setTheme(key)}
          >
            <i className={`swatch sw-${key}`} />
            {THEMES[key].name}
          </button>
        ))}
      </div>

      <div className="theme-stage">
        <div className="theme-wave" aria-hidden="true" />
        <span className="theme-corner">ASPECT NICHE / GRAPH STUDIO</span>
        <div className="theme-title">
          <span id="theme-number">{active.number}</span>
          <h3 id="theme-name">{active.name}</h3>
          <p id="theme-description">{active.description}</p>
        </div>

        <svg
          className="theme-edges"
          viewBox="0 0 1100 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M555 255Q440 145 345 140M555 255Q740 215 860 145M555 255Q670 330 800 365M555 255Q420 355 355 375" />
          <path
            ref={brushRef}
            className="theme-brush"
            pathLength={1}
            d="M555 255Q740 215 860 145"
          />
        </svg>

        {NODES.map((n) => (
          <button
            key={n.cls}
            className={`theme-node ${n.cls}`}
            aria-label={
              n.cls === "tn-hub"
                ? "Replay this theme’s connection animation"
                : `Animate connection to ${n.label.toLowerCase()}`
            }
            onClick={(e) =>
              stroke(n.path, e.currentTarget.querySelector("img"))
            }
          >
            <Image
              src={`/landing/${active.prefix}-${n.icon}.svg`}
              alt=""
              width={34}
              height={34}
            />
            <span>{n.label}</span>
          </button>
        ))}

        <span className="theme-footer" id="theme-footer">
          {active.footer}
        </span>
      </div>
    </section>
  );
}
