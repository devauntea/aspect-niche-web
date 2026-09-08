"use client";

import React, { createContext, useContext } from "react";

// Which drawing a hobby mark uses. Every set is a supplied kit, and the choice
// is the user's, kept next to the theme rather than inside it: a theme owns
// colour, type and motion, and someone who wants the paper themes does not
// necessarily want folders. Every set draws every hobby, so switching never
// leaves a gap.
//
// Every pictogram is on the same 24-unit box, which is why one switch can
// repaint the whole app without a single call site changing its viewBox. What
// differs is what sits behind it: nothing for Drawn, Obsidian and Clean's
// hobbies, and a carrier drawn on the kit's own 80-unit box for the rest.
//
// Four of the six take their colour from the artwork rather than the theme:
// Files is the file browser's blue, Retro is brushed metal with a lit screen,
// Paint is pigment assigned per hobby, and Pocket Tech is one silver for
// everything. Recolouring any of them per cluster is what would stop them
// reading as a folder, a handheld, a paint drop and a glass jewel. Obsidian and
// Clean take the theme's hue, so at least two sets stay genuinely independent
// of whichever theme is on.

export type IconSetId =
  | "obsidian"
  | "files"
  | "clean"
  | "retro"
  | "gallery"
  | "pocket";

export type IconSetDefinition = {
  id: IconSetId;
  label: string;
  description: string;
  /** The hobby whose mark makes the best specimen for this set. */
  specimen: string;
};

export const ICON_SETS: IconSetDefinition[] = [
  {
    id: "obsidian",
    label: "Obsidian",
    description: "Outlines with lit vertices",
    specimen: "pottery",
  },
  {
    id: "files",
    label: "Files",
    description: "Folders and paper, like a browser",
    specimen: "pottery",
  },
  {
    id: "clean",
    label: "Clean",
    description: "Flowing curves, and colour on the clusters",
    specimen: "pottery",
  },
  {
    id: "retro",
    label: "Retro",
    description: "Brushed metal, and a lit screen",
    specimen: "pottery",
  },
  {
    id: "gallery",
    label: "Paint",
    description: "Glossy pigment, one colour per hobby",
    specimen: "pottery",
  },
  {
    id: "pocket",
    label: "Pocket Tech",
    description: "Smoked glass and satin silver",
    specimen: "pottery",
  },
];

/**
 * The set a stored value resolves to. `DEFAULT_ICON_SET` is also where every
 * document written before the app had sets lands, and where "drawn" lands now
 * that the hand-drawn set is gone — Obsidian is the closest thing to it, being
 * the one kit that is bare line art in the theme's own hue.
 */
export const DEFAULT_ICON_SET: IconSetId = "obsidian";

export function hydrateIconSet(stored: unknown): IconSetId {
  return ICON_SETS.some((s) => s.id === stored)
    ? (stored as IconSetId)
    : DEFAULT_ICON_SET;
}

// A context of its own rather than reading the store inside every mark. The
// graph draws sixty marks at once and the store's value changes on every
// collect, every checklist tick and every camera-independent state write; this
// one only changes when the set does, so React.memo on the mark keeps holding.
const IconSetContext = createContext<IconSetId>(DEFAULT_ICON_SET);

export function IconSetProvider({
  value,
  children,
}: {
  value: unknown;
  children: React.ReactNode;
}) {
  return (
    <IconSetContext.Provider value={hydrateIconSet(value)}>
      {children}
    </IconSetContext.Provider>
  );
}

export function useIconSet(): IconSetId {
  return useContext(IconSetContext);
}

/**
 * Remembering the choice between visits.
 *
 * The demo has no account, so this is the same functional local storage the
 * theme uses — no consent needed, nothing leaves the browser. Reading is
 * wrapped because a locked-down browser throws on access rather than returning
 * null, and an icon preference is not worth a blank page.
 */
export const ICON_SET_STORAGE_KEY = "aspect-niche-icon-set";

export function storedIconSet(): IconSetId {
  if (typeof window === "undefined") return DEFAULT_ICON_SET;
  try {
    return hydrateIconSet(localStorage.getItem(ICON_SET_STORAGE_KEY));
  } catch {
    return DEFAULT_ICON_SET;
  }
}

export function storeIconSet(id: IconSetId): void {
  try {
    localStorage.setItem(ICON_SET_STORAGE_KEY, id);
  } catch {
    // Private browsing. The choice still applies for this session.
  }
}
