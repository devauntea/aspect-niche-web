"use client";

import React from "react";
import { interests } from "../data/activities";
import {
  IconAppMark,
  IconFitness,
  IconCreative,
  IconOutdoor,
  IconTech,
  IconSocial,
  IconCulinary,
  IconAdventure,
  IconNature,
  IconCraft,
  IconMind,
  IconCommunity,
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

type IconComponent = (props: {
  size?: number;
  className?: string;
}) => React.ReactElement;

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

const GRID_IDS = [
  "fitness",
  "creative",
  "outdoor",
  "tech",
  "social",
  "culinary",
  "adventure",
  "nature",
  "craft",
];
const LAST_ROW_IDS = ["mind", "community"];

function InterestTile({
  interestId,
  label,
  isSelected,
  color,
  onToggle,
}: {
  interestId: string;
  label: string;
  isSelected: boolean;
  color: string;
  onToggle: () => void;
}) {
  const Icon = INTEREST_ICON[interestId];
  return (
    <button
      onClick={onToggle}
      className="relative flex flex-col items-center rounded-2xl p-3 transition-all duration-150 active:scale-95"
      style={{
        background: "#FFFFFF",
        border: isSelected ? `2px solid ${color}` : "1px solid #E8E4DA",
        boxShadow: isSelected
          ? `0 4px 14px ${color}20`
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {isSelected && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: color }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5l2 2 4-3.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <div className="mb-2">{Icon ? <Icon size={52} /> : null}</div>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#1A1916",
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function InterestOnboarding({
  selected,
  onToggle,
  onConfirm,
}: Props) {
  const canContinue = selected.length > 0;
  const interestMap = Object.fromEntries(interests.map((i) => [i.id, i]));

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center bg-[#FAF8F2] overflow-y-auto">
      <div className="w-full max-w-md px-5 py-6 flex flex-col">
        {/* Logo mark row */}
        <div className="flex items-center gap-2 mb-8">
          <IconAppMark size={20} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1A1916",
              letterSpacing: "-0.01em",
            }}
          >
            Aspect Niche
          </span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#1A1916",
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            What pulls your
            <br />
            attention?
          </h1>
          <p style={{ fontSize: 15, color: "#9A9690", lineHeight: 1.5 }}>
            Pick one or more. Your hobby graph builds from here.
          </p>
        </div>

        {/* 3-col grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {GRID_IDS.map((id) => {
            const interest = interestMap[id];
            if (!interest) return null;
            return (
              <InterestTile
                key={id}
                interestId={id}
                label={interest.label}
                isSelected={selected.includes(id)}
                color={INTEREST_COLORS[id] ?? "#7F77DD"}
                onToggle={() => onToggle(id)}
              />
            );
          })}
        </div>

        {/* Centered 2-tile last row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {LAST_ROW_IDS.map((id) => {
            const interest = interestMap[id];
            if (!interest) return null;
            return (
              <div key={id} style={{ width: "calc((100% - 12px) / 3)" }}>
                <InterestTile
                  interestId={id}
                  label={interest.label}
                  isSelected={selected.includes(id)}
                  color={INTEREST_COLORS[id] ?? "#7F77DD"}
                  onToggle={() => onToggle(id)}
                />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={onConfirm}
          disabled={!canContinue}
          style={{
            width: "100%",
            borderRadius: 9999,
            padding: "16px 24px",
            fontWeight: 600,
            fontSize: 15,
            background: canContinue ? "#7F77DD" : "#E8E4DA",
            color: canContinue ? "white" : "#B0ADA8",
            cursor: canContinue ? "pointer" : "not-allowed",
            boxShadow: canContinue ? "0 4px 20px #7F77DD40" : "none",
            border: "none",
            transition: "all 0.15s ease",
          }}
        >
          {canContinue
            ? `Build my graph · ${selected.length} interest${selected.length !== 1 ? "s" : ""} →`
            : "Pick at least one interest"}
        </button>

        {canContinue && (
          <p
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 12,
              color: "#B0ADA8",
            }}
          >
            You can change this anytime
          </p>
        )}
      </div>
    </div>
  );
}
