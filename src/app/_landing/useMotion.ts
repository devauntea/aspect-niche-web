"use client";

import { createContext, useContext } from "react";

// Decorative motion is one decision for the whole page.
//
// Two things can turn it off: the OS reduced-motion preference, and the pause
// control in the corner. Both land here so a component never has to ask twice,
// and so "paused" means the same thing to the hero parallax, the theme wave and
// the Memory Walk timer.
//
// Reduced motion is the initial value rather than a hard override: someone who
// has it on can still start a journey deliberately, they just do not get a
// camera flying at them to do it.

export type MotionState = {
  paused: boolean;
  setPaused: (next: boolean) => void;
};

export const MotionContext = createContext<MotionState>({
  paused: false,
  setPaused: () => {},
});

export function useMotion(): MotionState {
  return useContext(MotionContext);
}
