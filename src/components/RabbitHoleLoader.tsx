"use client";

// "Down the rabbit hole" — the brand loading animation. 7s loop, pure CSS
// (per-element keyframes generated from the beat sheet in hareGeometry).
// Beats: stars pop → alpha tail ignites → lines connect → shadow reveals →
// hole opens → crouch/leap/dive (a ground-plane clip swallows the hare at
// the hole) → ripple + sparks → reset. Theme-aware via CSS variables.
//
// mode="boot": loops; onDone fires at 90% of the first pass (never before
// beat 4). mode="finale": plays beats 5–7 only (negative delay), one pass —
// the onboarding "Jump in" moment. Reduced motion: static constellation +
// shadow, no hole, no movement; onDone after a short hold.

import { useEffect, useMemo } from "react";
import {
  BEATS,
  GROUND_Y,
  HARE_ALPHA_INDEX,
  HARE_EDGES,
  HARE_SILHOUETTE,
  HARE_STARS,
  HARE_VIEWBOX,
  HOLE,
} from "@/lib/hareGeometry";

interface Props {
  mode: "boot" | "finale";
  onDone: () => void;
  width?: string;
}

const T = BEATS.totalMs;
const FINALE_START_PCT = BEATS.jump[0]; // 58
const FINALE_OFFSET_MS = (FINALE_START_PCT / 100) * T;
const BOOT_DONE_MS = (BEATS.splash[1] / 100) * T; // 6300 — after the dive
const FINALE_DONE_MS = BOOT_DONE_MS - FINALE_OFFSET_MS; // ~2240

function edgeLen([a, b]: [number, number]): number {
  const p = HARE_STARS[a];
  const q = HARE_STARS[b];
  return Math.hypot(q.x - p.x, q.y - p.y);
}

/** Per-element keyframes generated from the beat sheet. */
function buildCss(loop: boolean): string {
  const iter = loop ? "infinite" : "1";
  let css = "";
  const anim = (name: string) =>
    `animation: ${name} ${T}ms linear ${iter} both;`;

  // Stars (skip alpha — it has its own beat)
  const starIdx = HARE_STARS.map((_, i) => i).filter(
    (i) => i !== HARE_ALPHA_INDEX,
  );
  starIdx.forEach((star, order) => {
    const inS = 1 + order * 1.55; // spread across 0–26%
    const peak = inS + 2;
    const inE = inS + 3.5;
    css += `@keyframes rhStar${star}{0%,${inS.toFixed(1)}%{opacity:0;transform:scale(.2)}${peak.toFixed(1)}%{opacity:1;transform:scale(1.35)}${inE.toFixed(1)}%{opacity:.9;transform:scale(1)}90%{opacity:.9}96%,100%{opacity:0}}
.rh-star-${star}{${anim(`rhStar${star}`)}transform-box:fill-box;transform-origin:center}`;
  });

  // Alpha star — beat 2 (28–33%)
  css += `@keyframes rhAlpha{0%,28%{opacity:0;transform:scale(.2)}30.5%{opacity:1;transform:scale(1.6)}33%{opacity:1;transform:scale(1)}90%{opacity:1}96%,100%{opacity:0}}
.rh-alpha{${anim("rhAlpha")}transform-box:fill-box;transform-origin:center}`;

  // Lines — beat 3 (30–42%), point-to-point via dashoffset
  HARE_EDGES.forEach((e, j) => {
    const L = Math.ceil(edgeLen(e));
    const s = 30 + j * 0.7;
    const eEnd = s + 1.9;
    css += `@keyframes rhEdge${j}{0%,${s.toFixed(1)}%{stroke-dashoffset:${L};opacity:0}${(s + 0.3).toFixed(1)}%{opacity:.55}${eEnd.toFixed(1)}%{stroke-dashoffset:0;opacity:.55}90%{opacity:.55}96%,100%{opacity:0;stroke-dashoffset:0}}
.rh-edge-${j}{stroke-dasharray:${L};${anim(`rhEdge${j}`)}}`;
  });

  // Shadow reveal — beat 4 (40–50%)
  css += `@keyframes rhShadow{0%,40%{opacity:0}50%{opacity:.15}90%{opacity:.15}96%,100%{opacity:0}}
.rh-shadow{${anim("rhShadow")}}`;

  // Hole — beat 5 open (50–56%), beat 8 close (92–98%)
  css += `@keyframes rhHole{0%,50%{transform:scaleX(0);opacity:0}56%{transform:scaleX(1);opacity:1}92%{transform:scaleX(1);opacity:1}98%,100%{transform:scaleX(0);opacity:0}}
.rh-hole{${anim("rhHole")}transform-origin:${HOLE.cx}px ${HOLE.cy}px}`;

  // The jump — beat 6 (58–84%): crouch, leap, dive; clip swallows the hare
  css += `@keyframes rhJump{0%,58%{transform:translate(0,0) rotate(0)}62%{transform:translate(-8px,0) rotate(-2deg)}70%{transform:translate(42px,-52px) rotate(8deg)}84%,100%{transform:translate(96px,112px) rotate(40deg) scale(.9)}}
.rh-jump{${anim("rhJump")}transform-origin:340px 320px}`;

  // Splash — beat 7 (80–90%): ripple + three star sparks
  css += `@keyframes rhRipple{0%,80%{transform:scale(.3);opacity:0}83%{opacity:.55}90%,100%{transform:scale(1.9);opacity:0}}
.rh-ripple{${anim("rhRipple")}transform-origin:${HOLE.cx}px ${HOLE.cy}px}`;
  [0, 1, 2].forEach((k) => {
    css += `@keyframes rhSpark${k}{0%,${80 + k}%{opacity:0;transform:translateY(0)}${83 + k}%{opacity:1}${89 + k}%,100%{opacity:0;transform:translateY(-${18 + k * 5}px)}}
.rh-spark-${k}{${anim(`rhSpark${k}`)}}`;
  });

  // Reduced motion: static constellation + shadow, no hole, no movement
  css += `@media (prefers-reduced-motion: reduce){
.rh-root *{animation:none!important}
.rh-star,.rh-alpha{opacity:.9!important;transform:none!important}
.rh-alpha{opacity:1!important}
.rh-edge{opacity:.55!important;stroke-dasharray:none!important;stroke-dashoffset:0!important}
.rh-shadow{opacity:.15!important}
.rh-hole,.rh-ripple,.rh-spark{opacity:0!important}
.rh-jump{transform:none!important}}`;

  return css;
}

export default function RabbitHoleLoader({
  mode,
  onDone,
  width = "min(72vw, 460px)",
}: Props) {
  const loop = mode === "boot";
  const css = useMemo(() => buildCss(loop), [loop]);
  const delayMs = mode === "finale" ? -FINALE_OFFSET_MS : 0;

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const t = setTimeout(
      onDone,
      reduced ? 900 : mode === "boot" ? BOOT_DONE_MS : FINALE_DONE_MS,
    );
    return () => clearTimeout(t);
  }, [onDone, mode]);

  const alpha = HARE_STARS[HARE_ALPHA_INDEX];

  return (
    <div className="rh-root" style={{ width }}>
      <style>{css}</style>
      <svg
        viewBox={HARE_VIEWBOX}
        style={
          {
            width: "100%",
            height: "auto",
            display: "block",
            "--rh-delay": `${delayMs}ms`,
            animationDelay: `${delayMs}ms`,
          } as React.CSSProperties
        }
        aria-label="A constellation hare dives down a rabbit hole"
      >
        {/* per-element delay for finale mode */}
        {delayMs !== 0 && (
          <style>{`.rh-root svg *{animation-delay:${delayMs}ms!important}`}</style>
        )}

        {/* The hole — behind the hare, violet-rimmed */}
        <g className="rh-hole">
          <ellipse
            cx={HOLE.cx}
            cy={HOLE.cy}
            rx={HOLE.rx}
            ry={HOLE.ry}
            fill="color-mix(in srgb, var(--color-bg, #0A0C18) 30%, #000)"
            stroke="var(--color-glow, #8B7CF6)"
            strokeWidth={1.5}
            strokeOpacity={0.8}
          />
        </g>

        {/* Ground-plane clip: everything above y=GROUND_Y — this sells the
            dive; without it the hare slides over the hole */}
        <clipPath id="rh-ground">
          <rect x="0" y="0" width="640" height={GROUND_Y} />
        </clipPath>

        <g clipPath="url(#rh-ground)">
          <g className="rh-jump">
            <path
              className="rh-shadow"
              d={HARE_SILHOUETTE}
              fill="var(--color-text, #F0EEFF)"
            />
            {HARE_EDGES.map(([a, b], j) => (
              <line
                key={j}
                className={`rh-edge rh-edge-${j}`}
                x1={HARE_STARS[a].x}
                y1={HARE_STARS[a].y}
                x2={HARE_STARS[b].x}
                y2={HARE_STARS[b].y}
                stroke="var(--color-glow, #8B7CF6)"
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            ))}
            {HARE_STARS.map((s, i) =>
              i === HARE_ALPHA_INDEX ? null : (
                <circle
                  key={i}
                  className={`rh-star rh-star-${i}`}
                  cx={s.x}
                  cy={s.y}
                  r={4}
                  fill="var(--color-text, #F0EEFF)"
                />
              ),
            )}
            {/* Alpha star: cotton tail + cross-sparkle */}
            <g className="rh-alpha">
              <circle
                cx={alpha.x}
                cy={alpha.y}
                r={10}
                fill="var(--color-alpha, #FFF7D6)"
                opacity={0.25}
              />
              <circle
                cx={alpha.x}
                cy={alpha.y}
                r={5.5}
                fill="var(--color-alpha, #FFF7D6)"
              />
              <path
                d={`M ${alpha.x - 12} ${alpha.y} H ${alpha.x + 12} M ${alpha.x} ${alpha.y - 12} V ${alpha.y + 12}`}
                stroke="var(--color-alpha, #FFF7D6)"
                strokeWidth={1.6}
                strokeLinecap="round"
                opacity={0.85}
              />
            </g>
          </g>
        </g>

        {/* Splash: ripple + three star sparks */}
        <ellipse
          className="rh-ripple"
          cx={HOLE.cx}
          cy={HOLE.cy}
          rx={HOLE.rx * 0.75}
          ry={HOLE.ry * 0.75}
          fill="none"
          stroke="var(--color-glow, #8B7CF6)"
          strokeWidth={1.5}
        />
        {[0, 1, 2].map((k) => (
          <circle
            key={k}
            className={`rh-spark rh-spark-${k}`}
            cx={HOLE.cx - 32 + k * 30}
            cy={GROUND_Y - 12}
            r={2.2}
            fill="var(--color-alpha, #FFF7D6)"
          />
        ))}
      </svg>
    </div>
  );
}
