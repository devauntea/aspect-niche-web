"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotion } from "./useMotion";
import type { HobbyModel, HobbyScene, PotteryForm } from "./hobbyScene";
import { previewPlan, markPreviewSeen } from "./previewPolicy";

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
  const [generation, setGeneration] = useState(0);
  const [controls, setControls] = useState<{
    label: string;
    form: PotteryForm;
  }>({
    label: "",
    form: "vase",
  });
  const [previewing, setPreviewing] = useState(false);
  const [hint, setHint] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const api = useRef<HobbyScene | null>(null);
  const latest = useRef({ selected, paused });
  // Read the scene's action label into state (never from a ref during render).
  const refresh = useCallback(() => {
    const scene = api.current;
    if (!scene) return;
    const next = { label: scene.label(), form: scene.potteryForm() };
    setControls((prev) =>
      prev.label === next.label && prev.form === next.form ? prev : next,
    );
  }, []);

  useEffect(() => {
    latest.current = { selected, paused };
    api.current?.select(selected);
    api.current?.pause(paused);
  }, [selected, paused]);

  // The poster is the page's first paint. The live scene follows once the page
  // has loaded and the browser is idle, unless the device asks to save data or
  // is very constrained; then it waits for "Explore in 3D".
  useEffect(() => {
    const plan = previewPlan();
    if (!plan.autoload) return;
    let idle = 0;
    let timer = 0;
    const start = () => {
      const run = () => setEnabled(true);
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(run, { timeout: 1800 });
      else timer = setTimeout(run, 400) as unknown as number;
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const host = stageRef.current;
    if (!host || !enabled) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { mountHobbyScene } = await import("./hobbyScene");
        if (cancelled) return;
        api.current = mountHobbyScene(
          host,
          latest.current.selected,
          latest.current.paused,
          {
            onPhase: (_id, phase, message) => {
              if (phase === "completed" && message) setAnnouncement(message);
            },
            onChanged: refresh,
            onAnnounce: setAnnouncement,
            onPreviewSelect: (id) => {
              latest.current.selected = id;
              setSelected(id);
            },
            onPreviewEnd: () => {
              setPreviewing(false);
              setHint(true);
            },
            onRestored: () => {
              api.current?.dispose();
              api.current = null;
              setReady(false);
              setGeneration((n) => n + 1);
            },
          },
        );
        setReady(true);
        refresh();
        // Development only: lets browser checks drive the scene directly.
        if (process.env.NODE_ENV !== "production")
          (
            window as unknown as { __hobbyScene?: HobbyScene | null }
          ).__hobbyScene = api.current;
      } catch {
        host.dataset.scene = "fallback";
        if (!cancelled) setUnavailable(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, [enabled, generation, refresh]);

  // First visit: a short, skippable tour of the scenes, one at a time.
  useEffect(() => {
    if (!ready || paused) return;
    const plan = previewPlan();
    const host = stageRef.current;
    if (!plan.preview || !host) {
      setHint(true);
      return;
    }
    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || timer) return;
        timer = window.setTimeout(() => {
          if (!api.current || document.hidden) return;
          markPreviewSeen();
          api.current.preview({
            order: ["pottery", "photography", "foraging"],
            short: plan.short,
          });
          setPreviewing(api.current.previewing());
        }, 700);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(host);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [ready, paused]);

  // Any real input anywhere ends the preview: it never holds the page.
  useEffect(() => {
    if (!previewing) return;
    const stop = () => api.current?.stopPreview("interrupted");
    const options = { capture: true, passive: true } as const;
    const kinds = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    kinds.forEach((kind) => window.addEventListener(kind, stop, options));
    return () =>
      kinds.forEach((kind) => window.removeEventListener(kind, stop, options));
  }, [previewing]);

  useEffect(() => {
    if (!hint) return;
    const timer = window.setTimeout(() => setHint(false), 6500);
    const host = stageRef.current;
    const hide = () => setHint(false);
    host?.addEventListener("pointerdown", hide, { once: true });
    return () => {
      window.clearTimeout(timer);
      host?.removeEventListener("pointerdown", hide);
    };
  }, [hint]);

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
  const { label, form } = controls;

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
        <div className="hobby-stage-frame">
          <div
            className="hobby-stage"
            ref={stageRef}
            role={ready ? "group" : "img"}
            aria-roledescription={ready ? "interactive 3D scene" : undefined}
            aria-label={
              ready
                ? `${hobby.name} miniature. Enter plays, arrow keys turn it.`
                : `${hobby.name} miniature`
            }
            tabIndex={ready ? 0 : undefined}
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
          {selected === "pottery" && ready && (
            <div
              className="form-toggle"
              role="group"
              aria-label="What to throw"
            >
              {(["vase", "bowl"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={form === option}
                  onClick={() => api.current?.setPotteryForm(option)}
                >
                  {option === "vase" ? "Vase" : "Bowl"}
                </button>
              ))}
            </div>
          )}
          {previewing ? (
            <button
              type="button"
              className="preview-skip"
              onClick={() => api.current?.stopPreview("skipped")}
            >
              Skip preview <span aria-hidden="true">→</span>
            </button>
          ) : (
            ready && (
              <button
                type="button"
                className="exhibit-turn"
                aria-label="Turn the scene"
                onClick={() => api.current?.rotate()}
              >
                <span aria-hidden="true">↻</span>
              </button>
            )
          )}
          <p
            className={`stage-hint${hint && !previewing ? " on" : ""}`}
            aria-hidden="true"
          >
            <span className="hint-dot" />
            <span className="hint-fine">Drag to turn · click to play</span>
            <span className="hint-coarse">
              Swipe sideways to turn · tap to play
            </span>
          </p>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        <div className="exhibit-caption">
          <p aria-live="polite">{hobby.line}</p>
          {ready ? (
            <button
              type="button"
              className="exhibit-play"
              onClick={() => api.current?.play()}
            >
              {label} <span aria-hidden="true">▸</span>
            </button>
          ) : (
            <button
              type="button"
              className="exhibit-play"
              onClick={() => setEnabled(true)}
              disabled={unavailable || enabled}
              aria-live="polite"
            >
              {unavailable
                ? "3D unavailable"
                : enabled
                  ? "Loading 3D…"
                  : "Explore in 3D"}{" "}
              <span aria-hidden="true">↻</span>
            </button>
          )}
        </div>
        <div
          className="exhibit-choices"
          role="group"
          aria-label="Choose a hobby scene"
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
