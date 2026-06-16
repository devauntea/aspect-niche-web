"use client";

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

export function IconFitness({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Left weight */}
      <rect x="7" y="20" width="9" height="16" rx="2.5" stroke="#D4537E" strokeWidth="2" strokeLinejoin="round"/>
      {/* Right weight */}
      <rect x="40" y="20" width="9" height="16" rx="2.5" stroke="#D4537E" strokeWidth="2" strokeLinejoin="round"/>
      {/* Inner collars */}
      <rect x="16" y="23" width="5" height="10" rx="1.5" stroke="#D4537E" strokeWidth="2"/>
      <rect x="35" y="23" width="5" height="10" rx="1.5" stroke="#D4537E" strokeWidth="2"/>
      {/* Bar */}
      <line x1="21" y1="28" x2="35" y2="28" stroke="#D4537E" strokeWidth="2" strokeLinecap="round"/>
      {/* Dots at bar endpoints and weight outer corners */}
      <circle cx="21" cy="28" r="3" fill="#D4537E"/>
      <circle cx="35" cy="28" r="3" fill="#D4537E"/>
      <circle cx="7" cy="20" r="3" fill="#D4537E"/>
      <circle cx="16" cy="20" r="3" fill="#D4537E"/>
      <circle cx="40" cy="20" r="3" fill="#D4537E"/>
      <circle cx="49" cy="20" r="3" fill="#D4537E"/>
    </svg>
  );
}

export function IconCreative({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Palette oval */}
      <path
        d="M28,8 C42,8 50,17 48,28 C46,37 38,44 30,42 C26,41 24,38 24,35 C24,31 20,28 16,28 C10,28 6,22 10,16 C14,10 20,8 28,8 Z"
        stroke="#7F77DD" strokeWidth="2" strokeLinejoin="round"
      />
      {/* Thumb hole */}
      <circle cx="20" cy="16" r="4" stroke="#7F77DD" strokeWidth="2"/>
      {/* Color paint dots */}
      <circle cx="32" cy="18" r="3" fill="#D4537E"/>
      <circle cx="40" cy="24" r="3" fill="#EF9F27"/>
      <circle cx="42" cy="33" r="3" fill="#1D9E75"/>
      <circle cx="35" cy="38" r="3" fill="#378ADD"/>
      <circle cx="28" cy="36" r="3" fill="#D85A30"/>
      <circle cx="22" cy="28" r="3" fill="#9CB85A"/>
    </svg>
  );
}

export function IconOutdoor({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Back mountain */}
      <polyline points="8,44 22,16 36,44" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Front mountain */}
      <polyline points="20,44 34,22 48,44" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Tent */}
      <polyline points="16,44 28,32 40,44" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Ground */}
      <line x1="6" y1="44" x2="50" y2="44" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
      {/* Dots at peaks and tent corners */}
      <circle cx="22" cy="16" r="3" fill="#1D9E75"/>
      <circle cx="34" cy="22" r="3" fill="#1D9E75"/>
      <circle cx="28" cy="32" r="3" fill="#1D9E75"/>
      <circle cx="16" cy="44" r="3" fill="#1D9E75"/>
      <circle cx="40" cy="44" r="3" fill="#1D9E75"/>
    </svg>
  );
}

export function IconTech({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Antenna */}
      <line x1="28" y1="9" x2="28" y2="16" stroke="#378ADD" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="28" cy="8" r="3" fill="#378ADD"/>
      {/* Head */}
      <rect x="12" y="16" width="32" height="24" rx="4" stroke="#378ADD" strokeWidth="2" strokeLinejoin="round"/>
      {/* Eyes */}
      <circle cx="21" cy="26" r="4" stroke="#378ADD" strokeWidth="2"/>
      <circle cx="35" cy="26" r="4" stroke="#378ADD" strokeWidth="2"/>
      <circle cx="21" cy="26" r="2" fill="#378ADD"/>
      <circle cx="35" cy="26" r="2" fill="#378ADD"/>
      {/* Mouth */}
      <rect x="20" y="33" width="16" height="4" rx="2" stroke="#378ADD" strokeWidth="2"/>
      {/* Corner dots */}
      <circle cx="12" cy="16" r="3" fill="#378ADD"/>
      <circle cx="44" cy="16" r="3" fill="#378ADD"/>
    </svg>
  );
}

export function IconSocial({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* X connection lines */}
      <line x1="15" y1="15" x2="41" y2="41" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      <line x1="41" y1="15" x2="15" y2="41" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round"/>
      {/* Top-left bubble */}
      <rect x="4" y="6" width="18" height="13" rx="3" stroke="#EF9F27" strokeWidth="2"/>
      <path d="M8,19 L7,24 L13,19" stroke="#EF9F27" strokeWidth="2" strokeLinejoin="round"/>
      {/* Top-right bubble */}
      <rect x="34" y="6" width="18" height="13" rx="3" stroke="#EF9F27" strokeWidth="2"/>
      <path d="M48,19 L49,24 L43,19" stroke="#EF9F27" strokeWidth="2" strokeLinejoin="round"/>
      {/* Bottom-left bubble */}
      <rect x="4" y="34" width="18" height="13" rx="3" stroke="#EF9F27" strokeWidth="2"/>
      <path d="M8,34 L7,29 L13,34" stroke="#EF9F27" strokeWidth="2" strokeLinejoin="round"/>
      {/* Bottom-right bubble */}
      <rect x="34" y="34" width="18" height="13" rx="3" stroke="#EF9F27" strokeWidth="2"/>
      <path d="M48,34 L49,29 L43,34" stroke="#EF9F27" strokeWidth="2" strokeLinejoin="round"/>
      {/* Dots at bubble centers and intersection */}
      <circle cx="13" cy="13" r="3" fill="#EF9F27"/>
      <circle cx="43" cy="13" r="3" fill="#EF9F27"/>
      <circle cx="13" cy="43" r="3" fill="#EF9F27"/>
      <circle cx="43" cy="43" r="3" fill="#EF9F27"/>
      <circle cx="28" cy="28" r="3" fill="#EF9F27"/>
    </svg>
  );
}

export function IconCulinary({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Flat brim */}
      <rect x="13" y="36" width="30" height="7" rx="2" stroke="#D85A30" strokeWidth="2" strokeLinejoin="round"/>
      {/* Puffy dome */}
      <path
        d="M19,36 C19,36 13,31 13,23 C13,15 19,9 28,9 C37,9 43,15 43,23 C43,31 37,36 37,36"
        stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Crown seam */}
      <line x1="19" y1="36" x2="37" y2="36" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
      {/* Dots */}
      <circle cx="28" cy="9" r="3" fill="#D85A30"/>
      <circle cx="13" cy="36" r="3" fill="#D85A30"/>
      <circle cx="43" cy="36" r="3" fill="#D85A30"/>
      <circle cx="13" cy="43" r="3" fill="#D85A30"/>
      <circle cx="43" cy="43" r="3" fill="#D85A30"/>
    </svg>
  );
}

export function IconAdventure({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Compass circle */}
      <circle cx="28" cy="28" r="20" stroke="#A33B5E" strokeWidth="2"/>
      {/* Diamond needle */}
      <path d="M28,12 L33,28 L28,44 L23,28 Z" stroke="#A33B5E" strokeWidth="2" strokeLinejoin="round"/>
      {/* Cardinal ticks */}
      <line x1="28" y1="7" x2="28" y2="12" stroke="#A33B5E" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="44" x2="28" y2="49" stroke="#A33B5E" strokeWidth="2" strokeLinecap="round"/>
      <line x1="7" y1="28" x2="12" y2="28" stroke="#A33B5E" strokeWidth="2" strokeLinecap="round"/>
      <line x1="44" y1="28" x2="49" y2="28" stroke="#A33B5E" strokeWidth="2" strokeLinecap="round"/>
      {/* Dots at 4 compass points */}
      <circle cx="28" cy="7" r="3" fill="#A33B5E"/>
      <circle cx="28" cy="49" r="3" fill="#A33B5E"/>
      <circle cx="7" cy="28" r="3" fill="#A33B5E"/>
      <circle cx="49" cy="28" r="3" fill="#A33B5E"/>
    </svg>
  );
}

export function IconNature({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Leaf outline */}
      <path
        d="M28,8 C40,10 48,20 44,32 C40,44 24,50 16,40 C8,30 12,12 28,8 Z"
        stroke="#1D9E75" strokeWidth="2" strokeLinejoin="round"
      />
      {/* Center vein */}
      <line x1="28" y1="8" x2="22" y2="44" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
      {/* Side veins */}
      <line x1="27" y1="18" x2="38" y2="16" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
      <line x1="25" y1="27" x2="39" y2="26" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
      <line x1="23" y1="36" x2="34" y2="36" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
      {/* Dots */}
      <circle cx="28" cy="8" r="3" fill="#1D9E75"/>
      <circle cx="22" cy="44" r="3" fill="#1D9E75"/>
      <circle cx="38" cy="16" r="3" fill="#1D9E75"/>
      <circle cx="39" cy="26" r="3" fill="#1D9E75"/>
      <circle cx="34" cy="36" r="3" fill="#1D9E75"/>
    </svg>
  );
}

export function IconCraft({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Needle body (diagonal) */}
      <line x1="16" y1="40" x2="44" y2="12" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
      {/* Needle eye */}
      <ellipse cx="20" cy="36" rx="3.5" ry="2" transform="rotate(-45 20 36)" stroke="#D85A30" strokeWidth="1.5" fill="#FAF6EC"/>
      {/* Thread loop */}
      <path
        d="M16,40 C8,48 4,44 6,36 C8,28 18,32 20,36"
        stroke="#D85A30" strokeWidth="2" strokeLinecap="round" fill="none"
      />
      {/* Dots */}
      <circle cx="20" cy="36" r="3" fill="#D85A30"/>
      <circle cx="30" cy="26" r="3" fill="#D85A30"/>
      <circle cx="44" cy="12" r="3" fill="#D85A30"/>
      <circle cx="6" cy="36" r="3" fill="#D85A30"/>
    </svg>
  );
}

export function IconMind({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {/* Bulb glass */}
      <path
        d="M28,8 C18,8 12,15 12,24 C12,31 16,35 20,38 L36,38 C40,35 44,31 44,24 C44,15 38,8 28,8 Z"
        stroke="#378ADD" strokeWidth="2" strokeLinejoin="round"
      />
      {/* Base collars */}
      <line x1="20" y1="41" x2="36" y2="41" stroke="#378ADD" strokeWidth="2" strokeLinecap="round"/>
      <line x1="21" y1="45" x2="35" y2="45" stroke="#378ADD" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="49" x2="32" y2="49" stroke="#378ADD" strokeWidth="2" strokeLinecap="round"/>
      {/* Filament */}
      <path d="M22,34 L22,26 L28,20 L34,26 L34,34" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots */}
      <circle cx="28" cy="8" r="3" fill="#378ADD"/>
      <circle cx="28" cy="20" r="3" fill="#378ADD"/>
      <circle cx="20" cy="38" r="3" fill="#378ADD"/>
      <circle cx="36" cy="38" r="3" fill="#378ADD"/>
    </svg>
  );
}

export function IconCommunity({ size = 24, className }: IconProps) {
  const cx = 28, cy = 28, r = 18;
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className}>
      {pts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#7F77DD" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <circle cx={cx} cy={cy} r="3" fill="#7F77DD"/>
      {pts.map((p, i) => {
        const dx = p.x - cx, dy = p.y - cy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / len, ny = dy / len;
        const hx = p.x + nx * 5, hy = p.y + ny * 5;
        const sx1 = hx - ny * 4, sy1 = hy + nx * 4;
        const sx2 = hx + ny * 4, sy2 = hy - nx * 4;
        const bx1 = sx1 + nx * 5, by1 = sy1 + ny * 5;
        const bx2 = sx2 + nx * 5, by2 = sy2 + ny * 5;
        return (
          <g key={`p-${i}`}>
            <circle cx={hx} cy={hy} r="4" stroke="#7F77DD" strokeWidth="2"/>
            <path
              d={`M${bx1.toFixed(1)},${by1.toFixed(1)} Q${(hx + nx * 7).toFixed(1)},${(hy + ny * 7).toFixed(1)} ${bx2.toFixed(1)},${by2.toFixed(1)}`}
              stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" fill="none"
            />
            <circle cx={hx} cy={hy} r="3" fill="#7F77DD"/>
          </g>
        );
      })}
    </svg>
  );
}

export function IconAppMark({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 110" fill="none" className={className}>
      <line x1="38" y1="30" x2="58" y2="18" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="58" y1="18" x2="80" y2="26" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="80" y1="26" x2="88" y2="50" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="88" y1="50" x2="72" y2="70" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="72" y1="70" x2="48" y2="76" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="48" y1="76" x2="30" y2="60" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <line x1="30" y1="60" x2="38" y2="30" stroke="#C4BFB4" strokeWidth="1.2" opacity="0.7"/>
      <circle cx="38" cy="30" r="11" fill="#D4537E"/>
      <circle cx="58" cy="18" r="8" fill="#EF9F27"/>
      <circle cx="80" cy="26" r="10" fill="#7F77DD"/>
      <circle cx="88" cy="50" r="7" fill="#378ADD"/>
      <circle cx="72" cy="70" r="9" fill="#D85A30"/>
      <circle cx="48" cy="76" r="7" fill="#639922"/>
      <circle cx="30" cy="60" r="8" fill="#D4537E" opacity="0.7"/>
    </svg>
  );
}
