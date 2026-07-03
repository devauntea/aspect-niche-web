"use client";

import { useEffect, useRef } from "react";
import { constellation } from "@/lib/theme";

const PALETTE = constellation.stars;
const DOT_COUNT = 70;

interface Dot {
  ox: number; // fraction of W (0-1)
  oy: number; // fraction of H (0-1)
  r: number;
  c: string;
  phase: number;
  period: number;
  ampX: number;
  ampY: number;
  baseAlpha: number;
  twinklePeriod: number;
}

interface Connection {
  a: number;
  b: number;
  life: number;
  maxLife: number;
}

// Starfield behind the graph: drifting, twinkling star-dots that occasionally
// link into short-lived constellation lines. Purely decorative — the real
// nodes/edges live in React Flow above this canvas.
export default function GraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const _ctx = canvas.getContext("2d");
    if (!_ctx) return;
    const ctx: CanvasRenderingContext2D = _ctx;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let W = 0;
    let H = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = parent!.offsetWidth;
      H = parent!.offsetHeight;
      if (!W || !H) return;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    // Dots store positions as fractions so they scale with canvas resizes
    const dots: Dot[] = Array.from({ length: DOT_COUNT }, () => ({
      ox: Math.random(),
      oy: Math.random(),
      r: 0.8 + Math.random() * 1.6,
      c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      phase: Math.random() * Math.PI * 2,
      period: 20 + Math.random() * 20,
      ampX: 15 + Math.random() * 30,
      ampY: 10 + Math.random() * 20,
      baseAlpha: 0.25 + Math.random() * 0.35,
      twinklePeriod: 2.5 + Math.random() * 4,
    }));

    const connections: Connection[] = [];
    let sinceLastConnection = 0;
    let nextConnectionIn = 3 + Math.random() * 3;

    const ro = new ResizeObserver(() => {
      resize();
      if (reducedMotion) drawFrame(0, 0);
    });
    ro.observe(parent);

    let animId = 0;
    let startTime: number | null = null;
    let prevTs: number | null = null;

    function drawFrame(elapsed: number, dt: number) {
      ctx.clearRect(0, 0, W, H);

      // Dot world positions
      const pos = dots.map((d) => ({
        x:
          d.ox * W +
          Math.sin((elapsed / d.period) * Math.PI * 2 + d.phase) * d.ampX,
        y:
          d.oy * H +
          Math.cos((elapsed / d.period) * Math.PI * 2 + d.phase * 1.3) * d.ampY,
      }));

      // Spawn new connection
      sinceLastConnection += dt;
      if (sinceLastConnection >= nextConnectionIn && connections.length < 5) {
        sinceLastConnection = 0;
        nextConnectionIn = 3 + Math.random() * 3;

        const MAX_DIST = Math.min(W, H) * 0.28;
        const candidates: [number, number][] = [];
        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx = pos[j].x - pos[i].x;
            const dy = pos[j].y - pos[i].y;
            if (Math.sqrt(dx * dx + dy * dy) < MAX_DIST) {
              candidates.push([i, j]);
            }
          }
        }
        if (candidates.length > 0) {
          const [a, b] =
            candidates[Math.floor(Math.random() * candidates.length)];
          const life = 2 + Math.random() * 2.5;
          connections.push({ a, b, life, maxLife: life });
        }
      }

      // Draw connections
      for (let i = connections.length - 1; i >= 0; i--) {
        const c = connections[i];
        c.life -= dt;
        if (c.life <= 0) {
          connections.splice(i, 1);
          continue;
        }
        const t = 1 - c.life / c.maxLife;
        const fadeIn = Math.min(t / 0.25, 1);
        const fadeOut = Math.min(c.life / 0.5, 1);
        ctx.save();
        ctx.globalAlpha = fadeIn * fadeOut * 0.22;
        ctx.strokeStyle = dots[c.a].c;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(pos[c.a].x, pos[c.a].y);
        ctx.lineTo(pos[c.b].x, pos[c.b].y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw stars (alpha breathes for a twinkle)
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const p = pos[i];
        const twinkle =
          0.7 +
          0.3 * Math.sin((elapsed / d.twinklePeriod) * Math.PI * 2 + d.phase);
        ctx.save();
        ctx.globalAlpha = d.baseAlpha * twinkle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.c;
        ctx.fill();
        ctx.restore();
      }
    }

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      const dt = prevTs !== null ? Math.min((ts - prevTs) / 1000, 0.05) : 0;
      prevTs = ts;

      if (document.hidden || !W || !H) {
        animId = requestAnimationFrame(frame);
        return;
      }

      drawFrame(elapsed, dt);
      animId = requestAnimationFrame(frame);
    }

    if (reducedMotion) {
      // One calm static frame — no drift, no twinkle loop
      drawFrame(0, 0);
    } else {
      animId = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
