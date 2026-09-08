"use client";

import React from "react";
import { interests } from "../data/activities";
import BrandMark from "./BrandMark";
import {
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
import HobbyGlyph from "@/components/HobbyGlyph";
import type { Category } from "@/lib/themes";
import { storedIconSet, type IconSetId } from "@/lib/iconSet";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
}

// Icon accents = the theme's category star hues (switch with the theme)
const INTEREST_COLORS: Record<string, string> = {
  fitness: "var(--hue-fitness)",
  creative: "var(--hue-creative)",
  outdoor: "var(--hue-outdoor)",
  tech: "var(--hue-tech)",
  social: "var(--hue-social)",
  culinary: "var(--hue-culinary)",
  adventure: "var(--hue-adventure)",
  nature: "var(--hue-nature)",
  craft: "var(--hue-craft)",
  mind: "var(--hue-mind)",
  community: "var(--hue-community)",
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
  iconSet,
  onToggle,
}: {
  interestId: string;
  label: string;
  isSelected: boolean;
  color: string;
  iconSet?: IconSetId;
  onToggle: () => void;
}) {
  const Icon = INTEREST_ICON[interestId];
  return (
    <button
      onClick={onToggle}
      className="relative flex flex-col items-center rounded-2xl p-3 transition-all duration-150 active:scale-95"
      style={{
        background: "var(--color-surface)",
        border: isSelected
          ? `2px solid ${color}`
          : "1px solid var(--color-surface-raised)",
        boxShadow: isSelected
          ? `0 4px 14px color-mix(in srgb, ${color} 13%, transparent)`
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
      {/* The chosen icon family draws the cluster, so onboarding shows the
          same marks the graph will. The old hand-drawn set stays as the
          fallback for anything a family does not cover. */}
      <div className="mb-2">
        {iconSet ? (
          <HobbyGlyph
            id={interestId}
            category={interestId as Category}
            hue={color}
            size={52}
            iconSet={iconSet}
          />
        ) : Icon ? (
          <Icon size={52} />
        ) : null}
      </div>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--color-text)",
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
  // The demo's chosen icon family, read once on the client.
  const iconSet = storedIconSet();
  const canContinue = selected.length > 0;
  const interestMap = Object.fromEntries(interests.map((i) => [i.id, i]));

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center bg-space-950 overflow-y-auto">
      <div className="w-full max-w-md px-5 py-6 flex flex-col">
        {/* Logo mark row */}
        <div className="flex items-center gap-2 mb-8">
          <BrandMark size={22} variant="night" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--color-text)",
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
              color: "var(--color-text)",
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            What pulls your
            <br />
            attention?
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--color-text-dim)",
              lineHeight: 1.5,
            }}
          >
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
                iconSet={iconSet}
                key={id}
                interestId={id}
                label={interest.label}
                isSelected={selected.includes(id)}
                color={INTEREST_COLORS[id] ?? "var(--color-glow)"}
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
                iconSet={iconSet}
                  interestId={id}
                  label={interest.label}
                  isSelected={selected.includes(id)}
                  color={INTEREST_COLORS[id] ?? "var(--color-glow)"}
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
            background: canContinue
              ? "var(--color-glow)"
              : "var(--color-surface-raised)",
            color: canContinue ? "white" : "var(--color-text-dim)",
            cursor: canContinue ? "pointer" : "not-allowed",
            boxShadow: canContinue ? "0 4px 20px var(--color-glow)40" : "none",
            border: "none",
            transition: "all 0.15s ease",
          }}
        >
          {canContinue
            ? `Jump in · ${selected.length} interest${selected.length !== 1 ? "s" : ""} →`
            : "Pick at least one interest"}
        </button>

        {canContinue && (
          <p
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 12,
              color: "var(--color-text-dim)",
            }}
          >
            You can change this anytime
          </p>
        )}
      </div>
    </div>
  );
}
