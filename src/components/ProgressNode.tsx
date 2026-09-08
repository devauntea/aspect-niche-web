"use client";

// Photo and note nodes: the two things that sprout around a hobby when the
// graph is flipped and one collected hobby is focused.
//
// They never appear on the discovery side. A photo is a tilted instant-frame, a
// note is a small square of warm paper with a folded corner — the same
// silhouettes the app uses, so the two read as one product.
//
// The date sits under the node as its own line rather than inside the drawing,
// because it is text and has to be selectable, translatable and legible at any
// size. What the label says is load-bearing: "Taken" is the capture date and
// "Added" is when it arrived, and the two are never conflated.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface ProgressNodeData {
  label: string;
  sublabel?: string;
  labelAbove?: boolean;
  thumbnail?: string;
  noteExcerpt?: string;
}

const SIZE = 52;

const handleStyle: React.CSSProperties = {
  opacity: 0,
  top: SIZE / 2,
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  border: "none",
  background: "none",
};

function ProgressNodeInner({ data, selected, type }: NodeProps) {
  const d = data as unknown as ProgressNodeData;
  const isPhoto = type === "progressPhoto";
  const caption = (
    <div
      className="progress-node-caption"
      style={{ order: d.labelAbove ? -1 : 1 }}
    >
      <span className="progress-node-kind">{d.label}</span>
      {d.sublabel && (
        <span className="progress-node-date">{d.sublabel}</span>
      )}
    </div>
  );

  return (
    <div
      className={`progress-node ${selected ? "is-selected" : ""}`}
      style={{ width: SIZE }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      {d.labelAbove && caption}

      {isPhoto ? (
        <div className="progress-photo" style={{ width: SIZE, height: SIZE }}>
          {d.thumbnail ? (
            // Decorative here: the caption underneath already names what this
            // is and when, and the full image opens with its own description.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.thumbnail} alt="" className="progress-photo-img" />
          ) : (
            <div className="progress-photo-empty" />
          )}
        </div>
      ) : (
        <div className="progress-note" style={{ width: SIZE, height: SIZE }}>
          <span className="progress-note-lines" aria-hidden="true" />
          <span className="progress-note-fold" aria-hidden="true" />
        </div>
      )}

      {!d.labelAbove && caption}
    </div>
  );
}

export default memo(ProgressNodeInner);
