"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import SurpriseCard from "../components/SurpriseCard";
import GraphCanvas from "../components/GraphCanvas";
import LogoAnimation from "../components/LogoAnimation";
import InterestOnboarding from "../components/InterestOnboarding";
import SavedDrawer from "../components/SavedDrawer";
import { activities, interests } from "../data/activities";
import { nicheContent } from "../data/nicheContent";
import { getResources } from "../data/resources";
import type { Activity, HobbyEdge, HobbyNode } from "@/types/graph";
import QuickFilters, { type ActiveFilters } from "../components/QuickFilters";
import RabbitHolePanel from "../components/RabbitHolePanel";
import {
  IconAppMark,
  IconFitness,
  IconCreative,
  IconOutdoor,
  IconTech,
  IconSocial,
  IconCulinary,
} from "../components/icons";
import { applyForceLayout } from "@/lib/forceLayout";
import { getChecked, saveChecked } from "@/lib/checklistStorage";
import {
  getCustomNiches,
  addCustomNiche,
  removeCustomNiche,
  type CustomNiche,
} from "@/lib/customNiches";

import {
  buildInterestNodes,
  buildActivityNodes,
  buildVisibleEdges,
} from "@/lib/graphUtils";
import { getSaved, toggleSaved, isSaved } from "@/lib/storage";
import NicheCard from "../components/NicheCard";
import QuickCard from "../components/QuickCard";
import DeepDiveCard from "../components/DeepDiveCard";
import {
  getWhyItFits,
  getBeginnerChecklist,
  getSimilarActivities,
} from "@/lib/recommendations";

type Screen = "splash" | "onboarding" | "app";
type CardState = "quick" | "deep" | "niche";

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

const ACCENT_DARK: Record<string, string> = {
  "#D4537E": "#993556",
  "#7F77DD": "#534AB7",
  "#EF9F27": "#854F0B",
  "#1D9E75": "#0F6E56",
  "#378ADD": "#185FA5",
  "#D85A30": "#993C1D",
  "#639922": "#3B6D11",
};

const INTEREST_ICONS: Record<string, React.ReactNode> = {
  fitness: <IconFitness size={28} />,
  creative: <IconCreative size={28} />,
  outdoor: <IconOutdoor size={28} />,
  tech: <IconTech size={28} />,
  social: <IconSocial size={28} />,
  culinary: <IconCulinary size={28} />,
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

export default function Home() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedInterests, setExpandedInterests] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<string[]>(() => getSaved());
  const [showSaved, setShowSaved] = useState(false);
  const [randomReason, setRandomReason] = useState<string | null>(null);
  const [surpriseActivity, setSurpriseActivity] = useState<(typeof activities)[0] | null>(null);
  const [cardState, setCardState] = useState<CardState>("quick");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    environment: [],
    social: [],
    difficulty: [],
    cost: [],
  });
  const [noMatchHint, setNoMatchHint] = useState(false);
  const [showEditHint, setShowEditHint] = useState(() => {
    try {
      return !localStorage.getItem("aspect-niche-hint-shown");
    } catch {
      return false;
    }
  });
  const [checkedActivityId, setCheckedActivityId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [customNiches, setCustomNiches] = useState<CustomNiche[]>(() => getCustomNiches());
  const [creatingNiche, setCreatingNiche] = useState<string | null>(null);
  const [newNodeId, setNewNodeId] = useState<string | null>(null);
  const [swipeHintSeen, setSwipeHintSeen] = useState(() => {
    try {
      return !!localStorage.getItem("an-swipe-hint-seen");
    } catch {
      return false;
    }
  });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);

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
    try {
      localStorage.setItem("aspect-niche-hint-shown", "1");
    } catch {}
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

  const effectiveExpandedInterests = useMemo(() => {
    const filteredIds = new Set(filteredActivityNodes.map((n) => n.id));
    return new Set(
      [...expandedInterests].filter((id) => {
        const interest = interests.find((i) => i.id === id);
        return interest?.activityIds.some((aid) => filteredIds.has(aid));
      }),
    );
  }, [expandedInterests, filteredActivityNodes]);

  const customNodes = useMemo((): HobbyNode[] => {
    return customNiches
      .filter(
        (n) =>
          expandedInterests.has(n.categoryId) &&
          selectedInterests.includes(n.categoryId),
      )
      .map((n) => {
        const pos = interestPosMap[n.categoryId] ?? { x: 300, y: 260 };
        const angle = ((n.createdAt % 1000) / 1000) * Math.PI * 2;
        const dist = 200;
        return {
          id: n.id,
          label: n.label,
          type: "activity" as const,
          data: {
            id: n.id,
            label: n.label,
            description: n.description,
            beginnerTip: n.beginnerTip,
            tags: n.tags,
            source: "ai-generated" as const,
          } as Activity,
          color: "#7F77DD",
          position: {
            x: pos.x + Math.cos(angle) * dist,
            y: pos.y + Math.sin(angle) * dist,
          },
        };
      });
  }, [customNiches, expandedInterests, selectedInterests, interestPosMap]);

  const allNodes = useMemo(
    () => [...interestNodes, ...filteredActivityNodes, ...customNodes],
    [interestNodes, filteredActivityNodes, customNodes],
  );
  const visibleIds = useMemo(() => new Set(allNodes.map((n) => n.id)), [allNodes]);
  const graphEdges = useMemo((): HobbyEdge[] => {
    const base = buildVisibleEdges(visibleIds, selectedInterests);
    const customEdges: HobbyEdge[] = customNiches
      .filter((n) => visibleIds.has(n.id))
      .map((n) => ({
        id: `e-${n.categoryId}-${n.id}`,
        source: n.categoryId,
        target: n.id,
      }));
    return [...base, ...customEdges];
  }, [visibleIds, selectedInterests, customNiches]);

  const layoutNodes = useMemo(
    () =>
      expandedInterests.size > 0
        ? applyForceLayout(allNodes, graphEdges)
        : allNodes,
    [allNodes, graphEdges, expandedInterests],
  );

  // ── Node tap ───────────────────────────────────────────
  const handleSelectNode = useCallback((id: string | null) => {
    if (id === null) {
      setRandomReason(null);
      setSelectedId(null);
      return;
    }
    const isInterest = interests.some((i) => i.id === id);
    setRandomReason(null);
    if (isInterest) {
      setExpandedInterests((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
    setSelectedId(id);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedInterests(new Set());
    setSelectedId(null);
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
      (i) => i.activityIds.includes(pick.id) && selectedInterests.includes(i.id),
    );
    if (parent) setExpandedInterests((prev) => new Set([...prev, parent.id]));
    const reason = getWhyItFits(pick, selectedInterests);
    setRandomReason(reason);
    setSelectedId(pick.id);
    setSurpriseActivity(pick);
  }

  // ── Save / unsave ──────────────────────────────────────
  function handleToggleSave(id: string) {
    setSavedIds(toggleSaved(id));
  }

  // ── Create niche ───────────────────────────────────────
  async function handleCreateNiche(categoryId: string, categoryLabel: string) {
    if (creatingNiche) return;
    const existing = activities.map((a) => a.label);
    setCreatingNiche(categoryId);
    try {
      const res = await fetch("/api/create-niche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, categoryLabel, existingActivities: existing }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as {
        id: string;
        label: string;
        description: string;
        beginnerTip: string;
        difficulty: CustomNiche["tags"]["difficulty"];
        environment: CustomNiche["tags"]["environment"];
        social: CustomNiche["tags"]["social"];
        cost: CustomNiche["tags"]["cost"];
        timeCommitment: CustomNiche["tags"]["timeCommitment"];
        whyItsNiche: string;
      };
      const newNiche: CustomNiche = {
        id: data.id,
        label: data.label,
        description: data.description,
        beginnerTip: data.beginnerTip,
        categoryId,
        categoryLabel,
        tags: {
          difficulty: data.difficulty,
          environment: data.environment,
          social: data.social,
          cost: data.cost,
          timeCommitment: data.timeCommitment,
        },
        whyItsNiche: data.whyItsNiche,
        createdAt: Date.now(),
        source: "ai-generated",
      };
      addCustomNiche(newNiche);
      setCustomNiches(getCustomNiches());
      setExpandedInterests((prev) => new Set([...prev, categoryId]));
      setSelectedId(newNiche.id);
      setNewNodeId(newNiche.id);
      setTimeout(() => setNewNodeId(null), 1000);
    } catch (err) {
      console.error("Create niche failed:", err);
    } finally {
      setCreatingNiche(null);
    }
  }

  // ── Detail data ────────────────────────────────────────
  const detail = useMemo(() => {
    if (!selectedId) return null;
    const activity = activities.find((a) => a.id === selectedId);
    if (activity) return { type: "activity" as const, data: activity };
    const customNiche = customNiches.find((n) => n.id === selectedId);
    if (customNiche) return { type: "custom" as const, data: customNiche };
    const interest = interests.find((i) => i.id === selectedId);
    if (interest) return { type: "interest" as const, data: interest };
    return null;
  }, [selectedId, customNiches]);

  const accentColor = selectedId
    ? (INTEREST_COLORS[selectedId] ?? ACTIVITY_COLORS[selectedId] ?? "#7F77DD")
    : "#7F77DD";
  const accentDark = ACCENT_DARK[accentColor] ?? accentColor;

  const isExpanded = selectedId ? effectiveExpandedInterests.has(selectedId) : false;
  const activityDetail = detail?.type === "activity" ? detail.data : null;
  const customDetail = detail?.type === "custom" ? detail.data : null;

  const checklist = useMemo(
    () => (activityDetail ? getBeginnerChecklist(activityDetail) : []),
    [activityDetail],
  );
  const similarActs = useMemo(
    () =>
      activityDetail ? getSimilarActivities(activityDetail, selectedInterests) : [],
    [activityDetail, selectedInterests],
  );
  const saved = activityDetail ? isSaved(savedIds, activityDetail.id) : false;

  // Update-during-render: reset checklist + card state when activity changes
  if ((activityDetail?.id ?? null) !== checkedActivityId) {
    setCheckedActivityId(activityDetail?.id ?? null);
    setCheckedItems(activityDetail ? getChecked(activityDetail.id) : []);
    setAllDone(false);
    setCardState("quick");
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

  const selectedInterestForNiche = useMemo(() => {
    if (!activityDetail) return null;
    return (
      interests.find(
        (i) =>
          selectedInterests.includes(i.id) &&
          i.activityIds.includes(activityDetail.id),
      ) ?? null
    );
  }, [activityDetail, selectedInterests]);

  const hintText = useMemo(() => {
    if (noMatchHint) return "No activities match — try clearing a filter";
    if (expandedInterests.size === 0) return "Tap an interest to reveal activities";
    if (!selectedId || interests.some((i) => i.id === selectedId))
      return "Tap an activity to explore it";
    return null;
  }, [expandedInterests, selectedId, noMatchHint]);

  // ── Derived resource data ──────────────────────────────
  const activityResources = activityDetail
    ? getResources(activityDetail.id, activityDetail.label)
    : [];
  const youtubeResource = activityResources.find((r) => r.type === "youtube");

  // ── Swipe handlers ─────────────────────────────────────
  const cardStateOrder: CardState[] = ["quick", "deep", "niche"];

  function markSwipeHintSeen() {
    if (!swipeHintSeen) {
      setSwipeHintSeen(true);
      try {
        localStorage.setItem("an-swipe-hint-seen", "1");
      } catch {}
    }
  }

  function advanceCardState() {
    setCardState((prev) => {
      const idx = cardStateOrder.indexOf(prev);
      return cardStateOrder[idx + 1] ?? prev;
    });
    markSwipeHintSeen();
  }

  function retreatCardState() {
    setCardState((prev) => {
      const idx = cardStateOrder.indexOf(prev);
      return cardStateOrder[idx - 1] ?? prev;
    });
    markSwipeHintSeen();
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
        if (dx < 0) advanceCardState();
        else retreatCardState();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [touchStart, swipeHintSeen],
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setMouseStartX(e.clientX);
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (mouseStartX === null) return;
      const dx = e.clientX - mouseStartX;
      setMouseStartX(null);
      if (Math.abs(dx) > 60) {
        if (dx < 0) advanceCardState();
        else retreatCardState();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mouseStartX, swipeHintSeen],
  );

  // ── Tab helpers ────────────────────────────────────────
  const hasNiche = activityDetail ? !!nicheContent[activityDetail.id] : false;

  const tabConfig: { id: CardState; label: string }[] = [
    { id: "quick", label: "Quick" },
    { id: "deep", label: "Deep dive" },
    { id: "niche", label: "◆ Niche" },
  ];

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
                <button
                  onClick={() => setShowSaved(true)}
                  className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white border border-[#E8E4DA] hover:border-[#D3D0C8] transition-colors ml-1 active:scale-95"
                  style={{ minHeight: 44 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 1.5h8a.5.5 0 01.5.5v9L6 8.5 1.5 11V2a.5.5 0 01.5-.5z"
                      stroke="#5A5855"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      fill={savedIds.length > 0 ? "#7F77DD" : "none"}
                    />
                  </svg>
                  <span className="text-[#5A5855]">
                    {savedIds.length > 0 ? `${savedIds.length} saved` : "Saved"}
                  </span>
                </button>

                <div className="relative ml-1">
                  <button
                    onClick={() => {
                      setShowEditHint(false);
                      setScreen("onboarding");
                    }}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium bg-white transition-colors hover:border-[#7F77DD] hover:text-[#7F77DD] active:scale-95"
                    style={{ borderColor: "#E8E4DA", color: "#5A5855", minHeight: 44 }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path
                        d="M7.5 1.5L9.5 3.5L3.5 9.5H1.5V7.5L7.5 1.5Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
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
                      <p className="text-xs text-[#B0ADA8] mt-0.5">{hintText}</p>
                    )}
                  </div>
                  <button
                    onClick={handleRandom}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: "#7F77DD", boxShadow: "0 2px 10px #7F77DD35", minHeight: 44 }}
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
                  newNodeId={newNodeId}
                  onCollapseAll={handleCollapseAll}
                />
              </div>

              {/* Detail panel — custom niche */}
              {detail?.type === "custom" ? (
                <div className="rounded-3xl border border-[#E8E4DA] bg-white p-5 shadow-sm flex flex-col gap-4 overflow-y-auto max-h-[820px]">
                  <h2 className="text-base font-semibold">Details</h2>
                  <div className="h-0.5 rounded-full w-8" style={{ background: "#7F77DD" }} />

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8]">Activity</p>
                      <span
                        className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                        style={{ background: "#7F77DD14", color: "#7F77DD" }}
                      >
                        ✦ AI Created
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight leading-tight">
                      {customDetail!.label}
                    </h3>
                  </div>

                  <p className="text-sm text-[#5A5855] leading-relaxed">{customDetail!.description}</p>

                  <div
                    className="rounded-xl p-3.5 flex flex-col gap-1"
                    style={{ background: "#7F77DD0e", border: "1px solid #7F77DD20" }}
                  >
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#7F77DD" }}>
                      Why it&apos;s niche
                    </p>
                    <p className="text-xs text-[#5A5855] leading-relaxed">{customDetail!.whyItsNiche}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      diffLabel[customDetail!.tags.difficulty],
                      envLabel[customDetail!.tags.environment],
                      costLabel[customDetail!.tags.cost],
                    ]
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                          style={{ background: "#7F77DD12", color: "#7F77DD" }}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FAF8F2" }}>
                    <span className="text-base flex-shrink-0">💡</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-1">First step</p>
                      <p className="text-xs text-[#1A1916] leading-relaxed">{customDetail!.beginnerTip}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8]">Category</p>
                    <span className="text-xs font-medium" style={{ color: "#7F77DD" }}>
                      {customDetail!.categoryLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      removeCustomNiche(customDetail!.id);
                      setCustomNiches(getCustomNiches());
                      setSelectedId(null);
                    }}
                    className="text-xs text-[#B0ADA8] hover:text-red-400 transition-colors mt-auto text-center active:scale-95"
                  >
                    Remove from graph
                  </button>
                </div>
              ) : detail?.type === "interest" ? (
                /* ── Interest detail panel ── */
                <div className="rounded-3xl border border-[#E8E4DA] bg-white p-5 shadow-sm flex flex-col gap-4 overflow-y-auto max-h-[820px]">
                  <h2 className="text-base font-semibold">Details</h2>
                  <div className="flex flex-col gap-4">
                    {/* Icon + name */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${accentColor}12` }}
                      >
                        {INTEREST_ICONS[detail.data.id] ?? (
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ background: accentColor }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#B0ADA8] mb-0.5">
                          Interest
                        </p>
                        <h3 className="text-xl font-semibold tracking-tight">{detail.data.label}</h3>
                      </div>
                    </div>

                    {/* Activity count */}
                    <p className="text-sm text-[#5A5855]">
                      <span className="font-semibold" style={{ color: accentColor }}>
                        {(detail.data as (typeof interests)[0]).activityIds.length}
                      </span>{" "}
                      activities in this cluster
                    </p>

                    {/* Activity pills */}
                    {isExpanded && (
                      <div className="flex flex-wrap gap-1.5">
                        {(detail.data as (typeof interests)[0]).activityIds.map((id) => {
                          const act = activities.find((a) => a.id === id);
                          return act ? (
                            <button
                              key={id}
                              onClick={() => setSelectedId(id)}
                              className="rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                              style={{
                                background: `${accentColor}14`,
                                color: accentColor,
                                minHeight: 36,
                              }}
                            >
                              {act.label}
                            </button>
                          ) : null;
                        })}
                      </div>
                    )}

                    {!isExpanded && (
                      <p className="text-xs text-[#B0ADA8]">
                        Tap the node in the graph to reveal activities.
                      </p>
                    )}

                    {/* Expand/collapse button */}
                    <button
                      onClick={() => handleSelectNode(detail.data.id)}
                      className="rounded-2xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ background: accentColor, minHeight: 44 }}
                    >
                      {isExpanded ? "Collapse activities" : "Show activities →"}
                    </button>
                  </div>
                </div>
              ) : detail?.type !== "activity" ? (
                /* ── Empty state ── */
                <div className="rounded-3xl border border-[#E8E4DA] bg-white p-5 shadow-sm flex flex-col overflow-y-auto max-h-[820px]">
                  <h2 className="text-base font-semibold mb-5">Details</h2>
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
                </div>
              ) : null}

              {/* ── Activity: three-state card ── */}
              {detail?.type === "activity" && activityDetail && (
                <div
                  className="rounded-3xl border border-[#E8E4DA] bg-white shadow-sm flex flex-col"
                  style={{
                    maxHeight: cardState === "quick" ? 380 : 820,
                    height: cardState !== "quick" ? 820 : undefined,
                    transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "hidden",
                  }}
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-2 flex-shrink-0">
                    <h2 className="text-base font-semibold">Details</h2>
                    <button
                      onClick={() => handleToggleSave(activityDetail.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                      style={{
                        background: saved ? `${accentColor}18` : "#F0EDE6",
                        border: saved ? `1.5px solid ${accentColor}40` : "1.5px solid transparent",
                        minWidth: 36,
                        minHeight: 36,
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

                  {/* Tab bar */}
                  <div className="flex gap-1 px-5 pb-2 flex-shrink-0">
                    {tabConfig.map(({ id, label }) => {
                      const active = cardState === id;
                      const disabled = id === "niche" && !hasNiche;
                      return (
                        <button
                          key={id}
                          onClick={() => !disabled && setCardState(id)}
                          disabled={disabled}
                          className="transition-all rounded-full"
                          style={{
                            minHeight: 44,
                            padding: "8px 14px",
                            background: active ? accentColor : "transparent",
                            color: active
                              ? "white"
                              : disabled
                                ? "#D3D0C8"
                                : "#9A9690",
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            border: "none",
                            cursor: disabled ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Content area with 3D flip for niche */}
                  <div
                    className="flex-1 overflow-hidden"
                    style={{ perspective: "1000px", position: "relative", minHeight: 0 }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                  >
                    <div
                      style={{
                        transformStyle: "preserve-3d",
                        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: cardState === "niche" ? "rotateY(180deg)" : "none",
                        position: "absolute",
                        inset: 0,
                      }}
                    >
                      {/* ── Front face: Quick or Deep ── */}
                      <div
                        className="card-face-scroll"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          position: "absolute",
                          inset: 0,
                          overflowY: cardState === "quick" ? "hidden" : "auto",
                          paddingTop: 8,
                        }}
                      >
                        {cardState === "quick" ? (
                          <QuickCard
                            activity={activityDetail}
                            accentColor={accentColor}
                            categoryLabel={selectedInterestForNiche?.label}
                            onFindNearby={() =>
                              window.open(
                                `https://www.google.com/maps/search/${encodeURIComponent(activityDetail.label + " near me")}`,
                                "_blank",
                              )
                            }
                            youtubeResource={youtubeResource}
                            swipeHintSeen={swipeHintSeen}
                          />
                        ) : (
                          <DeepDiveCard
                            activity={activityDetail}
                            accentColor={accentColor}
                            checklist={checklist}
                            checkedItems={checkedItems}
                            onToggleCheck={toggleChecked}
                            allDone={allDone}
                            resources={activityResources}
                            similarActivities={similarActs}
                            onSelectActivity={(id) => {
                              setSelectedId(id);
                              setRandomReason(null);
                            }}
                            randomReason={randomReason}
                            isSaved={saved}
                            onToggleSave={() => handleToggleSave(activityDetail.id)}
                            onFindNearby={() =>
                              window.open(
                                `https://www.google.com/maps/search/${encodeURIComponent(activityDetail.label + " near me")}`,
                                "_blank",
                              )
                            }
                          />
                        )}
                      </div>

                      {/* ── Back face: Niche ── */}
                      <div
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          position: "absolute",
                          inset: 0,
                          overflowY: "auto",
                        }}
                      >
                        <div className="p-3">
                          {cardState === "niche" && hasNiche ? (
                            <NicheCard
                              activity={activityDetail}
                              accentColor={accentColor}
                              accentDark={accentDark}
                              nicheContent={nicheContent[activityDetail.id]}
                              onOpenRabbitHole={() =>
                                document
                                  .getElementById("rabbit-hole-panel")
                                  ?.scrollIntoView({ behavior: "smooth" })
                              }
                            />
                          ) : !hasNiche ? (
                            <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
                              <p className="text-sm font-medium text-[#5A5855]">
                                No niche content yet
                              </p>
                              <p className="text-xs text-[#B0ADA8] leading-relaxed max-w-[200px]">
                                Use the AI panel below to explore deeper angles for this activity.
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Rabbit hole panel — activity only */}
            {detail?.type === "activity" && activityDetail && (
              <div className="mt-4" id="rabbit-hole-panel">
                <RabbitHolePanel
                  key={activityDetail.id}
                  activityId={activityDetail.id}
                  activityLabel={activityDetail.label}
                  accentColor={accentColor}
                  tags={activityDetail.tags as Record<string, string>}
                  onCreateNiche={() =>
                    selectedInterestForNiche
                      ? handleCreateNiche(
                          selectedInterestForNiche.id,
                          selectedInterestForNiche.label,
                        )
                      : undefined
                  }
                  isCreating={
                    !!selectedInterestForNiche &&
                    creatingNiche === selectedInterestForNiche.id
                  }
                />
              </div>
            )}
          </div>

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
