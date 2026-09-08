"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useMotion } from "./useMotion";

// The opening: oversized type beside the constellation rabbit and the hobbies
// orbiting it.
//
// The parallax is desktop-only and reads scroll on a passive listener into a
// requestAnimationFrame, so it never blocks the scroll it is following. It
// moves a transform and nothing else — no layout property is animated, which
// is what keeps it off the main thread's critical path.

const SATELLITES = [
  { className: "sat-one", icon: "gallery-craft.svg", label: "Pottery" },
  { className: "sat-two", icon: "pocket-tech.svg", label: "Creative coding" },
  { className: "sat-three", icon: "gallery-nature.svg", label: "Foraging" },
  { className: "sat-four", icon: "gallery-creative.svg", label: "Film photography" },
];

export default function Hero() {
  const { paused } = useMotion();
  const universeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const universe = universeRef.current;
    const hero = heroRef.current;
    if (!universe || !hero) return;

    // Paused, or a narrow screen: put the scene back where the stylesheet
    // wants it and stop listening entirely.
    if (paused || window.innerWidth <= 760) {
      universe.style.transform = "";
      return;
    }

    let pending = false;
    const update = () => {
      pending = false;
      const y = Math.max(0, Math.min(window.scrollY, hero.offsetHeight));
      universe.style.transform = `translateY(calc(-44% + ${y * 0.12}px)) rotate(${y * 0.0025}deg)`;
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [paused]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={heroRef}>
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
        <a className="button light" href="#discover">
          Down the rabbit hole <span aria-hidden="true">↘</span>
        </a>
      </div>

      <div className="hero-universe" aria-hidden="true" ref={universeRef}>
        <svg className="hero-lines" viewBox="0 0 700 690" fill="none">
          <path d="M360 310Q270 155 170 125M360 310Q550 200 580 110M360 310Q590 380 602 465M360 310Q280 480 290 575M360 310Q185 390 85 420M170 125L83 65M580 110L675 230M602 465L535 625M85 420L65 575" />
          <g>
            <circle cx="83" cy="65" r="3" />
            <circle cx="675" cy="230" r="3" />
            <circle cx="535" cy="625" r="3" />
            <circle cx="65" cy="575" r="3" />
          </g>
        </svg>
        <div className="rabbit-orbit">
          <div className="orbit-ring" />
          <Image src="/landing/rabbit.svg" alt="" width={270} height={278} priority />
          <span className="orbit-caption">a world waiting to unfold</span>
        </div>
        {SATELLITES.map((s) => (
          <div className={`satellite ${s.className}`} key={s.className}>
            <Image src={`/landing/${s.icon}`} alt="" width={44} height={44} />
            <span>{s.label}</span>
          </div>
        ))}
        <div className="satellite sat-five">
          <span className="little-planet" />
          <span>Something unexpected</span>
        </div>
      </div>

      <div className="hero-bottom">
        <span>HOBBIES CONNECT. SO DO YOU.</span>
        <a href="#discover">
          Scroll to explore <span aria-hidden="true">↓</span>
        </a>
        <span className="hero-index">01 — ∞</span>
      </div>
    </section>
  );
}
