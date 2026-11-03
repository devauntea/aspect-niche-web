"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMotion } from "./useMotion";
import type { HobbyModel, HobbyScene } from "./hobbyScene";

const HOBBIES: {
  id: HobbyModel;
  name: string;
  line: string;
  number: string;
}[] = [
  {
    id: "pottery",
    name: "Pottery",
    line: "A feeling, taking shape.",
    number: "01",
  },
  {
    id: "photography",
    name: "Film photography",
    line: "A moment, worth keeping.",
    number: "02",
  },
  {
    id: "foraging",
    name: "Foraging",
    line: "A familiar path, rediscovered.",
    number: "03",
  },
];

export default function Hero() {
  const { paused } = useMotion();
  const [selected, setSelected] = useState<HobbyModel>("pottery");
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const api = useRef<HobbyScene | null>(null);
  const latest = useRef({ selected, paused });
  useEffect(() => {
    latest.current = { selected, paused };
    api.current?.select(selected);
    api.current?.pause(paused);
  }, [selected, paused]);

  useEffect(() => {
    const host = stageRef.current;
    if (!host || !enabled) return;
    let cancelled = false,
      started = false;
    const load = async () => {
      if (started || cancelled) return;
      started = true;
      try {
        const { mountHobbyScene } = await import("./hobbyScene");
        if (cancelled) return;
        api.current = mountHobbyScene(
          host,
          latest.current.selected,
          latest.current.paused,
        );
        setReady(true);
      } catch {
        host.dataset.scene = "fallback";
        if (!cancelled) setUnavailable(true);
      }
    };
    // A matching rendered poster loads first; WebGL is an explicit enhancement.
    // Importing only on intent keeps shader setup out of the initial mobile load.
    void load();
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || paused) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      api.current?.travel(-rect.top / Math.max(1, rect.height));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, [paused]);
  const hobby = HOBBIES.find((item) => item.id === selected)!;

  return (
    <section
      className="hero immersive-hero"
      id="top"
      aria-labelledby="hero-title"
      ref={heroRef}
      data-journey-scene
    >
      <div className="hero-aura" aria-hidden="true" />
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="tiny-star" aria-hidden="true">
            ✦
          </span>{" "}
          FOR THE ENDLESSLY CURIOUS
        </p>
        <h1 id="hero-title">
          Follow a<br />
          little <em>curiosity.</em>
        </h1>
        <p className="hero-description">
          Find the hobby you didn&rsquo;t know you&rsquo;d love.
          <br />
          Then see where it takes you.
        </p>
        <a className="button light" href="#app">
          Down the rabbit hole <span aria-hidden="true">↘</span>
        </a>
      </div>
      <div className="hobby-exhibit">
        <div className="exhibit-label">
          <Image
            src="/landing/rabbit.svg"
            alt=""
            width={24}
            height={26}
            style={{ height: "auto" }}
          />
          <span>a world waiting to unfold</span>
        </div>
        <div
          className="hobby-stage"
          ref={stageRef}
          aria-label={`${hobby.name} sculpture`}
          role="img"
        >
          <div className="exhibit-orbit" aria-hidden="true" />
          <div className="exhibit-orbit orbit-two" aria-hidden="true" />
          <Image
            className="exhibit-fallback"
            src={`/landing/app-preview/${selected}-poster.webp`}
            alt=""
            width={524}
            height={435}
            unoptimized
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        </div>
        <div className="exhibit-caption">
          <p aria-live="polite">{hobby.line}</p>
          <button
            type="button"
            onClick={() => (ready ? api.current?.rotate() : setEnabled(true))}
            disabled={unavailable || (enabled && !ready)}
            aria-live="polite"
          >
            {unavailable
              ? "3D unavailable"
              : ready
                ? "Turn the object"
                : enabled
                  ? "Loading 3D…"
                  : "Explore in 3D"}{" "}
            <span aria-hidden="true">↻</span>
          </button>
        </div>
        <div
          className="exhibit-choices"
          role="group"
          aria-label="Choose a hobby sculpture"
        >
          {HOBBIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected === item.id}
              onClick={() => setSelected(item.id)}
            >
              <span className="choice-dot" />
              {item.name}
            </button>
          ))}
        </div>
      </div>
      <div className="hero-bottom">
        <span>SMALL SPARKS. UNEXPECTED CONNECTIONS.</span>
        <a href="#app">
          Follow the thread <span aria-hidden="true">↓</span>
        </a>
        <span className="hero-index">{hobby.number} — 03</span>
      </div>
    </section>
  );
}
