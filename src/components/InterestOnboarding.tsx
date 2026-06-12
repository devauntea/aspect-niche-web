"use client";

import React from "react";
import { interests } from "../data/activities";
import {
  IconFitness, IconCreative, IconOutdoor, IconTech, IconSocial, IconCulinary,
  IconAdventure, IconNature, IconCraft, IconMind, IconCommunity,
} from "./icons";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
}

const INTEREST_COLORS: Record<string, string> = {
  fitness: "#D4537E",
  creative: "#7F77DD",
  outdoor: "#1D9E75",
  tech: "#378ADD",
  social: "#EF9F27",
  culinary: "#D85A30",
  adventure: "#D4537E",
  nature: "#1D9E75",
  craft: "#7F77DD",
  mind: "#378ADD",
  community: "#EF9F27",
};

type IconComponent = (props: { size?: number; className?: string }) => React.ReactElement;

const INTEREST_ICON: Record<string, IconComponent> = {
  fitness: IconFitness,
  creative: IconCreative,
  outdoor: IconOutdoor,
  tech: IconTech,
  social: IconSocial,
  culinary: IconCulinary,
  adventure: IconAdventure,
  nature: IconNature,
  craft: IconCraft,
  mind: IconMind,
  community: IconCommunity,
};

const INTEREST_BLURB: Record<string, string> = {
  fitness: "Move your body, build energy",
  creative: "Make things, express yourself",
  outdoor: "Explore beyond four walls",
  tech: "Build, tinker, create with code",
  social: "Connect through play",
  culinary: "Cook, taste, experiment",
  adventure: "Push limits, seek the rush",
  nature: "Slow down, look closer",
  craft: "Make it by hand, make it yours",
  mind: "Think deeper, learn always",
  community: "Show up, give back, belong",
};

export default function InterestOnboarding({
  selected,
  onToggle,
  onConfirm,
}: Props) {
  const canContinue = selected.length > 0;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#FAF8F2] px-5">
      <div className="w-full max-w-md">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <span className="text-xl font-medium tracking-tight text-[#1A1916]">
            aspect<span className="text-[#7F77DD]">·niche</span>
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A1916] leading-tight mb-2">
            What pulls
            <br />
            your attention?
          </h1>
          <p className="text-[#9A9690] text-sm leading-relaxed">
            Pick one or more. Your hobby graph builds from here.
          </p>
        </div>

        {/* Interest grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {interests.map((interest) => {
            const isSelected = selected.includes(interest.id);
            const color = INTEREST_COLORS[interest.id] ?? "#7F77DD";
            return (
              <button
                key={interest.id}
                onClick={() => onToggle(interest.id)}
                className="relative rounded-2xl p-4 text-left transition-all duration-150 active:scale-95"
                style={{
                  border: `1.5px solid ${isSelected ? color : "#E8E4DA"}`,
                  background: isSelected ? `${color}12` : "#FFFFFF",
                  transform: isSelected ? "scale(1.01)" : "scale(1)",
                  boxShadow: isSelected
                    ? `0 4px 14px ${color}20`
                    : "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  {(() => { const Icon = INTEREST_ICON[interest.id]; return Icon ? <Icon size={28} /> : null; })()}
                  {isSelected && (
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: color }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4l1.5 1.5 3.5-3"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="font-semibold text-[#1A1916] text-sm leading-tight mb-0.5">
                  {interest.label}
                </p>
                <p className="text-[10px] text-[#9A9690] leading-tight">
                  {INTEREST_BLURB[interest.id]}
                </p>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={onConfirm}
          disabled={!canContinue}
          className="w-full rounded-2xl py-3.5 font-semibold text-sm transition-all duration-150 active:scale-98"
          style={{
            background: canContinue ? "#7F77DD" : "#E8E4DA",
            color: canContinue ? "white" : "#B0ADA8",
            cursor: canContinue ? "pointer" : "not-allowed",
            boxShadow: canContinue ? "0 4px 16px #7F77DD40" : "none",
          }}
        >
          {canContinue
            ? `Build my graph${selected.length > 1 ? ` · ${selected.length} interests` : ""} →`
            : "Pick at least one interest"}
        </button>

        {/* Hint */}
        {canContinue && (
          <p className="text-center text-[11px] text-[#B0ADA8] mt-3">
            You can change this anytime
          </p>
        )}
      </div>
    </div>
  );
}
