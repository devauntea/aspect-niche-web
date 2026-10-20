"use client";

import { useEffect, useRef } from "react";

// The film's sky, behind the hero.
//
// Drawn once into a canvas, in three depths. It never moves on its own: the
// only motion is a small parallax that answers the pointer, which settles and
// stops drawing as soon as the pointer does. So there is nothing ticking in
// the background, nothing to pause, and with reduced motion it is simply a
// still sky.
//
// Seeded, so the same stars appear in the same places on every visit and in
// every screenshot.

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  depth: number;
  tint: string;
};

const TINTS = [
  "#efede8",
  "#efede8",
  "#efede8",
  "#efede8",
  "#d9c7ef",
  "#bdb1f9",
  "#edb0c5",
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(width: number, height: number): Star[] {
  const rand = mulberry32(47);
  // About one star per 5,500 square pixels, which reads as a clear night
  // rather than a screensaver.
  const count = Math.round((width * height) / 5500);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const depth = rand() < 0.7 ? 0 : rand() < 0.75 ? 1 : 2;
    stars.push({
      x: rand() * width,
      y: rand() * height,
      r:
        depth === 2
          ? 1.1 + rand() * 0.9
          : depth === 1
            ? 0.75 + rand() * 0.5
            : 0.35 + rand() * 0.45,
      a: depth === 2 ? 0.75 + rand() * 0.25 : 0.25 + rand() * 0.45,
      depth,
      tint: TINTS[Math.floor(rand() * TINTS.length)],
    });
  }
  return stars;
}

export default function Starfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    const offset = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const shift = (s.depth + 1) * 6;
        const x = s.x + offset.x * shift;
        const y = s.y + offset.y * shift;
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.tint;
        if (s.depth === 2) {
          const halo = ctx.createRadialGradient(x, y, 0, x, y, s.r * 5);
          halo.addColorStop(0, s.tint);
          halo.addColorStop(1, "rgba(239,237,232,0)");
          ctx.globalAlpha = s.a * 0.22;
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = s.a;
          ctx.fillStyle = s.tint;
        }
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = makeStars(width, height);
      draw();
    };

    // Ease toward the pointer, then stop scheduling frames once settled.
    const step = () => {
      offset.x += (target.x - offset.x) * 0.08;
      offset.y += (target.y - offset.y) * 0.08;
      draw();
      if (
        Math.abs(target.x - offset.x) > 0.001 ||
        Math.abs(target.y - offset.y) > 0.001
      ) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(step);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!still)
      window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
