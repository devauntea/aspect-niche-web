"use client";

import { useState, useEffect } from "react";
import type { Activity } from "../types/graph";

const ACTIVITY_COLORS: Record<string, string> = {
  "rock-climbing": "#D4537E",
  zumba: "#EF9F27",
  cycling: "#1D9E75",
  yoga: "#7F77DD",
  running: "#D85A30",
  hiking: "#1D9E75",
  photography: "#7F77DD",
  drawing: "#D4537E",
  music: "#EF9F27",
  pottery: "#D85A30",
  kayaking: "#378ADD",
  coding: "#378ADD",
  "3d-printing": "#639922",
  electronics: "#EF9F27",
  "board-games": "#D4537E",
  improv: "#EF9F27",
  cooking: "#D85A30",
  baking: "#EF9F27",
  coffee: "#D85A30",
  fermentation: "#1D9E75",
  "cooking-club": "#D4537E",
  surfing: "#378ADD",
  skateboarding: "#D85A30",
  archery: "#639922",
  fencing: "#7F77DD",
  parkour: "#D4537E",
  climbing: "#D4537E",
  astronomy: "#7F77DD",
  geology: "#D85A30",
  mycology: "#639922",
  foraging: "#1D9E75",
  birdwatching: "#378ADD",
  "marine-biology": "#378ADD",
  calligraphy: "#7F77DD",
  bookbinding: "#D85A30",
  glassblowing: "#EF9F27",
  leatherwork: "#D85A30",
  blacksmithing: "#D85A30",
  weaving: "#D4537E",
  "language-learning": "#378ADD",
  philosophy: "#7F77DD",
  chess: "#1A1916",
  investing: "#639922",
  journaling: "#D4537E",
  meditation: "#7F77DD",
  volunteering: "#1D9E75",
  genealogy: "#EF9F27",
  "urban-exploration": "#D85A30",
};

const CATEGORY_EMOJI: Record<string, string> = {
  fitness: "🏃",
  creative: "🎨",
  outdoor: "🌿",
  tech: "💻",
  social: "🎲",
  culinary: "🍳",
  adventure: "⚡",
  nature: "🔭",
  craft: "🪡",
  mind: "🧠",
  community: "🤝",
};

interface Props {
  activity: Activity;
  interestIds: string[];
  reason: string;
  onDismiss: () => void;
}

const diffLabel: Record<string, string> = {
  beginner: "Beginner-friendly",
  intermediate: "Some experience",
  advanced: "Experienced",
};
const costLabel: Record<string, string> = {
  free: "Free",
  low: "Low cost",
  medium: "Some gear",
  high: "Investment",
};

export default function SurpriseCard({ activity, reason, onDismiss }: Props) {
  const [flipped, setFlipped] = useState(false);
  const color = ACTIVITY_COLORS[activity.id] ?? "#7F77DD";

  // Auto-flip after a short delay for the magical reveal
  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 320);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5 surprise-backdrop"
      style={{ background: "rgba(26,25,22,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onDismiss}
    >
      {/* Card wrapper — stop propagation so clicking card doesn't dismiss */}
      <div
        className="w-full max-w-sm surprise-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flip-scene w-full" style={{ height: 460 }}>
          <div
            className={`flip-card w-full h-full ${flipped ? "is-flipped" : ""}`}
          >
            {/* ── Front face — question mark / mystery ── */}
            <div
              className="flip-card__face flex flex-col items-center justify-center gap-5"
              style={{
                background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`,
                border: `2px solid ${color}40`,
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: `${color}18`,
                  border: `2px solid ${color}30`,
                }}
              >
                🎲
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#5A5855]">
                  Your next adventure is...
                </p>
                <p className="text-xs text-[#B0ADA8] mt-1">flipping now</p>
              </div>
              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: color,
                      opacity: 0.6,
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── Back face — the reveal ── */}
            <div
              className="flip-card__face flip-card__face--back flex flex-col overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: `2px solid ${color}30`,
              }}
            >
              {/* Color band */}
              <div
                className="h-2 w-full flex-shrink-0"
                style={{
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                }}
              />

              <div
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-4"
                style={{
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-1">
                      Your surprise
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight leading-tight text-[#1A1916]">
                      {activity.label}
                    </h2>
                  </div>
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${color}14` }}
                  >
                    {CATEGORY_EMOJI[
                      activity.tags.environment === "outdoors"
                        ? "outdoor"
                        : "fitness"
                    ] ?? "✨"}
                  </div>
                </div>

                <p className="text-sm text-[#5A5855] leading-relaxed">
                  {activity.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    diffLabel[activity.tags.difficulty],
                    costLabel[activity.tags.cost],
                    activity.tags.environment,
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium capitalize"
                      style={{ background: `${color}12`, color }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Why it fits */}
                <div
                  className="rounded-xl p-3.5 flex gap-3"
                  style={{ background: `${color}0e` }}
                >
                  <span className="text-base flex-shrink-0">✨</span>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-widest mb-1"
                      style={{ color }}
                    >
                      Why this fits
                    </p>
                    <p className="text-xs text-[#1A1916] leading-relaxed">
                      {reason}
                    </p>
                  </div>
                </div>

                {/* Beginner tip */}
                <div
                  className="rounded-xl p-3.5 flex gap-3"
                  style={{ background: "#FAF8F2" }}
                >
                  <span className="text-base flex-shrink-0">💡</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-1">
                      First step
                    </p>
                    <p className="text-xs text-[#1A1916] leading-relaxed">
                      {activity.beginnerTip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex gap-2 flex-shrink-0">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(activity.label + " near me")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white text-center transition-all hover:opacity-90"
                  style={{ background: color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Find nearby →
                </a>
                <button
                  onClick={onDismiss}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[#5A5855] bg-[#F0EDE6] hover:bg-[#E8E4DA] transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss hint */}
        <p className="text-center text-xs text-white/50 mt-3">
          tap outside to dismiss
        </p>
      </div>
    </div>
  );
}
