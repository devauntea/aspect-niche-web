"use client";

import { useEffect, useRef, useState } from "react";

const STOPS = [
  { id: "top", name: "Curiosity", light: false },
  { id: "app", name: "The app", light: true },
  { id: "discover", name: "Connections", light: false },
  { id: "studio", name: "Your world", light: true },
  { id: "memories", name: "Your story", light: false },
  { id: "watch", name: "The film", light: true },
];

/** Native document scrolling, with a quiet map of where you are. */
export default function JourneyRail() {
  const rail = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame = 0;
    const sections = STOPS.map((stop) => document.getElementById(stop.id));
    const update = () => {
      frame = 0;
      if (!rail.current || document.hidden) return;
      const positions = sections.map(
        (section) => section?.getBoundingClientRect().top ?? Infinity,
      );
      const focal = innerHeight * 0.38;
      let index = 0;
      positions.forEach((top, i) => {
        if (top <= focal) index = i;
      });
      setActive((previous) => (previous === index ? previous : index));
      const next = positions[index + 1];
      const fraction = Number.isFinite(next)
        ? Math.max(
            0,
            Math.min(1, (focal - positions[index]) / (next - positions[index])),
          )
        : 0;
      rail.current.style.setProperty(
        "--route-p",
        String((index + fraction) / (STOPS.length - 1)),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);
  return (
    <nav
      ref={rail}
      className="journey-rail"
      aria-label="Journey chapters"
      data-light={STOPS[active].light}
    >
      <span className="rail-track" aria-hidden="true">
        <span className="rail-progress" />
        <span className="rail-traveler" />
      </span>
      {STOPS.map((stop, index) => (
        <a
          key={stop.id}
          href={`#${stop.id}`}
          aria-label={stop.name}
          aria-current={index === active ? "location" : undefined}
        >
          <span className="rail-node" />
          <span className="rail-label">{stop.name}</span>
        </a>
      ))}
    </nav>
  );
}
