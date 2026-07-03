"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motionTokens } from "@/lib/theme";
import type { NodeVisualState } from "@/types/graph";

interface OrbitNodeData {
  label: string;
  color: string;
  isExpanded: boolean;
  childCount: number;
  childColors: string[];
  visualState: NodeVisualState;
}

// Handles centered on the pill (center of the 120×120 container = 60, 60)
const CENTER_HANDLE: React.CSSProperties = {
  opacity: 0,
  top: 60,
  left: 60,
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
  const { label, color, isExpanded, childCount, childColors } = d;
  const visualState = d.visualState ?? "idle";
  const hovered = visualState === "active" && !selected;

  const orbitRadius = 38;
  const dotCount = Math.min(childCount, 6);
  const dotColors = childColors.slice(0, dotCount);

  // Soft glow at rest; halo blooms on hover, unmistakable ring when selected
  const glow = selected
    ? `0 0 0 4px ${color}38, 0 0 36px ${color}AA, 0 4px 20px ${color}70`
    : hovered
      ? `0 0 30px ${color}99, 0 4px 18px ${color}60`
      : `0 0 18px ${color}55, 0 4px 14px ${color}40`;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 120,
        height: 120,
      }}
    >
      {/* Orbiting dots — only when collapsed */}
      {!isExpanded &&
        dotColors.map((dotColor, i) => {
          const duration = 5 + i * 0.7;
          const delay = -(i / dotCount) * duration;
          const isReverse = i % 2 === 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 120,
                height: 120,
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
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: dotColor,
                  boxShadow: `0 0 6px ${dotColor}`,
                  transform: "translate(-50%, -50%)",
                  opacity: 0.9,
                }}
              />
            </div>
          );
        })}

      {/* Solid colored pill */}
      <div
        className={!selected && !hovered ? "node-breathe" : undefined}
        style={{
          background: color,
          color: "white",
          borderRadius: 16,
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: "-0.01em",
          boxShadow: glow,
          transform: hovered ? "scale(1.07)" : "scale(1)",
          transition: `box-shadow ${motionTokens.hoverMs}ms ease, transform ${motionTokens.hoverMs}ms ease`,
          whiteSpace: "nowrap",
          cursor: "pointer",
          position: "relative",
          zIndex: 1,
          userSelect: "none",
        }}
      >
        {label}
        {/* Count badge when collapsed */}
        {!isExpanded && dotCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "white",
              color,
              fontSize: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              border: `1.5px solid ${color}`,
              lineHeight: 1,
            }}
          >
            {dotCount}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={CENTER_HANDLE} />
      <Handle type="target" position={Position.Top} style={CENTER_HANDLE} />
    </div>
  );
}

export default memo(OrbitNode);
