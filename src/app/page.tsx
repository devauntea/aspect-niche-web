"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import SurpriseCard from "../components/SurpriseCard";
import GraphCanvas from "../components/GraphCanvas";
import LogoAnimation from "../components/LogoAnimation";
import InterestOnboarding from "../components/InterestOnboarding";
import SavedDrawer from "../components/SavedDrawer";
import { activities, interests } from "../data/activities";
import NicheMode from "../components/NicheMode";
import ResourceLinks from "../components/ResourceLinks";
import { nicheContent } from "../data/nicheContent";
import { getResources } from "../data/resources";
import type { Activity } from "@/types/graph";
import QuickFilters, { type ActiveFilters } from "../components/QuickFilters";
import RabbitHolePanel from "../components/RabbitHolePanel";
import { IconAppMark } from "../components/icons";
import { applyForceLayout } from "@/lib/forceLayout";
import { getChecked, saveChecked } from "@/lib/checklistStorage";

import {
  buildInterestNodes,
  buildActivityNodes,
  buildVisibleEdges,
} from "@/lib/graphUtils";
import { getSaved, toggleSaved, isSaved } from "@/lib/storage";
import {
  getWhyItFits,
  getBeginnerChecklist,
  getSimilarActivities,
} from "@/lib/recommendations";

type Screen = "splash" | "onboarding" | "app";

const INTEREST_COLORS: Record<string, string> = {
  fitness: "#D4537E",
  creative: "#7F77DD",
  outdoor: "#1D9E75",
  tech: "#378ADD",
  social: "#EF9F27",
  culinary: "#D85A30",
};
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
};

const diffLabel: Record<string, string> = {
  beginner: "Beginner-friendly",
  intermediate: "Some experience",
  advanced: "Experienced",
};
const envLabel: Record<string, string> = {
  indoors: "Indoors",
  outdoors: "Outdoors",
  both: "In or out",
};
const costLabel: Record<string, string> = {
  free: "Free",
  low: "Low cost",
  medium: "Some gear",
  high: "Investment",
};

//states
export default function Home() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedInterests, setExpandedInterests] = useState<Set<string>>(
    new Set(),
  );
  const [savedIds, setSavedIds] = useState<string[]>(() => getSaved());
  const [showSaved, setShowSaved] = useState(false);
  const [randomReason, setRandomReason] = useState<string | null>(null);
  const [surpriseActivity, setSurpriseActivity] = useState<
    (typeof activities)[0] | null
  >(null);
  const [isNicheMode, setIsNicheMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    environment: [],
    social: [],
    difficulty: [],
    cost: [],
  });
  const [noMatchHint, setNoMatchHint] = useState(false);
  const [showEditHint, setShowEditHint] = useState(() => {
    try { return !localStorage.getItem("aspect-niche-hint-shown"); } catch { return false; }
  });
  const [checkedActivityId, setCheckedActivityId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);

  // ── Onboarding ─────────────────────────────────────────
  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function handleConfirmInterests() {
    setExpandedInterests(new Set());
    setSelectedId(null);
    setRandomReason(null);
    setScreen("app");
  }

  function toggleFilter(category: keyof ActiveFilters, value: string) {
    setActiveFilters((prev) => {
      const current = prev[category];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
    setNoMatchHint(false);
  }

  function clearFilters() {
    setActiveFilters({ environment: [], social: [], difficulty: [], cost: [] });
    setNoMatchHint(false);
  }

  useEffect(() => {
    if (!showEditHint) return;
    try { localStorage.setItem("aspect-niche-hint-shown", "1"); } catch {}
    const t = setTimeout(() => setShowEditHint(false), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Graph construction ─────────────────────────────────
  const interestNodes = useMemo(
    () => buildInterestNodes(selectedInterests),
    [selectedInterests],
  );
  const interestPosMap = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const n of interestNodes) map[n.id] = n.position;
    return map;
  }, [interestNodes]);

  const activityNodes = useMemo(() => {
    const nodes = [];
    for (const id of expandedInterests) {
      const pos = interestPosMap[id];
      if (pos) nodes.push(...buildActivityNodes(id, pos, 300, 260));
    }
    const seen = new Set<string>();
    return nodes.filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  }, [expandedInterests, interestPosMap]);

  const filteredActivityNodes = useMemo(() => {
    const { environment, social, difficulty, cost } = activeFilters;
    const hasFilters =
      environment.length > 0 ||
      social.length > 0 ||
      difficulty.length > 0 ||
      cost.length > 0;
    if (!hasFilters) return activityNodes;
    return activityNodes.filter((n) => {
      const a = n.data as Activity;
      if (environment.length > 0 && !environment.includes(a.tags.environment)) return false;
      if (social.length > 0 && !social.includes(a.tags.social)) return false;
      if (difficulty.length > 0 && !difficulty.includes(a.tags.difficulty)) return false;
      if (cost.length > 0 && !cost.includes(a.tags.cost)) return false;
      return true;
    });
  }, [activityNodes, activeFilters]);

  // Interests with all activities filtered out appear collapsed
  const effectiveExpandedInterests = useMemo(() => {
    const filteredIds = new Set(filteredActivityNodes.map((n) => n.id));
    return new Set(
      [...expandedInterests].filter((id) => {
        const interest = interests.find((i) => i.id === id);
        return interest?.activityIds.some((aid) => filteredIds.has(aid));
      }),
    );
  }, [expandedInterests, filteredActivityNodes]);

  const allNodes = useMemo(
    () => [...interestNodes, ...filteredActivityNodes],
    [interestNodes, filteredActivityNodes],
  );
  const visibleIds = useMemo(
    () => new Set(allNodes.map((n) => n.id)),
    [allNodes],
  );
  const graphEdges = useMemo(
    () => buildVisibleEdges(visibleIds, selectedInterests),
    [visibleIds, selectedInterests],
  );

  const layoutNodes = useMemo(
    () =>
      expandedInterests.size > 0
        ? applyForceLayout(allNodes, graphEdges)
        : allNodes,
    [allNodes, graphEdges, expandedInterests],
  );

  // ── Node tap ───────────────────────────────────────────
  const handleSelectNode = useCallback((id: string) => {
    const isInterest = interests.some((i) => i.id === id);
    setRandomReason(null);
    setIsNicheMode(false);
    if (isInterest) {
      setExpandedInterests((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
    setSelectedId(id);
  }, []);

  // ── Random activity ────────────────────────────────────
  function handleRandom() {
    const { environment, social, difficulty, cost } = activeFilters;
    const hasFilters =
      environment.length > 0 ||
      social.length > 0 ||
      difficulty.length > 0 ||
      cost.length > 0;

    const pool = activities.filter((a) => {
      const inInterests = selectedInterests.some((si) =>
        interests.find((i) => i.id === si)?.activityIds.includes(a.id),
      );
      if (!inInterests) return false;
      if (hasFilters) {
        if (environment.length > 0 && !environment.includes(a.tags.environment)) return false;
        if (social.length > 0 && !social.includes(a.tags.social)) return false;
        if (difficulty.length > 0 && !difficulty.includes(a.tags.difficulty)) return false;
        if (cost.length > 0 && !cost.includes(a.tags.cost)) return false;
      }
      return true;
    });

    if (pool.length === 0) {
      setNoMatchHint(true);
      return;
    }
    setNoMatchHint(false);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const parent = interests.find(
      (i) =>
        i.activityIds.includes(pick.id) && selectedInterests.includes(i.id),
    );
    if (parent) setExpandedInterests((prev) => new Set([...prev, parent.id]));
    const reason = getWhyItFits(pick, selectedInterests);
    setRandomReason(reason);
    setSelectedId(pick.id);
    setIsNicheMode(false);
    setSurpriseActivity(pick);
  }

  // ── Save / unsave ──────────────────────────────────────
  function handleToggleSave(id: string) {
    setSavedIds(toggleSaved(id));
  }

  // ── Detail data ────────────────────────────────────────
  const detail = useMemo(() => {
    if (!selectedId) return null;
    const activity = activities.find((a) => a.id === selectedId);
    if (activity) return { type: "activity" as const, data: activity };
    const interest = interests.find((i) => i.id === selectedId);
    if (interest) return { type: "interest" as const, data: interest };
    return null;
  }, [selectedId]);

  const accentColor = selectedId
    ? (INTEREST_COLORS[selectedId] ?? ACTIVITY_COLORS[selectedId] ?? "#7F77DD")
    : "#7F77DD";

  const isExpanded = selectedId ? effectiveExpandedInterests.has(selectedId) : false;
  const activityDetail = detail?.type === "activity" ? detail.data : null;

  const checklist = useMemo(
    () => (activityDetail ? getBeginnerChecklist(activityDetail) : []),
    [activityDetail],
  );
  const similarActs = useMemo(
    () =>
      activityDetail
        ? getSimilarActivities(activityDetail, selectedInterests)
        : [],
    [activityDetail, selectedInterests],
  );
  const saved = activityDetail ? isSaved(savedIds, activityDetail.id) : false;

  // Sync checklist state when activity changes (update-during-render pattern)
  if ((activityDetail?.id ?? null) !== checkedActivityId) {
    setCheckedActivityId(activityDetail?.id ?? null);
    setCheckedItems(activityDetail ? getChecked(activityDetail.id) : []);
    setAllDone(false);
  }

  function toggleChecked(idx: number) {
    const next = checkedItems.includes(idx)
      ? checkedItems.filter((i) => i !== idx)
      : [...checkedItems, idx];
    setCheckedItems(next);
    if (activityDetail) saveChecked(activityDetail.id, next);
    if (next.length === checklist.length && checklist.length > 0) {
      setAllDone(true);
      setTimeout(() => setAllDone(false), 2000);
    } else {
      setAllDone(false);
    }
  }

  const hintText = useMemo(() => {
    if (noMatchHint) return "No activities match — try clearing a filter";
    if (expandedInterests.size === 0)
      return "Tap an interest to reveal activities";
    if (!selectedId || interests.some((i) => i.id === selectedId))
      return "Tap an activity to explore it";
    return null;
  }, [expandedInterests, selectedId, noMatchHint]);

  return (
    <>
      {screen === "splash" && (
        <LogoAnimation onComplete={() => setScreen("onboarding")} />
      )}
      {screen === "onboarding" && (
        <InterestOnboarding
          selected={selectedInterests}
          onToggle={toggleInterest}
          onConfirm={handleConfirmInterests}
        />
      )}
      {screen === "app" && (
        <main className="min-h-screen bg-[#FAF8F2] text-[#1A1916]">
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-7">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setScreen("onboarding")}
                className="flex items-center gap-2"
              >
                <IconAppMark size={20} />
                <span className="text-lg font-semibold tracking-tight">
                  aspect<span className="text-[#7F77DD]">·niche</span>
                </span>
              </button>
              <div className="flex items-center gap-2">
                {selectedInterests.map((id) => {
                  const color = INTEREST_COLORS[id] ?? "#7F77DD";
                  return (
                    <span
                      key={id}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: `${color}14`, color }}
                    >
                      {interests.find((i) => i.id === id)?.label}
                    </span>
                  );
                })}
                {/* Saved button */}
                <button
                  onClick={() => setShowSaved(true)}
                  className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white border border-[#E8E4DA] hover:border-[#D3D0C8] transition-colors ml-1"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 1.5h8a.5.5 0 01.5.5v9L6 8.5 1.5 11V2a.5.5 0 01.5-.5z"
                      stroke="#5A5855"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      fill={savedIds.length > 0 ? "#7F77DD" : "none"}
                      strokeDasharray={savedIds.length > 0 ? "none" : "none"}
                    />
                  </svg>
                  <span className="text-[#5A5855]">
                    {savedIds.length > 0 ? `${savedIds.length} saved` : "Saved"}
                  </span>
                </button>

                {/* Edit interests */}
                <div className="relative ml-1">
                  <button
                    onClick={() => {
                      setShowEditHint(false);
                      setScreen("onboarding");
                    }}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium bg-white transition-colors hover:border-[#7F77DD] hover:text-[#7F77DD]"
                    style={{ borderColor: "#E8E4DA", color: "#5A5855" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M7.5 1.5L9.5 3.5L3.5 9.5H1.5V7.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    Edit interests
                  </button>
                  {showEditHint && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-[#1A1916] text-white pointer-events-none z-50">
                      ← Change your interests here
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Quick filters */}
            <div className="mb-4">
              <QuickFilters
                activeFilters={activeFilters}
                onToggle={toggleFilter}
                onClear={clearFilters}
              />
            </div>

            <section className="grid flex-1 gap-4 md:grid-cols-[1.45fr_0.85fr]">
              {/* Graph panel */}
              <div className="rounded-3xl border border-[#E8E4DA] bg-white p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Explore</h2>
                    {hintText && (
                      <p className="text-xs text-[#B0ADA8] mt-0.5">
                        {hintText}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRandom}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "#7F77DD",
                      boxShadow: "0 2px 10px #7F77DD35",
                    }}
                  >
                    Surprise me
                  </button>
                </div>
                <GraphCanvas
                  nodes={layoutNodes}
                  edges={graphEdges}
                  selectedId={selectedId}
                  expandedInterests={effectiveExpandedInterests}
                  onSelectNode={handleSelectNode}
                />
              </div>

              {/* Detail panel */}
              {detail?.type !== "activity" ? (
                <div className="rounded-3xl border border-[#E8E4DA] bg-white p-5 shadow-sm flex flex-col overflow-y-auto max-h-[620px]">
                  <h2 className="text-base font-semibold mb-5">Details</h2>

                  {/* ── Empty ── */}
                  {!detail && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0EDE6] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="7" stroke="#B0ADA8" strokeWidth="1.5" />
                          <circle cx="10" cy="10" r="2.5" fill="#B0ADA8" />
                          <line x1="10" y1="3" x2="10" y2="5.5" stroke="#B0ADA8" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="10" y1="14.5" x2="10" y2="17" stroke="#B0ADA8" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="3" y1="10" x2="5.5" y2="10" stroke="#B0ADA8" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="14.5" y1="10" x2="17" y2="10" stroke="#B0ADA8" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[#5A5855]">Nothing selected</p>
                      <p className="text-xs text-[#B0ADA8] leading-relaxed max-w-[180px]">
                        Tap an interest to expand it, then pick an activity.
                      </p>
                    </div>
                  )}

                  {/* ── Interest ── */}
                  {detail?.type === "interest" && (
                    <div className="flex flex-col gap-4">
                      <div className="h-0.5 rounded-full w-8" style={{ background: accentColor }} />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-1">Interest</p>
                        <h3 className="text-2xl font-semibold tracking-tight">{detail.data.label}</h3>
                      </div>
                      <p className="text-sm text-[#5A5855] leading-relaxed">
                        {isExpanded
                          ? `${(detail.data as (typeof interests)[0]).activityIds.length} activities revealed. Tap any to explore.`
                          : "Tap this node in the graph to reveal activities."}
                      </p>
                      {isExpanded && (
                        <div className="flex flex-wrap gap-1.5">
                          {(detail.data as (typeof interests)[0]).activityIds.map((id) => {
                            const act = activities.find((a) => a.id === id);
                            return act ? (
                              <button
                                key={id}
                                onClick={() => setSelectedId(id)}
                                className="rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                                style={{ background: `${accentColor}14`, color: accentColor }}
                              >
                                {act.label}
                              </button>
                            ) : null;
                          })}
                        </div>
                      )}
                      <button
                        onClick={() => handleSelectNode(detail.data.id)}
                        className="rounded-2xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: accentColor }}
                      >
                        {isExpanded ? "Collapse activities" : "Show activities →"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Activity: flip card ── */
                <div className="flip-scene rounded-3xl shadow-sm" style={{ height: 620 }}>
                  <div className={`flip-card w-full h-full${isNicheMode && nicheContent[activityDetail!.id] ? " is-flipped" : ""}`}>

                    {/* Front face */}
                    <div className="flip-card__face border border-[#E8E4DA] bg-white p-5 flex flex-col gap-4 overflow-y-auto">
                      <h2 className="text-base font-semibold">Details</h2>
                      <div className="h-0.5 rounded-full w-8" style={{ background: accentColor }} />

                      {/* Title + save */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-1">Activity</p>
                          <h3 className="text-2xl font-semibold tracking-tight leading-tight">
                            {activityDetail!.label}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleToggleSave(activityDetail!.id)}
                          className="mt-1 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                          style={{
                            background: saved ? `${accentColor}18` : "#F0EDE6",
                            border: saved ? `1.5px solid ${accentColor}40` : "1.5px solid transparent",
                          }}
                          title={saved ? "Remove from saved" : "Save activity"}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M3 2h10a.5.5 0 01.5.5v12L8 11.5 2.5 14.5V2.5A.5.5 0 013 2z"
                              fill={saved ? accentColor : "none"}
                              stroke={saved ? accentColor : "#9A9690"}
                              strokeWidth="1.3"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Description + niche toggle */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#5A5855] leading-relaxed flex-1 mr-3">
                          {activityDetail!.description}
                        </p>
                        {nicheContent[activityDetail!.id] && (
                          <NicheMode
                            isNiche={isNicheMode}
                            onToggle={() => setIsNicheMode((n) => !n)}
                            accentColor={accentColor}
                          />
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          diffLabel[activityDetail!.tags.difficulty],
                          envLabel[activityDetail!.tags.environment],
                          costLabel[activityDetail!.tags.cost],
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                            style={{ background: `${accentColor}12`, color: accentColor }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Why this fits */}
                      {randomReason && (
                        <div className="rounded-xl p-3.5 flex gap-3" style={{ background: `${accentColor}0e` }}>
                          <span className="text-base flex-shrink-0">✨</span>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                              Why this fits
                            </p>
                            <p className="text-xs text-[#1A1916] leading-relaxed">{randomReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Beginner tip */}
                      <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FAF8F2" }}>
                        <span className="text-base flex-shrink-0">💡</span>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-1">First step</p>
                          <p className="text-xs text-[#1A1916] leading-relaxed">{activityDetail!.beginnerTip}</p>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8]">Getting started</p>
                          {allDone ? (
                            <span className="text-[11px] font-semibold" style={{ color: accentColor }}>All done! ✦</span>
                          ) : checklist.length > 0 ? (
                            <span className="text-[11px] text-[#B0ADA8]">{checkedItems.length} of {checklist.length} done</span>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {checklist.map((step, i) => {
                            const done = checkedItems.includes(i);
                            return (
                              <button key={i} onClick={() => toggleChecked(i)} className="flex items-start gap-2.5 text-left w-full">
                                <div
                                  className="w-4 h-4 rounded-full border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-150"
                                  style={{
                                    borderColor: done ? accentColor : `${accentColor}60`,
                                    background: done ? accentColor : "transparent",
                                  }}
                                >
                                  {done && (
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                      <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <p
                                  className="text-xs leading-relaxed transition-all duration-150"
                                  style={{
                                    color: done ? `${accentColor}80` : "#5A5855",
                                    textDecoration: done ? "line-through" : "none",
                                  }}
                                >
                                  {step}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Similar activities */}
                      {similarActs.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-2">You might also like</p>
                          <div className="flex flex-wrap gap-1.5">
                            {similarActs.map((a) => (
                              <button
                                key={a.id}
                                onClick={() => { setSelectedId(a.id); setRandomReason(null); }}
                                className="rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                                style={{
                                  background: `${ACTIVITY_COLORS[a.id] ?? "#7F77DD"}14`,
                                  color: ACTIVITY_COLORS[a.id] ?? "#7F77DD",
                                }}
                              >
                                {a.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resource links */}
                      <ResourceLinks
                        resources={getResources(activityDetail!.id, activityDetail!.label)}
                        accentColor={accentColor}
                      />

                      {/* Find nearby */}
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(activityDetail!.label + " near me")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl py-3 text-sm font-semibold text-white text-center transition-all hover:opacity-90 active:scale-95 mt-auto"
                        style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}35`, display: "block" }}
                      >
                        Find nearby →
                      </a>
                    </div>

                    {/* Back face — niche mode */}
                    {nicheContent[activityDetail!.id] && (
                      <div
                        className="flip-card__face flip-card__face--back p-5 flex flex-col gap-4 overflow-y-auto"
                        style={{ background: `${accentColor}08`, border: `1.5px solid ${accentColor}` }}
                      >
                        {/* Header gradient band */}
                        <div
                          className="rounded-xl px-4 py-3"
                          style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)` }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: accentColor }}>
                                ◆ {nicheContent[activityDetail!.id].nicheLabel}
                              </span>
                              <h3 className="text-xl font-semibold tracking-tight mt-0.5">{activityDetail!.label}</h3>
                            </div>
                            <NicheMode
                              isNiche={isNicheMode}
                              onToggle={() => setIsNicheMode((n) => !n)}
                              accentColor={accentColor}
                            />
                          </div>
                        </div>

                        {/* Niche description */}
                        <p className="text-sm text-[#5A5855] leading-relaxed">
                          {nicheContent[activityDetail!.id].description}
                        </p>

                        {/* Rabbit holes */}
                        <div className="flex flex-col gap-2">
                          {nicheContent[activityDetail!.id].rabbitHoles.map((hole, i) => (
                            <div key={i} className="flex items-start gap-2.5 pl-3 border-l-[3px]" style={{ borderColor: accentColor }}>
                              <p className="text-xs text-[#5A5855] leading-relaxed">{hole}</p>
                            </div>
                          ))}
                        </div>

                        {/* Insider term */}
                        <div className="rounded-lg p-2.5" style={{ background: `${accentColor}10` }}>
                          <span className="text-[10px] uppercase tracking-widest text-[#B0ADA8]">Insider term: </span>
                          <span className="text-xs font-semibold" style={{ color: accentColor }}>
                            {nicheContent[activityDetail!.id].insiderTerm}
                          </span>
                          <p className="text-[11px] text-[#5A5855] mt-1 leading-relaxed">
                            {nicheContent[activityDetail!.id].insiderDefinition}
                          </p>
                        </div>

                        {/* Find nearby */}
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(activityDetail!.label + " near me")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl py-3 text-sm font-semibold text-white text-center transition-all hover:opacity-90 active:scale-95 mt-auto"
                          style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}35`, display: "block" }}
                        >
                          Find nearby →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Rabbit hole panel — activity only */}
            {detail?.type === "activity" && activityDetail && (
              <div className="mt-4">
                <RabbitHolePanel
                  key={activityDetail.id}
                  activityId={activityDetail.id}
                  activityLabel={activityDetail.label}
                  accentColor={accentColor}
                  tags={activityDetail.tags as Record<string, string>}
                />
              </div>
            )}
          </div>

          {/* Saved drawer */}
          {showSaved && (
            <SavedDrawer
              savedIds={savedIds}
              onSelect={(id) => {
                setSelectedId(id);
                setRandomReason(null);
              }}
              onUnsave={(id) => setSavedIds(toggleSaved(id))}
              onClose={() => setShowSaved(false)}
            />
          )}
        </main>
      )}
      {/* Surprise card overlay */}
      {surpriseActivity && randomReason && (
        <SurpriseCard
          activity={surpriseActivity}
          interestIds={selectedInterests}
          reason={randomReason}
          onDismiss={() => setSurpriseActivity(null)}
        />
      )}
    </>
  );
}
