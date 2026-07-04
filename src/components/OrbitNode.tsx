"use client";

// Interest node: the anchor star of its cluster — a larger core, a Space
// Grotesk label, and (while collapsed) a quiet orbit of starlight dots that
// promises what's inside. No pills, no badges: importance = size + glow.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { constellation, motionTokens, nightSky } from "@/lib/theme";
import type { NodeVisualState } from "@/types/graph";

interface OrbitNodeData {
  label: string;
  color: string;
  isExpanded: boolean;
  childCount: number;
  visualState: NodeVisualState;
}

const BOX = 120; // container kept at 120×120 so layout/collision stay stable
const CORE = 22;
const CORE_SELECTED = 26;

// Handles centered on the core (container center = 60, 60)
const CENTER_HANDLE: React.CSSProperties = {
  opacity: 0,
  top: BOX / 2,
  left: BOX / 2,
  transform: "translate(-50%, -50%)",
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  border: "none",
  background: "none",
};

function OrbitNode({ data, selected }: NodeProps) {
  const d = data as unknown as OrbitNodeData;
  const { label, color, isExpanded, childCount } = d;
  const visualState = d.visualState ?? "idle";
  const hovered = visualState === "active" && !selected;

  const core = selected ? CORE_SELECTED : CORE;
  const orbitRadius = 34;
  const dotCount = Math.min(childCount, 6);

  const glow = selected
    ? `0 0 14px ${color}, 0 0 36px color-mix(in srgb, ${color} 67%, transparent), 0 0 64px color-mix(in srgb, ${color} 33%, transparent)`
    : hovered
      ? `0 0 12px color-mix(in srgb, ${color} 93%, transparent), 0 0 30px color-mix(in srgb, ${color} 47%, transparent)`
      : `0 0 10px color-mix(in srgb, ${color} 73%, transparent), 0 0 22px color-mix(in srgb, ${color} 27%, transparent)`;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: BOX,
        height: BOX,
        cursor: "pointer",
        transform: hovered
          ? "scale(var(--hover-scale-major, 1.06))"
          : "scale(1)",
        transition: `transform ${motionTokens.hoverMs}ms ease`,
      }}
    >
      {/* Orbiting starlight dots — only while collapsed */}
      {!isExpanded &&
        Array.from({ length: dotCount }, (_, i) => {
          const duration = 6 + i * 0.9;
          const delay = -(i / dotCount) * duration;
          const isReverse = i % 2 === 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: BOX,
                height: BOX,
                top: 0,
                left: 0,
                animation: `${isReverse ? "orbit-reverse" : "orbit"} ${duration}s linear ${delay}s infinite`,
                ["--orbit-r" as string]: `${orbitRadius}px`,
                ["--orbit-duration" as string]: `${duration}s`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: nightSky.starlight,
                  boxShadow: `0 0 5px ${color}`,
                  transform: "translate(-50%, -50%)",
                  opacity: 0.7,
                }}
              />
            </div>
          );
        })}

      {/* Fine orbital ring — selected only */}
      {selected && (
        <svg
          width={core + 22}
          height={core + 22}
          viewBox={`0 0 ${core + 22} ${core + 22}`}
          className="orbital-ring"
          style={{
            position: "absolute",
            top: BOX / 2 - (core + 22) / 2,
            left: BOX / 2 - (core + 22) / 2,
          }}
          aria-hidden
        >
          <circle
            cx={(core + 22) / 2}
            cy={(core + 22) / 2}
            r={(core + 22) / 2 - 1}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={0.85}
          />
        </svg>
      )}

      {/* Star core */}
      <div
        className="star-core node-breathe"
        style={{
          width: core,
          height: core,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${nightSky.starlight}, ${color} 72%)`,
          boxShadow: glow,
          transition: `box-shadow ${motionTokens.hoverMs}ms ease, width ${motionTokens.hoverMs}ms ease, height ${motionTokens.hoverMs}ms ease`,
        }}
      />

      {/* Label — display voice, always visible */}
      <div
        style={{
          position: "absolute",
          top: BOX / 2 + core / 2 + 8,
          fontFamily: "var(--font-grotesk), sans-serif",
          fontWeight: 600,
          fontSize: 13.5,
          letterSpacing: "0.02em",
          color: constellation.labelText,
          whiteSpace: "nowrap",
          textShadow:
            "0 0 6px var(--color-bg), 0 0 14px var(--color-bg), 0 1px 3px color-mix(in srgb, var(--color-bg) 90%, transparent)",
          userSelect: "none",
        }}
      >
        {label}
      </div>

      <Handle type="source" position={Position.Bottom} style={CENTER_HANDLE} />
      <Handle type="target" position={Position.Top} style={CENTER_HANDLE} />
    </div>
  );
}

export default memo(OrbitNode);
