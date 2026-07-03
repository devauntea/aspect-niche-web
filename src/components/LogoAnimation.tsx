"use client";

import { useEffect, useRef } from "react";

interface Props {
  onComplete: () => void;
}

const W = 360;
const H = 380;

const BUBBLES = [
  { x: 200, y: 145, r: 90, c: "#5FA8A8", o: 0.52 },
  { x: 115, y: 205, r: 105, c: "#A33B5E", o: 0.52 },
  { x: 248, y: 210, r: 88, c: "#E0A94E", o: 0.5 },
  { x: 185, y: 268, r: 70, c: "#6B8FB5", o: 0.48 },
  { x: 58, y: 108, r: 24, c: "#A33B5E", o: 0.7 },
  { x: 310, y: 165, r: 28, c: "#E0A94E", o: 0.7 },
  { x: 205, y: 315, r: 18, c: "#5FA8A8", o: 0.7 },
];

const NODES = [
  { x: 192, y: 52, c: "#EF9F27" }, // 0  ear-L tip
  { x: 228, y: 44, c: "#EF9F27" }, // 1  ear-R tip
  { x: 204, y: 76, c: "#9CB85A" }, // 2  ear-L mid
  { x: 242, y: 72, c: "#5FA8A8" }, // 3  ear-R mid
  { x: 148, y: 84, c: "#A33B5E" }, // 4  brow
  { x: 196, y: 98, c: "#5FA8A8" }, // 5  ear-L base
  { x: 232, y: 96, c: "#EF9F27" }, // 6  ear-R base
  { x: 256, y: 114, c: "#5FA8A8" }, // 7  head top-right
  { x: 292, y: 135, c: "#9CB85A" }, // 8  cheek
  { x: 306, y: 158, c: "#6B8FB5" }, // 9  snout
  { x: 282, y: 170, c: "#A33B5E" }, // 10 jaw
  { x: 250, y: 148, c: "#EF9F27" }, // 11 throat
  { x: 222, y: 132, c: "#5FA8A8" }, // 12 upper back
  { x: 186, y: 138, c: "#EF9F27" }, // 13 mid back
  { x: 170, y: 162, c: "#A33B5E" }, // 14 hip
  { x: 124, y: 156, c: "#5FA8A8" }, // 15 haunch top
  { x: 94, y: 178, c: "#9CB85A" }, // 16 haunch upper-left
  { x: 88, y: 208, c: "#5FA8A8" }, // 17 haunch left
  { x: 112, y: 228, c: "#6B8FB5" }, // 18 haunch bottom center
  { x: 148, y: 216, c: "#EF9F27" }, // 19 haunch lower-right
  { x: 152, y: 186, c: "#A33B5E" }, // 20 haunch center
  { x: 68, y: 246, c: "#9CB85A" }, // 21 ankle
  { x: 80, y: 280, c: "#EF9F27" }, // 22 foot mid
  { x: 92, y: 310, c: "#A33B5E" }, // 23 foot tip
  { x: 198, y: 200, c: "#6B8FB5" }, // 24 belly
  { x: 226, y: 214, c: "#A33B5E" }, // 25 front thigh
  { x: 258, y: 200, c: "#9CB85A" }, // 26 front knee
  { x: 294, y: 212, c: "#EF9F27" }, // 27 front paw
];

const EDGES: [number, number][] = [
  [0, 2],
  [2, 5],
  [1, 3],
  [3, 6],
  [5, 6],
  [0, 1],
  [4, 5],
  [4, 12],
  [5, 7],
  [6, 7],
  [6, 11],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 7],
  [11, 12],
  [7, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [13, 15],
  [14, 20],
  [15, 16],
  [16, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [20, 15],
  [16, 20],
  [16, 18],
  [15, 18],
  [17, 20],
  [19, 18],
  [17, 21],
  [21, 22],
  [22, 23],
  [18, 21],
  [14, 24],
  [20, 24],
  [24, 25],
  [25, 26],
  [26, 27],
  [25, 10],
  [11, 25],
  [24, 19],
];

const BIG_NODES = new Set([7, 12, 15, 18]);

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

const ORBIT_ORIGINS = NODES.map((_, i) => {
  const angle = (i / NODES.length) * Math.PI * 2;
  const dist = 200 + (i % 3) * 40;
  return {
    x: W / 2 + Math.cos(angle) * dist,
    y: H / 2 + Math.sin(angle) * dist - 30,
  };
});

export default function LogoAnimation({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const _ctx = canvas.getContext("2d");
    if (!_ctx) return;
    const ctx: CanvasRenderingContext2D = _ctx;

    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(DPR, DPR);

    const P1_START = 0,
      P1_END = 1.4;
    const P2_START = 1.0,
      P2_END = 2.2;
    const P3_START = 2.0,
      P3_END = 3.5;
    const P4_START = 3.2,
      P4_END = 4.5;

    let startTime: number | null = null;
    let animId: number;
    let completed = false;

    function drawDots(c: CanvasRenderingContext2D, alpha: number) {
      for (let i = 0; i < NODES.length; i++) {
        const node = NODES[i];
        const dotR = BIG_NODES.has(i) ? 6 : 5;
        c.save();
        c.globalAlpha = alpha;
        c.beginPath();
        c.arc(node.x, node.y, dotR + 0.8, 0, Math.PI * 2);
        c.strokeStyle = "rgba(255,255,255,0.9)";
        c.lineWidth = 0.8;
        c.stroke();
        c.beginPath();
        c.arc(node.x, node.y, dotR, 0, Math.PI * 2);
        c.fillStyle = node.c;
        c.fill();
        c.restore();
      }
    }

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#FAF6EC";
      ctx.fillRect(0, 0, W, H);

      // Phase 1 — bubbles
      const p1e = easeInOut(
        Math.min(Math.max((elapsed - P1_START) / (P1_END - P1_START), 0), 1),
      );
      if (p1e > 0) {
        for (const b of BUBBLES) {
          ctx.save();
          ctx.globalAlpha = p1e * b.o;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = b.c;
          ctx.fill();
          ctx.restore();
        }
      }

      // Phase 2 — dots orbit in
      const p2e = easeInOut(
        Math.min(Math.max((elapsed - P2_START) / (P2_END - P2_START), 0), 1),
      );
      if (p2e > 0) {
        for (let i = 0; i < NODES.length; i++) {
          const node = NODES[i];
          const orig = ORBIT_ORIGINS[i];
          const nx = orig.x + (node.x - orig.x) * p2e;
          const ny = orig.y + (node.y - orig.y) * p2e;
          const dotR = BIG_NODES.has(i) ? 6 : 5;
          ctx.save();
          ctx.globalAlpha = p2e;
          ctx.beginPath();
          ctx.arc(nx, ny, dotR + 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(nx, ny, dotR, 0, Math.PI * 2);
          ctx.fillStyle = node.c;
          ctx.fill();
          ctx.restore();
        }
      }

      // Phase 3 — edges draw
      const p3raw = Math.min(
        Math.max((elapsed - P3_START) / (P3_END - P3_START), 0),
        1,
      );
      if (p3raw > 0) {
        const edgesVisible = p3raw * EDGES.length;
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";

        for (let ei = 0; ei < EDGES.length; ei++) {
          if (ei >= edgesVisible) break;
          const [a, b] = EDGES[ei];
          const na = NODES[a];
          const nb = NODES[b];
          const frac = Math.min(edgesVisible - ei, 1);
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(na.x + (nb.x - na.x) * frac, na.y + (nb.y - na.y) * frac);
          ctx.stroke();
          ctx.restore();
        }

        // Redraw dots on top of edges
        drawDots(ctx, p2e);
      }

      // Phase 4 — wordmark
      const p4e = easeInOut(
        Math.min(Math.max((elapsed - P4_START) / (P4_END - P4_START), 0), 1),
      );
      if (p4e > 0 && wordmarkRef.current) {
        wordmarkRef.current.style.opacity = String(p4e);
      }

      if (elapsed >= P4_END && !completed) {
        completed = true;
        setTimeout(onComplete, 300);
        return;
      }

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAF6EC] z-50">
      <canvas ref={canvasRef} style={{ display: "block" }} />
      <div
        ref={wordmarkRef}
        style={{
          opacity: 0,
          marginTop: 16,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: "#3a2e2a",
          }}
        >
          aspect niche
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            color: "#6a5e58",
            marginTop: 4,
          }}
        >
          Navigate the Hobby Verse
        </div>
      </div>
    </div>
  );
}
