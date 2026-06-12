"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { IconAppMark } from "./icons";

interface OrbitNodeData {
  label: string;
  color: string;
  isExpanded: boolean;
  childCount: number;
  childColors: string[];
}

function OrbitNode({ data, selected }: NodeProps) {
  const d = data as unknown as OrbitNodeData;
  const { label, color, isExpanded, childCount, childColors } = d;

  const orbitRadius = 38;
  const dotCount = Math.min(childCount, 6);
  const dotColors = childColors.slice(0, dotCount);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 120, height: 120 }}
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
              className="absolute"
              style={{
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
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: dotColor,
                  transform: "translate(-50%, -50%)",
                  opacity: 0.75,
                }}
              />
            </div>
          );
        })}

      {/* Main interest node */}
      <div
        className={!selected ? "node-breathe" : undefined}
        style={{
          background: selected ? color : "#FFFFFF",
          color: selected ? "#FFFFFF" : "#1A1916",
          border: `2px solid ${color}`,
          borderRadius: 20,
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: "-0.01em",
          boxShadow: selected
            ? `0 0 0 4px ${color}28, 0 6px 20px ${color}35`
            : `0 2px 8px ${color}22`,
          transition: "box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease",
          whiteSpace: "nowrap",
          cursor: "pointer",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Subtle watermark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.15,
            pointerEvents: "none",
          }}
        >
          <IconAppMark size={14} />
        </div>
        {label}
        {/* Expand indicator */}
        {!isExpanded && dotCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: color,
              color: "white",
              fontSize: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              border: "1.5px solid white",
            }}
          >
            {dotCount}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
    </div>
  );
}

export default memo(OrbitNode);
