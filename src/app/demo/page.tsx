"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import SurpriseCard from "../../components/SurpriseCard";
import GraphCanvas from "../../components/GraphCanvas";
import LogoAnimation from "../../components/LogoAnimation";
import InterestOnboarding from "../../components/InterestOnboarding";
import SavedDrawer from "../../components/SavedDrawer";
import SkyIgnition from "../../components/SkyIgnition";
import { activities, interests } from "../../data/activities";
import { nicheContent } from "../../data/nicheContent";
import { getResources } from "../../data/resources";
import type { Activity, HobbyEdge, HobbyNode } from "@/types/graph";
import QuickFilters, {
  type ActiveFilters,
} from "../../components/QuickFilters";
import BrandMark from "../../components/BrandMark";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import MemoryWalk from "../../components/MemoryWalk";
import { collectedGraph, focusGraph, type GraphView } from "@/lib/flipGraph";
import {
  samplePhotos,
  sampleNotes,
  hasSampleProgress,
} from "@/data/sampleProgress";
import {
  IconFitness,
  IconCreative,
  IconOutdoor,
  IconTech,
  IconSocial,
  IconCulinary,
} from "../../components/icons";
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
import { mapsSearchUrl } from "@/lib/maps";
import { darkenAccent, motionTokens, nightSky, starHues } from "@/lib/theme";
import { Button, PageStarField } from "../../components/ui";
import { useTheme } from "@/lib/useTheme";
import NicheCard from "../../components/NicheCard";
import QuickCard from "../../components/QuickCard";
import DeepDiveCard from "../../components/DeepDiveCard";
import {
  getWhyItFits,
  getBeginnerChecklist,
  getSimilarActivities,
} from "@/lib/recommendations";

// Heavy, below-the-fold panels load on demand
const RabbitHolePanel = dynamic(
  () => import("../../components/RabbitHolePanel"),
  { ssr: false },
);
const PlanADateMode = dynamic(
  () => import("../../components/PlanADate/PlanADateMode"),
  { ssr: false },
);

type Screen = "splash" | "onboarding" | "ignition" | "app";
type CardState = "quick" | "deep" | "niche";

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
  // Lags selectedId on deselect so the dock can slide out before unmounting
  const [displayedId, setDisplayedId] = useState<string | null>(null);
  const [expandedInterests, setExpandedInterests] = useState<Set<string>>(
    new Set(),
  );
  const [savedIds, setSavedIds] = useState<string[]>(() => getSaved());
  const [showSaved, setShowSaved] = useState(false);
  // Which side of the graph is showing. Discovery is what there is; collected
  // is what you have; focus is one collected hobby with its own record around
  // it. See lib/flipGraph — the flip is a change of data, not a second canvas.
  const [view, setView] = useState<GraphView>({ kind: "discovery" });
  const [walkOpen, setWalkOpen] = useState(false);
  const [randomReason, setRandomReason] = useState<string | null>(null);
  const [surpriseActivity, setSurpriseActivity] = useState<
    (typeof activities)[0] | null
  >(null);
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
  const [checkedActivityId, setCheckedActivityId] = useState<string | null>(
    null,
  );
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [customNiches, setCustomNiches] = useState<CustomNiche[]>(() =>
    getCustomNiches(),
  );
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
  const [dateMode, setDateMode] = useState(false);
  const { theme } = useTheme();
  // The sky-ignition moment plays once per session, not on every edit
  const [seenIgnition, setSeenIgnition] = useState(false);
  const [nicheError, setNicheError] = useState<string | null>(null);

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
    if (!seenIgnition) {
      setSeenIgnition(true);
      setScreen("ignition");
    } else {
      setScreen("app");
    }
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
      if (environment.length > 0 && !environment.includes(a.tags.environment))
        return false;
      if (social.length > 0 && !social.includes(a.tags.social)) return false;
      if (difficulty.length > 0 && !difficulty.includes(a.tags.difficulty))
        return false;
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
          color: nightSky.violetGlow,
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
  const visibleIds = useMemo(
    () => new Set(allNodes.map((n) => n.id)),
    [allNodes],
  );
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

  const discoveryNodes = useMemo(
    () =>
      expandedInterests.size > 0
        ? applyForceLayout(allNodes, graphEdges)
        : allNodes,
    [allNodes, graphEdges, expandedInterests],
  );

  // The flipped side builds its own node and edge lists from the collection.
  // Nothing here is invented: collected keeps an edge only where both ends are
  // collected, and focus links the hobby to each entry and never entries to
  // each other.
  const flipped = useMemo(() => {
    if (view.kind === "collected") return collectedGraph(savedIds);
    if (view.kind === "focus")
      return focusGraph(
        view.hobbyId,
        samplePhotos(view.hobbyId),
        sampleNotes(view.hobbyId),
      );
    return null;
  }, [view, savedIds]);

  const layoutNodes = flipped ? flipped.nodes : discoveryNodes;
  const visibleEdges = flipped ? flipped.edges : graphEdges;

  // ── Node tap ───────────────────────────────────────────
  const handleSelectNode = useCallback((id: string | null) => {
    // On the flipped side a tap means "open this hobby's record", not
    // "expand this cluster" — there are no clusters over there.
    if (view.kind === "collected" && id) {
      setSelectedId(null);
      setView({ kind: "focus", hobbyId: id });
      return;
    }
    // In focus, tapping the hobby itself goes back; tapping an entry selects
    // it so the detail can show the photo or the note in full.
    if (view.kind === "focus") {
      if (id === view.hobbyId) {
        setSelectedId(null);
        setView({ kind: "collected" });
        return;
      }
      setSelectedId(id);
      return;
    }
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
  }, [view]);

  const handleCollapseAll = useCallback(() => {
    setExpandedInterests(new Set());
    setSelectedId(null);
  }, []);

  // ── Escape key closes overlay ──────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedId) handleSelectNode(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, handleSelectNode]);

  // ── Lock background scroll while a full-screen overlay is open ──
  // (Node selection no longer locks scroll — the dock is not an overlay.)
  useEffect(() => {
    document.body.style.overflow = surpriseActivity ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [surpriseActivity]);

  // ── Dock open/close choreography ───────────────────────
  // Open/switch syncs during render; clearing waits for the slide-out.
  if (selectedId && selectedId !== displayedId) {
    setDisplayedId(selectedId);
  }
  useEffect(() => {
    if (selectedId) return;
    const t = setTimeout(
      () => setDisplayedId(null),
      motionTokens.cardDurationMs,
    );
    return () => clearTimeout(t);
  }, [selectedId]);

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
        if (environment.length > 0 && !environment.includes(a.tags.environment))
          return false;
        if (social.length > 0 && !social.includes(a.tags.social)) return false;
        if (difficulty.length > 0 && !difficulty.includes(a.tags.difficulty))
          return false;
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
        body: JSON.stringify({
          categoryId,
          categoryLabel,
          existingActivities: existing,
        }),
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
      setNicheError(
        "Couldn't create a new niche — the AI service didn't answer. Try again in a moment.",
      );
      setTimeout(() => setNicheError(null), 6000);
    } finally {
      setCreatingNiche(null);
    }
  }

  // ── Detail data (derives from displayedId so content persists
  //    through the dock's slide-out) ────────────────────────
  const detail = useMemo(() => {
    if (!displayedId) return null;
    const activity = activities.find((a) => a.id === displayedId);
    if (activity) return { type: "activity" as const, data: activity };
    const customNiche = customNiches.find((n) => n.id === displayedId);
    if (customNiche) return { type: "custom" as const, data: customNiche };
    const interest = interests.find((i) => i.id === displayedId);
    if (interest) return { type: "interest" as const, data: interest };
    return null;
  }, [displayedId, customNiches]);

  const accentColor = useMemo(() => {
    if (!displayedId) return nightSky.violetGlow;
    if (starHues[displayedId]) return starHues[displayedId];
    const parent = interests.find((i) => i.activityIds.includes(displayedId));
    return parent
      ? (starHues[parent.id] ?? nightSky.violetGlow)
      : nightSky.violetGlow;
  }, [displayedId]);
  const accentDark = darkenAccent(accentColor);

  const isExpanded = displayedId
    ? effectiveExpandedInterests.has(displayedId)
    : false;
  const activityDetail = detail?.type === "activity" ? detail.data : null;
  const customDetail = detail?.type === "custom" ? detail.data : null;

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
    if (expandedInterests.size === 0)
      return "Tap an interest to reveal activities";
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
      {screen === "ignition" && (
        <SkyIgnition
          interestIds={selectedInterests}
          onComplete={() => setScreen("app")}
        />
      )}
      {screen === "app" && (
        <main className="min-h-screen bg-space-950 text-starlight">
          <h1 className="sr-only">Aspect Niche — your hobby sky</h1>
          {/* Fixed page star field — chrome floats over the night sky */}
          <PageStarField />
          {/* Header — slim, translucent, blurred over the star field */}
          <header
            className="sticky top-0 z-40 border-b"
            style={{
              background:
                "color-mix(in srgb, var(--color-bg) 72%, transparent)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: nightSky.space800,
            }}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2.5">
              <button
                onClick={() => setScreen("onboarding")}
                className="flex items-center gap-2"
              >
                <BrandMark
                  size={22}
                  variant={theme.logoVariant === "mono" ? "mono" : "night"}
                  className="text-starlight"
                />
                <span
                  className="hidden sm:inline text-lg font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
                >
                  aspect<span className="text-violet-glow">·niche</span>
                </span>
              </button>
              <div className="flex items-center gap-2">
                {selectedInterests.map((id) => {
                  const color = starHues[id] ?? nightSky.violetGlow;
                  return (
                    <span
                      key={id}
                      className="hidden md:inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        background: `color-mix(in srgb, ${color} 8%, transparent)`,
                        color,
                      }}
                    >
                      {interests.find((i) => i.id === id)?.label}
                    </span>
                  );
                })}
                {/* Plan a date — its own warm theme signals the mode switch */}
                <button
                  onClick={() => setDateMode(true)}
                  aria-label="Plan a date"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ml-1 active:scale-95 hover:opacity-90"
                  style={{
                    minHeight: 44,
                    background: "linear-gradient(135deg, #E85D8A, #B03A62)",
                    color: "white",
                    boxShadow: "0 2px 12px rgba(232,93,138,0.4)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 10.5C3.2 8.4 1 6.6 1 4.4 1 2.9 2.2 1.8 3.6 1.8c.9 0 1.8.5 2.4 1.3.6-.8 1.5-1.3 2.4-1.3C9.8 1.8 11 2.9 11 4.4c0 2.2-2.2 4-5 6.1z"
                      fill="white"
                    />
                  </svg>
                  <span className="hidden sm:inline">Plan a date</span>
                </button>
                <button
                  onClick={() => setShowSaved(true)}
                  aria-label={
                    savedIds.length > 0
                      ? `${savedIds.length} saved activities`
                      : "Saved activities"
                  }
                  className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-space-900 border border-space-800 hover:border-violet-glow/40 transition-colors ml-1 active:scale-95"
                  style={{ minHeight: 44 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 1.5h8a.5.5 0 01.5.5v9L6 8.5 1.5 11V2a.5.5 0 01.5-.5z"
                      stroke={nightSky.dust}
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      fill={savedIds.length > 0 ? nightSky.violetGlow : "none"}
                    />
                  </svg>
                  <span className="text-dust hidden sm:inline">
                    {savedIds.length > 0 ? `${savedIds.length} saved` : "Saved"}
                  </span>
                </button>

                <div className="relative ml-1">
                  <button
                    onClick={() => {
                      setShowEditHint(false);
                      setScreen("onboarding");
                    }}
                    aria-label="Edit interests"

                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium bg-space-900 transition-colors hover:border-violet-glow hover:text-violet-glow active:scale-95"
                    style={{
                      borderColor: nightSky.space800,
                      color: nightSky.dust,
                      minHeight: 44,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path
                        d="M7.5 1.5L9.5 3.5L3.5 9.5H1.5V7.5L7.5 1.5Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="hidden sm:inline">Edit interests</span>
                  </button>
                  {/* Flip. Absent, not disabled, on an empty collection —
                      there is nothing on the other side to turn over to, and
                      the empty collected graph is the only answer it could
                      give. Same rule as the app. */}
                  {savedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        setView((v) =>
                          v.kind === "discovery"
                            ? { kind: "collected" }
                            : { kind: "discovery" },
                        );
                      }}
                      aria-pressed={view.kind !== "discovery"}
                      className="demo-flip-btn"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M3.3 7.1C6.9 .7 17.2 .7 20.7 7.1M17.1 6.6L20.7 7.1L21.1 3.5M20.7 16.9C17.1 23.3 6.8 23.3 3.3 16.9M6.9 17.4L3.3 16.9L2.9 20.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="hidden sm:inline">
                        {view.kind === "discovery" ? "Collected" : "Discovery"}
                      </span>
                    </button>
                  )}
                  {view.kind !== "discovery" && (
                    <button
                      type="button"
                      onClick={() => setWalkOpen(true)}
                      className="demo-flip-btn"
                    >
                      <span>Memory walk</span>
                    </button>
                  )}
                  {showEditHint && (
                    <div
                      className="absolute right-full top-1/2 -translate-y-1/2 mr-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium pointer-events-none z-50"
                      style={{
                        background: nightSky.space800,
                        color: nightSky.starlight,
                      }}
                    >
                      ← Change your interests here
                    </div>
                  )}
                </div>

                <ThemeSwitcher />

                {/* Random Activity — the alpha-star action. While a detail
                    panel is open it holds the alpha primary instead, so the
                    reserve rule (one per screen) always holds. */}
                <Button
                  variant={selectedId ? "violet" : "alpha"}
                  onClick={handleRandom}
                >
                  Surprise me
                </Button>
              </div>
            </div>
          </header>

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-5 py-5">
            {/* Quick filters */}
            <div className="mb-4 min-w-0">
              <QuickFilters
                activeFilters={activeFilters}
                onToggle={toggleFilter}
                onClear={clearFilters}
              />
            </div>

            {/* Graph + detail dock — the canvas reflows into the remaining
                width when the dock opens; the card never overlays the graph */}
            <section className="flex-1 flex items-stretch min-w-0">
              <div className="flex-1 min-w-0 rounded-3xl border border-space-800 bg-space-900 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className="text-base font-semibold"
                      style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
                    >
                      Explore
                    </h2>
                    {hintText && (
                      <p className="text-xs text-dust mt-0.5">{hintText}</p>
                    )}
                  </div>
                </div>
                <GraphCanvas
                  nodes={layoutNodes}
                  edges={visibleEdges}
                  selectedId={selectedId}
                  expandedInterests={effectiveExpandedInterests}
                  onSelectNode={handleSelectNode}
                  newNodeId={newNodeId}
                  onCollapseAll={handleCollapseAll}
                />
              </div>

              {/* ── Detail dock — docked side panel (bottom sheet on
                  narrow screens). The graph reacts first, then the card
                  slides in with the canvas reflowing beside it. ── */}
              <aside
                className={`detail-dock ${selectedId && detail ? "is-open" : ""}`}
                style={
                  {
                    "--dock-delay": `${motionTokens.cardDelayMs}ms`,
                    "--dock-duration": `${motionTokens.cardDurationMs}ms`,
                    "--dock-ease": motionTokens.springEase,
                  } as React.CSSProperties
                }
                aria-hidden={!(selectedId && detail)}
              >
                <div className="detail-dock-inner bg-space-900 md:bg-transparent rounded-t-3xl md:rounded-none">
                  {detail && (
                    <div
                      className="card-face-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:p-0"
                      style={{
                        overscrollBehavior: "contain",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      <div className="w-full flex-shrink-0 bg-space-900 md:border md:border-space-800 rounded-3xl md:shadow-sm flex flex-col overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-2 flex-shrink-0">
                          <h2 className="text-base font-semibold">Details</h2>
                          <div className="flex items-center gap-1.5">
                            {/* Save button (activities only) */}
                            {detail.type === "activity" && activityDetail && (
                              <button
                                onClick={() =>
                                  handleToggleSave(activityDetail.id)
                                }
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                                style={{
                                  background: saved
                                    ? `color-mix(in srgb, ${accentColor} 9%, transparent)`
                                    : nightSky.space800,
                                  border: saved
                                    ? `1.5px solid color-mix(in srgb, ${accentColor} 25%, transparent)`
                                    : "1.5px solid transparent",
                                }}
                                title={
                                  saved ? "Remove from saved" : "Save activity"
                                }
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M3 2h10a.5.5 0 01.5.5v12L8 11.5 2.5 14.5V2.5A.5.5 0 013 2z"
                                    fill={saved ? accentColor : "none"}
                                    stroke={saved ? accentColor : nightSky.dust}
                                    strokeWidth="1.3"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                            {/* Close button */}
                            <button
                              onClick={() => handleSelectNode(null)}
                              className="w-9 h-9 rounded-full flex items-center justify-center text-dust hover:bg-space-800 transition-colors active:scale-95"
                              title="Close"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                              >
                                <path
                                  d="M2 2l10 10M12 2L2 12"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* ── Activity detail: tab bar + cards ── */}
                        {detail.type === "activity" && activityDetail && (
                          <>
                            {/* Tab bar */}
                            <div className="flex gap-1 px-5 pb-2 flex-shrink-0">
                              {tabConfig.map(({ id, label }) => {
                                const active = cardState === id;
                                const disabled = id === "niche" && !hasNiche;
                                return (
                                  <button
                                    key={id}
                                    onClick={() =>
                                      !disabled && setCardState(id)
                                    }
                                    disabled={disabled}
                                    className="transition-all rounded-full"
                                    style={{
                                      minHeight: 44,
                                      padding: "8px 14px",
                                      background: active
                                        ? accentColor
                                        : "transparent",
                                      color: active
                                        ? "white"
                                        : disabled
                                          ? nightSky.violetGlow
                                          : nightSky.dust,
                                      fontSize: 13,
                                      fontWeight: active ? 600 : 400,
                                      border: "none",
                                      cursor: disabled
                                        ? "not-allowed"
                                        : "pointer",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Card content — rendered directly. Quick/Niche hug their
                    content height; Deep dive grows and the scroll stack handles
                    overflow. */}
                            <div
                              onTouchStart={handleTouchStart}
                              onTouchEnd={handleTouchEnd}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                            >
                              {cardState === "quick" && (
                                <QuickCard
                                  activity={activityDetail}
                                  accentColor={accentColor}
                                  categoryLabel={
                                    selectedInterestForNiche?.label
                                  }
                                  onFindNearby={() =>
                                    window.open(
                                      mapsSearchUrl(activityDetail.label),
                                      "_blank",
                                    )
                                  }
                                  youtubeResource={youtubeResource}
                                  swipeHintSeen={swipeHintSeen}
                                />
                              )}

                              {cardState === "deep" && (
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
                                  onToggleSave={() =>
                                    handleToggleSave(activityDetail.id)
                                  }
                                  onFindNearby={() =>
                                    window.open(
                                      mapsSearchUrl(activityDetail.label),
                                      "_blank",
                                    )
                                  }
                                />
                              )}

                              {cardState === "niche" && (
                                <div className="p-3">
                                  {hasNiche ? (
                                    <NicheCard
                                      activity={activityDetail}
                                      accentColor={accentColor}
                                      accentDark={accentDark}
                                      nicheContent={
                                        nicheContent[activityDetail.id]
                                      }
                                      onOpenRabbitHole={() =>
                                        document
                                          .getElementById("rabbit-hole-panel")
                                          ?.scrollIntoView({
                                            behavior: "smooth",
                                          })
                                      }
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
                                      <p className="text-sm font-medium text-dust">
                                        No niche content yet
                                      </p>
                                      <p className="text-xs text-dust leading-relaxed max-w-[200px]">
                                        Use the AI panel below to explore deeper
                                        angles for this activity.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* ── Interest detail ── */}
                        {detail.type === "interest" && (
                          <div className="px-5 pb-5 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: `color-mix(in srgb, ${accentColor} 7%, transparent)`,
                                }}
                              >
                                {INTEREST_ICONS[detail.data.id] ?? (
                                  <div
                                    className="w-6 h-6 rounded-full"
                                    style={{ background: accentColor }}
                                  />
                                )}
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-dust mb-0.5">
                                  Interest
                                </p>
                                <h3 className="text-xl font-semibold tracking-tight">
                                  {detail.data.label}
                                </h3>
                              </div>
                            </div>

                            <p className="text-sm text-dust">
                              <span
                                className="font-semibold"
                                style={{ color: accentColor }}
                              >
                                {
                                  (detail.data as (typeof interests)[0])
                                    .activityIds.length
                                }
                              </span>{" "}
                              activities in this cluster
                            </p>

                            {isExpanded && (
                              <div className="flex flex-wrap gap-1.5">
                                {(
                                  detail.data as (typeof interests)[0]
                                ).activityIds.map((id) => {
                                  const act = activities.find(
                                    (a) => a.id === id,
                                  );
                                  return act ? (
                                    <button
                                      key={id}
                                      onClick={() => setSelectedId(id)}
                                      className="rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                                      style={{
                                        background: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
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
                              <p className="text-xs text-dust">
                                Tap the node in the graph to reveal activities.
                              </p>
                            )}

                            <button
                              onClick={() => handleSelectNode(detail.data.id)}
                              className="rounded-2xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                              style={{ background: accentColor, minHeight: 44 }}
                            >
                              {isExpanded
                                ? "Collapse activities"
                                : "Show activities →"}
                            </button>
                          </div>
                        )}

                        {/* ── Custom niche detail ── */}
                        {detail.type === "custom" && customDetail && (
                          <div className="px-5 pb-5 flex flex-col gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] uppercase tracking-widest text-dust">
                                  Activity
                                </p>
                                <span
                                  className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                                  style={{
                                    background: `color-mix(in srgb, ${nightSky.violetGlow} 8%, transparent)`,
                                    color: nightSky.violetGlow,
                                  }}
                                >
                                  ✦ AI Created
                                </span>
                              </div>
                              <h3 className="text-2xl font-semibold tracking-tight leading-tight">
                                {customDetail.label}
                              </h3>
                            </div>

                            <p className="text-sm text-dust leading-relaxed">
                              {customDetail.description}
                            </p>

                            <div
                              className="rounded-xl p-3.5 flex flex-col gap-1"
                              style={{
                                background: `color-mix(in srgb, ${nightSky.violetGlow} 5%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${nightSky.violetGlow} 13%, transparent)`,
                              }}
                            >
                              <p
                                className="text-[10px] uppercase tracking-widest font-semibold"
                                style={{ color: nightSky.violetGlow }}
                              >
                                Why it&apos;s niche
                              </p>
                              <p className="text-xs text-dust leading-relaxed">
                                {customDetail.whyItsNiche}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {[
                                diffLabel[customDetail.tags.difficulty],
                                envLabel[customDetail.tags.environment],
                                costLabel[customDetail.tags.cost],
                              ]
                                .filter(Boolean)
                                .map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                                    style={{
                                      background: `color-mix(in srgb, ${nightSky.violetGlow} 7%, transparent)`,
                                      color: nightSky.violetGlow,
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>

                            <div
                              className="rounded-xl p-3.5 flex gap-3"
                              style={{ background: nightSky.space950 }}
                            >
                              <span className="text-base flex-shrink-0">
                                💡
                              </span>
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-dust mb-1">
                                  First step
                                </p>
                                <p className="text-xs text-starlight leading-relaxed">
                                  {customDetail.beginnerTip}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <p className="text-[10px] uppercase tracking-widest text-dust">
                                Category
                              </p>
                              <span
                                className="text-xs font-medium"
                                style={{ color: nightSky.violetGlow }}
                              >
                                {customDetail.categoryLabel}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                removeCustomNiche(customDetail.id);
                                setCustomNiches(getCustomNiches());
                                setSelectedId(null);
                              }}
                              className="text-xs text-dust hover:text-red-400 transition-colors mt-2 text-center active:scale-95"
                            >
                              Remove from graph
                            </button>
                          </div>
                        )}
                      </div>

                      {nicheError && (
                        <div
                          role="alert"
                          style={{
                            borderRadius: 10,
                            padding: "10px 14px",
                            background:
                              "color-mix(in srgb, var(--color-danger-t) 10%, transparent)",
                            border: `1px solid color-mix(in srgb, var(--color-danger-t) 40%, transparent)`,
                            color: nightSky.danger,
                            fontSize: 12,
                            lineHeight: 1.5,
                          }}
                        >
                          {nicheError}
                        </div>
                      )}

                      {/* Rabbit hole — activities only, scrolls with the card above */}
                      {detail.type === "activity" && activityDetail && (
                        <div id="rabbit-hole-panel" className="flex-shrink-0">
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
                  )}
                </div>
              </aside>
            </section>
          </div>

            {walkOpen && (
              <MemoryWalk
                collected={savedIds}
                photos={Object.fromEntries(
                  savedIds.map((id) => [id, samplePhotos(id)]),
                )}
                notes={Object.fromEntries(
                  savedIds.map((id) => [id, sampleNotes(id)]),
                )}
                labels={Object.fromEntries(
                  activities.map((a) => [a.id, a.label]),
                )}
                initialScope={
                  view.kind === "focus"
                    ? { kind: "hobby", hobbyId: view.hobbyId }
                    : undefined
                }
                onClose={() => setWalkOpen(false)}
              />
            )}

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
          onAgain={handleRandom}
        />
      )}

      {dateMode && <PlanADateMode onExit={() => setDateMode(false)} />}
    </>
  );
}
