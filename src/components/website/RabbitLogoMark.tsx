"use client";

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

const BUBBLES = [
  { x: 200, y: 145, r: 90,  c: "#5FA8A8", o: 0.52 },
  { x: 115, y: 205, r: 105, c: "#A33B5E", o: 0.52 },
  { x: 248, y: 210, r: 88,  c: "#E0A94E", o: 0.50 },
  { x: 185, y: 268, r: 70,  c: "#6B8FB5", o: 0.48 },
  { x: 58,  y: 108, r: 24,  c: "#A33B5E", o: 0.70 },
  { x: 310, y: 165, r: 28,  c: "#E0A94E", o: 0.70 },
  { x: 205, y: 315, r: 18,  c: "#5FA8A8", o: 0.70 },
];

const NODES = [
  { x: 192, y: 52,  c: "#EF9F27" },
  { x: 228, y: 44,  c: "#EF9F27" },
  { x: 204, y: 76,  c: "#9CB85A" },
  { x: 242, y: 72,  c: "#5FA8A8" },
  { x: 148, y: 84,  c: "#A33B5E" },
  { x: 196, y: 98,  c: "#5FA8A8" },
  { x: 232, y: 96,  c: "#EF9F27" },
  { x: 256, y: 114, c: "#5FA8A8" },
  { x: 292, y: 135, c: "#9CB85A" },
  { x: 306, y: 158, c: "#6B8FB5" },
  { x: 282, y: 170, c: "#A33B5E" },
  { x: 250, y: 148, c: "#EF9F27" },
  { x: 222, y: 132, c: "#5FA8A8" },
  { x: 186, y: 138, c: "#EF9F27" },
  { x: 170, y: 162, c: "#A33B5E" },
  { x: 124, y: 156, c: "#5FA8A8" },
  { x: 94,  y: 178, c: "#9CB85A" },
  { x: 88,  y: 208, c: "#5FA8A8" },
  { x: 112, y: 228, c: "#6B8FB5" },
  { x: 148, y: 216, c: "#EF9F27" },
  { x: 152, y: 186, c: "#A33B5E" },
  { x: 68,  y: 246, c: "#9CB85A" },
  { x: 80,  y: 280, c: "#EF9F27" },
  { x: 92,  y: 310, c: "#A33B5E" },
  { x: 198, y: 200, c: "#6B8FB5" },
  { x: 226, y: 214, c: "#A33B5E" },
  { x: 258, y: 200, c: "#9CB85A" },
  { x: 294, y: 212, c: "#EF9F27" },
];

const EDGES: [number, number][] = [
  [0,2],[2,5],[1,3],[3,6],[5,6],
  [0,1],[4,5],[4,12],
  [5,7],[6,7],[6,11],
  [7,8],[8,9],[9,10],[10,11],[11,7],
  [11,12],[7,12],[12,13],[13,14],
  [14,15],[13,15],[14,20],
  [15,16],[16,17],[17,18],[18,19],[19,20],[20,15],
  [16,20],[16,18],[15,18],[17,20],[19,18],
  [17,21],[21,22],[22,23],[18,21],
  [14,24],[20,24],[24,25],[25,26],[26,27],
  [25,10],[11,25],[24,19],
];

const BIG = new Set([7, 12, 15, 18]);

export default function RabbitLogoMark({ width = 200, height, className }: Props) {
  const h = height ?? width;
  return (
    <svg
      viewBox="0 0 360 380"
      width={width}
      height={h}
      fill="none"
      className={className}
      aria-label="Aspect Niche rabbit constellation logo"
    >
      {/* Background fill */}
      <rect width="360" height="380" fill="#FAF6EC"/>

      {/* Translucent bubbles */}
      {BUBBLES.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity={b.o}/>
      ))}

      {/* Constellation edges */}
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x} y1={NODES[a].y}
          x2={NODES[b].x} y2={NODES[b].y}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}

      {/* Node dots */}
      {NODES.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={BIG.has(i) ? 6.8 : 5.8} fill="rgba(255,255,255,0.9)"/>
          <circle cx={n.x} cy={n.y} r={BIG.has(i) ? 6 : 5} fill={n.c}/>
        </g>
      ))}
    </svg>
  );
}
