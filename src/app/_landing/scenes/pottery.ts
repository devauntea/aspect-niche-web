import * as THREE from "three";
import {
  aim,
  canvasTexture,
  clamp,
  contactShadow,
  createHand,
  cuppedHand,
  damp,
  disposeTree,
  easeInOut,
  easeOut,
  type Exhibit,
  type ExhibitContext,
  type Hand,
  type HandPose,
  lerp,
  mesh,
  mixPose,
  noiseTexture,
  openHand,
  type Phase,
  physical,
  type PointerInfo,
  seeded,
  seg,
  gloveMaterials,
  smooth,
} from "./kit";

/*
 * Pottery: wet clay on a turning wheel. Two hands centre, open, pull and shape
 * the clay into a vase or a bowl, withdraw, and the piece dries from the rim
 * down. The clay is one lathe mesh whose profile is recomputed every frame
 * from the clock (procedural deformation), so it is always continuous and a
 * replay is exact.
 */

export type PotteryForm = "vase" | "bowl";

type Shape = {
  points: [number, number][];
  wall: number;
  floor: number;
  open: number;
};

// Outer wall control points, base → rim, as [radius, height]. Same count in
// every shape so any two can be blended.
const LUMP: Shape = {
  points: [
    [0.56, 0],
    [0.61, 0.1],
    [0.61, 0.25],
    [0.55, 0.4],
    [0.43, 0.52],
    [0.25, 0.6],
    [0.03, 0.63],
  ],
  wall: 0.08,
  floor: 0.6,
  open: 0,
};
const CENTRED: Shape = {
  points: [
    [0.48, 0],
    [0.5, 0.12],
    [0.49, 0.3],
    [0.45, 0.5],
    [0.37, 0.66],
    [0.22, 0.76],
    [0.03, 0.79],
  ],
  wall: 0.08,
  floor: 0.76,
  open: 0,
};
const OPENED: Shape = {
  points: [
    [0.5, 0],
    [0.53, 0.1],
    [0.53, 0.24],
    [0.52, 0.38],
    [0.5, 0.5],
    [0.48, 0.6],
    [0.45, 0.64],
  ],
  wall: 0.2,
  floor: 0.13,
  open: 1,
};
const PULLED: Shape = {
  points: [
    [0.42, 0],
    [0.43, 0.15],
    [0.41, 0.4],
    [0.39, 0.65],
    [0.37, 0.88],
    [0.36, 1.05],
    [0.36, 1.16],
  ],
  wall: 0.075,
  floor: 0.11,
  open: 1,
};
const FORMS: Record<PotteryForm, Shape> = {
  vase: {
    points: [
      [0.3, 0],
      [0.47, 0.18],
      [0.58, 0.48],
      [0.5, 0.86],
      [0.27, 1.13],
      [0.23, 1.32],
      [0.3, 1.44],
    ],
    wall: 0.055,
    floor: 0.1,
    open: 1,
  },
  bowl: {
    points: [
      [0.3, 0],
      [0.43, 0.06],
      [0.58, 0.15],
      [0.71, 0.28],
      [0.8, 0.42],
      [0.86, 0.53],
      [0.9, 0.6],
    ],
    wall: 0.055,
    floor: 0.09,
    open: 1,
  },
};

const OUTER = 44;
const RIM = 4;
const INNER = 40;
const ROWS = OUTER + RIM + INNER + 1;
const SEGMENTS = 80;

// The clock, in seconds.
const T = {
  approach: 0.9,
  centre: 2.5,
  open: 3.7,
  pull: 5.7,
  shape: 7.5,
  withdraw: 8.4,
  dry: 11.4,
};

function mixShape(a: Shape, b: Shape, t: number, width = 1): Shape {
  return {
    points: a.points.map(([r, y], i) => [
      lerp(r, b.points[i][0], t) * width,
      lerp(y, b.points[i][1], t),
    ]),
    wall: lerp(a.wall, b.wall, t),
    floor: lerp(a.floor, b.floor, t),
    open: lerp(a.open, b.open, t),
  };
}

/** Sample a shape's outer wall smoothly, then return the full section. */
function section(shape: Shape, out: Float32Array, shrink = 1) {
  const curve = new THREE.CatmullRomCurve3(
    shape.points.map(([r, y]) => new THREE.Vector3(r, y, 0)),
    false,
    "centripetal",
  );
  const outer: THREE.Vector3[] = curve.getSpacedPoints(OUTER - 1);
  const top = outer[outer.length - 1];
  const radiusAt = (y: number) => {
    if (y <= outer[0].y) return outer[0].x;
    for (let i = 1; i < outer.length; i++) {
      if (outer[i].y >= y) {
        const a = outer[i - 1],
          b = outer[i];
        return lerp(a.x, b.x, (y - a.y) / Math.max(1e-5, b.y - a.y));
      }
    }
    return top.x;
  };
  let row = 0;
  const put = (r: number, y: number) => {
    out[row * 2] = Math.max(0.001, r) * shrink;
    out[row * 2 + 1] = y * shrink;
    row++;
  };
  outer.forEach((p) => put(p.x, p.y));
  const wall = shape.wall;
  const floor = Math.min(shape.floor, top.y);
  // A rounded lip between the outer and inner wall.
  for (let i = 1; i <= RIM; i++) {
    const a = (i / (RIM + 1)) * Math.PI;
    put(
      top.x - wall * 0.5 + Math.cos(a) * wall * 0.5 * (shape.open || 0.1),
      top.y + Math.sin(a) * wall * 0.45 * (shape.open || 0.2),
    );
  }
  for (let i = 0; i < INNER; i++) {
    const t = i / (INNER - 1);
    const y = lerp(top.y, floor, Math.pow(t, 0.9));
    const corner = smooth(seg(t, 0.82, 1)) * wall * 0.8;
    put((radiusAt(Math.max(y, 0.05)) - wall - corner) * shape.open, y);
  }
  put(0.001, floor);
  return radiusAt;
}

export function createPottery(context: ExhibitContext): Exhibit {
  const env = context.environment;
  const root = new THREE.Group();
  root.name = "pottery";
  const random = seeded(31);

  /* ------------------------------------------------------------ materials */
  const slipSmear = canvasTexture(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#3a4250";
      g.fillRect(0, 0, w, h);
      g.save();
      g.translate(w / 2, h / 2);
      for (let r = 20; r < w / 2; r += 5 + random() * 9) {
        g.strokeStyle = `rgba(${150 + random() * 40},${125 + random() * 30},${105 + random() * 20},${0.06 + random() * 0.16})`;
        g.lineWidth = 1 + random() * 3;
        g.beginPath();
        const start = random() * Math.PI * 2;
        g.arc(0, 0, r, start, start + 1 + random() * 4);
        g.stroke();
      }
      for (let i = 0; i < 14; i++) {
        g.rotate(random() * 2);
        g.fillStyle = `rgba(170,140,115,${0.1 + random() * 0.14})`;
        g.beginPath();
        g.ellipse(
          80 + random() * 140,
          0,
          30 + random() * 50,
          6 + random() * 10,
          0.3,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
      g.restore();
    },
    { color: true },
  );
  const wheelMetal = physical(env, {
    map: slipSmear,
    metalness: 0.55,
    roughness: 0.38,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
  });
  // The splash pan has seen a lot of throwing: dried slip rings on the floor,
  // splatter up the wall and drips over the lip.
  const panStains = canvasTexture(
    512,
    256,
    (g, w, h) => {
      g.fillStyle = "#26344a";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) {
        const y = h * (0.08 + random() * 0.32);
        g.fillStyle = `rgba(${170 + random() * 30},${145 + random() * 25},${120 + random() * 20},${0.08 + random() * 0.14})`;
        g.fillRect(0, y, w, 1 + random() * 4);
      }
      for (let i = 0; i < 220; i++) {
        const x = random() * w,
          y = h * (0.05 + Math.pow(random(), 1.6) * 0.8);
        const r = 0.5 + random() * (y < h * 0.4 ? 2.6 : 1.4);
        g.fillStyle = `rgba(${165 + random() * 30},${140 + random() * 25},${118 + random() * 20},${0.12 + random() * 0.26})`;
        g.beginPath();
        g.ellipse(x, y, r * (1 + random()), r, random() * 3, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = 0; i < 26; i++) {
        const x = random() * w;
        const top = h * (0.6 + random() * 0.25);
        const len = 10 + random() * 40;
        const grad = g.createLinearGradient(0, top, 0, top - len);
        grad.addColorStop(0, "rgba(185,160,135,0.55)");
        grad.addColorStop(1, "rgba(185,160,135,0)");
        g.fillStyle = grad;
        g.fillRect(x, top - len, 2 + random() * 3, len);
      }
    },
    { color: true },
  );
  const pan = physical(env, {
    map: panStains,
    roughness: 0.48,
    clearcoat: 0.25,
    bumpMap: noiseTexture(128, 12, 6, [6, 2]),
    bumpScale: 0.6,
  });
  const body = physical(env, {
    color: "#1b2330",
    roughness: 0.62,
    metalness: 0.35,
  });
  // Studio floor: dark troweled concrete with a dusting of dried clay.
  const floor = canvasTexture(
    1024,
    1024,
    (g, w, h) => {
      g.fillStyle = "#1a2030";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) {
        const v = random();
        g.fillStyle =
          v > 0.7
            ? `rgba(120,128,150,${0.08 + random() * 0.12})`
            : `rgba(8,10,16,${0.12 + random() * 0.2})`;
        g.fillRect(
          random() * w,
          random() * h,
          1 + random() * 3,
          1 + random() * 3,
        );
      }
      for (let i = 0; i < 30; i++) {
        const x = w / 2 + (random() - 0.5) * w * 0.6,
          y = h / 2 + (random() - 0.5) * h * 0.6;
        const r = 20 + random() * 90;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(190,170,150,${0.06 + random() * 0.07})`);
        grad.addColorStop(1, "rgba(190,170,150,0)");
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (let i = 0; i < 160; i++) {
        g.fillStyle = `rgba(170,150,130,${0.1 + random() * 0.18})`;
        g.beginPath();
        g.arc(
          w / 2 + (random() - 0.5) * w * 0.7,
          h / 2 + (random() - 0.5) * h * 0.7,
          0.6 + random() * 1.6,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    },
    { color: true },
  );
  const plinthMaterial = physical(env, {
    map: floor,
    roughness: 0.85,
    bumpMap: noiseTexture(256, 5, 10, [3, 3]),
    bumpScale: 1.2,
  });
  const wood = physical(env, {
    map: canvasTexture(
      256,
      256,
      (g, w, h) => {
        g.fillStyle = "#7a5a40";
        g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          g.fillStyle = `rgba(${60 + random() * 40},${40 + random() * 25},${25 + random() * 15},${0.12 + random() * 0.18})`;
          g.fillRect(0, y + Math.sin(y * 0.07) * 3, w, 1 + random() * 2);
        }
      },
      { color: true },
    ),
    roughness: 0.7,
  });
  const clayStreaks = canvasTexture(
    512,
    256,
    (g, w, h) => {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        const y = random() * h;
        g.fillStyle = `rgba(${215 + random() * 30},${210 + random() * 30},${205 + random() * 30},${0.12 + random() * 0.18})`;
        g.fillRect(random() * w, y, 30 + random() * 160, 1 + random() * 2);
      }
      for (let i = 0; i < 26; i++) {
        g.fillStyle = `rgba(170,150,140,${0.1 + random() * 0.14})`;
        g.beginPath();
        g.ellipse(
          random() * w,
          random() * h,
          8 + random() * 26,
          4 + random() * 10,
          0,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    },
    { color: true },
  );
  const clayGrain = noiseTexture(256, 404, 4, [4, 2]);
  const clay = physical(env, {
    color: "#ffffff",
    vertexColors: true,
    map: clayStreaks,
    roughness: 0.48,
    clearcoat: 0.55,
    clearcoatRoughness: 0.32,
    envMapIntensity: 0.55,
    bumpMap: clayGrain,
    bumpScale: 0.25,
    side: THREE.DoubleSide,
  });
  const glazes: Record<PotteryForm, THREE.MeshPhysicalMaterial> = {
    vase: physical(env, {
      color: "#e5d8c3",
      roughness: 0.22,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      bumpMap: noiseTexture(128, 8, 4, [4, 2]),
      bumpScale: 0.15,
      side: THREE.DoubleSide,
    }),
    bowl: physical(env, {
      color: "#9180c0",
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      bumpMap: noiseTexture(128, 9, 4, [4, 2]),
      bumpScale: 0.15,
      side: THREE.DoubleSide,
    }),
  };
  const gloves = gloveMaterials(env);

  /* ---------------------------------------------------------------- set */
  const plinth = mesh(
    new THREE.CylinderGeometry(2.75, 2.85, 0.22, 72),
    plinthMaterial,
    root,
  );
  plinth.position.y = -1.08;
  const shadow = contactShadow(4.2, 3.2, 0.6);
  shadow.position.set(0.2, -0.965, 0);
  root.add(shadow);

  const wheel = new THREE.Group();
  root.add(wheel);
  const base = mesh(
    new THREE.CylinderGeometry(0.98, 1.12, 0.78, 56),
    body,
    wheel,
  );
  base.position.y = -0.58;
  // Splash pan: a turned ring with a lip, open in the middle.
  const panProfile = [
    [0.36, -0.16],
    [1.32, -0.16],
    [1.39, -0.12],
    [1.42, 0.12],
    [1.45, 0.15],
    [1.38, 0.15],
    [1.34, -0.08],
    [0.4, -0.09],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  mesh(new THREE.LatheGeometry(panProfile, 72), pan, wheel);
  const head = new THREE.Group();
  wheel.add(head);
  const headDisc = mesh(
    new THREE.CylinderGeometry(1.0, 0.97, 0.09, 72),
    wheelMetal,
    head,
  );
  headDisc.position.y = -0.045;
  // Map the slip texture flat onto the top cap so turning reads clearly.
  {
    const uv = headDisc.geometry.getAttribute("uv");
    const p = headDisc.geometry.getAttribute("position");
    for (let i = 0; i < p.count; i++)
      uv.setXY(i, p.getX(i) / 2 + 0.5, p.getZ(i) / 2 + 0.5);
  }
  const shaft = mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24),
    body,
    head,
  );
  shaft.position.y = -0.14;

  // Studio details: water bowl and sponge on the pan rim, a wooden rib.
  const bucket = mesh(
    new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.24, 0],
        [0.28, 0.05],
        [0.3, 0.24],
        [0.27, 0.24],
        [0.25, 0.06],
        [0.001, 0.05],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      40,
    ),
    pan,
    root,
  );
  bucket.position.set(-1.72, -0.97, 0.95);
  const water = mesh(
    new THREE.CircleGeometry(0.255, 32),
    physical(env, {
      color: "#5d6a72",
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    }),
    bucket,
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.2;
  const sponge = mesh(
    new THREE.SphereGeometry(0.16, 14, 10),
    physical(env, {
      color: "#d0ae6c",
      roughness: 1,
      // Open-cell sponge: a field of little pores.
      bumpMap: canvasTexture(
        128,
        128,
        (g, w) => {
          g.fillStyle = "#fff";
          g.fillRect(0, 0, w, w);
          for (let i = 0; i < 380; i++) {
            g.fillStyle = `rgba(0,0,0,${0.4 + random() * 0.5})`;
            g.beginPath();
            g.arc(
              random() * w,
              random() * w,
              1 + random() * 3.2,
              0,
              Math.PI * 2,
            );
            g.fill();
          }
        },
        { repeat: [2, 2] },
      ),
      bumpScale: 3,
    }),
    root,
  );
  sponge.scale.set(1.2, 0.55, 0.9);
  sponge.position.set(-1.18, 0.18, 0.62);
  const ribShape = new THREE.Shape();
  ribShape.absellipse(0, 0, 0.32, 0.17, 0, Math.PI * 2, false, 0);
  const ribHole = new THREE.Path();
  ribHole.absellipse(0.12, 0, 0.06, 0.04, 0, Math.PI * 2, true, 0);
  ribShape.holes.push(ribHole);
  const rib = mesh(
    new THREE.ExtrudeGeometry(ribShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.008,
      bevelSegments: 2,
    }),
    wood,
    root,
  );
  rib.rotation.set(-Math.PI / 2, 0, 0.5);
  rib.position.set(0.98, 0.17, 1.02);

  // Tools of the trade on the floor: a cutting wire with toggles, a needle
  // tool and a loop trimming tool.
  const steel = physical(env, {
    color: "#b9bcc2",
    metalness: 0.9,
    roughness: 0.28,
  });
  const tools = new THREE.Group();
  tools.position.set(0.55, -0.955, 1.75);
  tools.rotation.y = 0.25;
  root.add(tools);
  const toggle = new THREE.CylinderGeometry(0.035, 0.035, 0.17, 14);
  for (const x of [-0.45, 0.35]) {
    const t = mesh(toggle, wood, tools);
    t.rotation.z = Math.PI / 2;
    t.position.set(x, 0.035, x < 0 ? 0 : 0.18);
  }
  const wire = new THREE.CatmullRomCurve3(
    [
      [-0.36, 0.03, 0],
      [-0.15, 0.012, 0.18],
      [0.05, 0.01, 0.28],
      [0.22, 0.012, 0.22],
      [0.27, 0.03, 0.18],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  mesh(new THREE.TubeGeometry(wire, 40, 0.006, 6, false), steel, tools);
  const needleHandle = mesh(
    new THREE.CylinderGeometry(0.03, 0.022, 0.32, 12),
    wood,
    tools,
  );
  needleHandle.rotation.set(0, 0, Math.PI / 2);
  needleHandle.position.set(-0.2, 0.03, -0.25);
  needleHandle.rotation.y = -0.3;
  const needle = mesh(
    new THREE.CylinderGeometry(0.004, 0.006, 0.2, 6),
    steel,
    tools,
  );
  needle.rotation.set(0, -0.3, Math.PI / 2);
  needle.position.set(0.04, 0.03, -0.32);
  const loopHandle = mesh(
    new THREE.CylinderGeometry(0.032, 0.03, 0.36, 12),
    wood,
    tools,
  );
  loopHandle.rotation.set(0, 0.5, Math.PI / 2);
  loopHandle.position.set(0.55, 0.033, -0.08);
  const loop = mesh(
    new THREE.TorusGeometry(0.06, 0.008, 6, 24, Math.PI * 1.3),
    steel,
    tools,
  );
  loop.position.set(0.77, 0.05, -0.2);
  loop.rotation.set(0, 0.5, 0);
  loop.scale.set(1, 1.4, 1);

  // Wedged clay waiting on a canvas-covered board at the back.
  const board = mesh(new THREE.BoxGeometry(1.0, 0.06, 0.7), wood, root);
  board.position.set(-1.75, -0.94, -1.35);
  board.rotation.y = 0.35;
  const canvasCloth = mesh(
    new THREE.PlaneGeometry(0.92, 0.62),
    physical(env, {
      color: "#cbbfa8",
      roughness: 0.95,
      bumpMap: noiseTexture(64, 77, 1, [8, 8]),
      bumpScale: 1.5,
    }),
    board,
  );
  canvasCloth.rotation.x = -Math.PI / 2;
  canvasCloth.position.y = 0.031;
  const wedged = physical(env, {
    color: "#7b6453",
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    bumpMap: noiseTexture(128, 55, 3, [2, 2]),
    bumpScale: 1.2,
  });
  [
    [-0.18, 0.13, 0.05, 0.3],
    [0.2, 0.11, -0.08, -0.4],
  ].forEach(([x, y, z, r]) => {
    const lump = mesh(new THREE.SphereGeometry(0.17, 24, 16), wedged, board);
    lump.scale.set(1.25, 0.72, 0.95);
    lump.position.set(x, y, z);
    lump.rotation.y = r;
  });

  // The kick pedal and its cable, and vents on the wheel body.
  const pedal = new THREE.Group();
  pedal.position.set(-1.55, -0.96, 1.25);
  pedal.rotation.y = 0.5;
  root.add(pedal);
  mesh(new THREE.BoxGeometry(0.42, 0.08, 0.3), body, pedal).position.y = 0.04;
  const pad = mesh(
    new THREE.BoxGeometry(0.36, 0.035, 0.26),
    physical(env, {
      color: "#0f1218",
      roughness: 0.9,
      bumpMap: noiseTexture(64, 9, 1, [6, 6]),
      bumpScale: 2,
    }),
    pedal,
  );
  pad.position.y = 0.1;
  pad.rotation.x = -0.18;
  const cable = new THREE.CatmullRomCurve3(
    [
      [-1.45, -0.94, 1.12],
      [-1.2, -0.955, 0.95],
      [-1.0, -0.955, 0.7],
      [-0.9, -0.85, 0.55],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  mesh(new THREE.TubeGeometry(cable, 24, 0.018, 8, false), body, root);
  const vents = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.22, 0.018, 0.02),
    physical(env, { color: "#07090d", roughness: 0.9 }),
    5,
  );
  for (let i = 0; i < 5; i++) {
    const d = new THREE.Object3D();
    const y = -0.45 - i * 0.06;
    d.position.set(0, y, 0.985 + 0.14 * ((-0.19 - y) / 0.78));
    d.updateMatrix();
    vents.setMatrixAt(i, d.matrix);
  }
  wheel.add(vents);
  const knob = mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.04, 20),
    physical(env, { color: "#b9a6e3", roughness: 0.35, clearcoat: 0.6 }),
    wheel,
  );
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.4, -0.42, 0.955);
  knob.rotation.y = 0.4;

  // A wooden stool with a ware board for the finished companion piece.
  const stool = new THREE.Group();
  stool.position.set(2.18, 0, -0.35);
  root.add(stool);
  const seat = mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 0.09, 48),
    wood,
    stool,
  );
  seat.position.y = -0.2;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const leg = mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.74, 10),
      wood,
      stool,
    );
    leg.position.set(Math.cos(a) * 0.42, -0.6, Math.sin(a) * 0.42);
    leg.rotation.set(Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1);
  }
  const stoolShadow = contactShadow(1.5, 1.5, 0.35);
  stoolShadow.position.set(0, -0.96, 0);
  stool.add(stoolShadow);
  const companionGeometry: Record<PotteryForm, THREE.LatheGeometry> = {
    vase: staticForm(FORMS.vase),
    bowl: staticForm(FORMS.bowl),
  };
  const companion = mesh(companionGeometry.bowl, glazes.bowl, stool);
  companion.position.y = -0.155;
  companion.scale.setScalar(0.72);

  /* --------------------------------------------------------------- clay */
  const profile = new Float32Array(ROWS * 2);
  section(LUMP, profile);
  const lathePoints = Array.from(
    { length: ROWS },
    (_, i) => new THREE.Vector2(profile[i * 2], profile[i * 2 + 1]),
  );
  const clayGeometry = new THREE.LatheGeometry(lathePoints, SEGMENTS);
  const colors = new Float32Array(
    clayGeometry.getAttribute("position").count * 3,
  );
  clayGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const clayMesh = mesh(clayGeometry, clay, head);
  clayMesh.name = "clay";
  const sinTable = new Float32Array(SEGMENTS + 1);
  const cosTable = new Float32Array(SEGMENTS + 1);
  for (let i = 0; i <= SEGMENTS; i++) {
    const phi = (i / SEGMENTS) * Math.PI * 2;
    sinTable[i] = Math.sin(phi);
    cosTable[i] = Math.cos(phi);
  }
  const wet = new THREE.Color("#6f5a4c");
  const leather = new THREE.Color("#a38b76");
  const bone = new THREE.Color("#ddd0bd");
  const scratch = new THREE.Color();

  /* -------------------------------------------------------------- hands */
  const handScale = 0.44;
  const right = createHand(gloves.glove, gloves.arm, "clay");
  const left = createHand(gloves.glove, gloves.arm, "clay");
  left.root.scale.set(-handScale, handScale, handScale);
  right.root.scale.setScalar(handScale);
  root.add(right.root, left.root);

  /* -------------------------------------------------------------- state */
  let form: PotteryForm = "vase";
  let width = 1;
  let clock = 0;
  let running = false;
  let phase: Phase = "idle";
  let spin = 0;
  let speed = 0.6;
  let hovered = false;
  let shapingDrag = false;
  let lastStage = "";
  let dirty = true;

  const setPhase = (next: Phase, announcement?: string) => {
    if (phase === next) return;
    phase = next;
    exhibit.phase = next;
    context.phase(next, announcement);
  };
  const stage = (text: string) => {
    if (text !== lastStage) {
      lastStage = text;
      context.stage(text);
    }
  };

  function shapeAt(t: number): {
    shape: Shape;
    dry: number;
    wobble: number;
    grooves: number;
    press: number;
    contact: number;
  } {
    const target = FORMS[form];
    if (t < T.approach)
      return {
        shape: LUMP,
        dry: 0,
        wobble: 1,
        grooves: 0,
        press: 0,
        contact: 0.3,
      };
    if (t < T.centre) {
      const p = easeInOut(seg(t, T.approach, T.centre));
      return {
        shape: mixShape(LUMP, CENTRED, p),
        dry: 0,
        wobble: lerp(1, 0.04, p),
        grooves: 0,
        press: Math.sin(p * Math.PI) * 0.6,
        contact: 0.32,
      };
    }
    if (t < T.open) {
      const p = easeInOut(seg(t, T.centre, T.open));
      return {
        shape: mixShape(CENTRED, OPENED, p),
        dry: 0,
        wobble: 0.04,
        grooves: p * 0.2,
        press: 0.4,
        contact: 0.32,
      };
    }
    if (t < T.pull) {
      const p = easeInOut(seg(t, T.open, T.pull));
      const shape = mixShape(OPENED, PULLED, p);
      const top = shape.points[6][1];
      return {
        shape,
        dry: 0,
        wobble: 0.03,
        grooves: 0.2 + p * 0.8,
        press: 1,
        contact: lerp(0.12, top * 0.92, seg(t, T.open + 0.2, T.pull)),
      };
    }
    if (t < T.shape) {
      const p = easeInOut(seg(t, T.pull, T.shape));
      const shape = mixShape(PULLED, target, p, lerp(1, width, p));
      const top = shape.points[6][1];
      const sweep =
        form === "vase"
          ? 0.25 + 0.6 * Math.sin(p * Math.PI * 0.95)
          : 0.2 + 0.75 * p;
      return {
        shape,
        dry: 0,
        wobble: 0.025,
        grooves: 1,
        press: 0.8,
        contact: top * sweep,
      };
    }
    const shaped = mixShape(target, target, 0, width);
    const dry = seg(t, T.withdraw - 0.2, T.dry);
    return {
      shape: shaped,
      dry,
      wobble: 0.02,
      grooves: 1,
      press: 0,
      contact: 0.5,
    };
  }

  let radiusAt: (y: number) => number = () => 0.5;

  function deformClay(t: number) {
    const s = shapeAt(t);
    const shrink = 1 - 0.035 * s.dry;
    radiusAt = section(s.shape, profile, shrink);
    const position = clayGeometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const array = position.array as Float32Array;
    const contact = s.contact * shrink;
    const outerRows = OUTER + RIM;
    for (let i = 0; i <= SEGMENTS; i++) {
      const sin = sinTable[i],
        cos = cosTable[i],
        phi = (i / SEGMENTS) * Math.PI * 2;
      for (let j = 0; j < ROWS; j++) {
        let r = profile[j * 2];
        const y = profile[j * 2 + 1];
        if (j > 0 && j < ROWS - 1) {
          // Off-centre wobble decays as the clay is centred; it is what makes
          // a turning lump read as turning.
          r *=
            1 +
            s.wobble *
              (0.07 * Math.sin(phi * 2 + y * 3) +
                0.035 * Math.sin(phi * 3 - y * 6));
          // Throwing rings and the finger's travelling indentation.
          r +=
            s.grooves *
            0.0042 *
            Math.sin(y * 74 + (j < outerRows ? 0 : 1.4)) *
            clamp(y * 6);
          const d = (y - contact) / 0.08;
          r -= (j < outerRows ? 1 : -0.5) * s.press * 0.035 * Math.exp(-d * d);
          // A hand-thrown rim is never perfectly level.
          if (j >= OUTER - 3 && j < OUTER + RIM + 3)
            r += 0.006 * Math.sin(phi * 3 + 1);
          r = Math.max(0.001, r);
        }
        const k = (i * ROWS + j) * 3;
        array[k] = r * sin;
        array[k + 1] = y;
        array[k + 2] = r * cos;
      }
    }
    position.needsUpdate = true;
    clayGeometry.computeVertexNormals();
    // Close the lathe seam so it never shows as a hard line.
    const normal = clayGeometry.getAttribute("normal") as THREE.BufferAttribute;
    const n = normal.array as Float32Array;
    for (let j = 0; j < ROWS; j++) {
      const a = j * 3,
        b = (SEGMENTS * ROWS + j) * 3;
      for (let c = 0; c < 3; c++)
        n[a + c] = n[b + c] = (n[a + c] + n[b + c]) / 2;
    }
    normal.needsUpdate = true;
    // Drying: the rim goes leather-hard first, then the whole piece to bone dry.
    const height = Math.max(0.3, profile[(OUTER - 1) * 2 + 1]);
    for (let i = 0; i <= SEGMENTS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const y = profile[j * 2 + 1] / height;
        const local = clamp(s.dry * 1.7 - (1 - y) * 0.7);
        if (local < 0.5) scratch.copy(wet).lerp(leather, local * 2);
        else scratch.copy(leather).lerp(bone, (local - 0.5) * 2);
        const k = (i * ROWS + j) * 3;
        colors[k] = scratch.r;
        colors[k + 1] = scratch.g;
        colors[k + 2] = scratch.b;
      }
    }
    (clayGeometry.getAttribute("color") as THREE.BufferAttribute).needsUpdate =
      true;
    clay.roughness = lerp(0.48, 0.94, s.dry);
    clay.clearcoat = lerp(0.55, 0, smooth(clamp(s.dry * 1.4)));
    clay.bumpScale = lerp(0.25, 0.38, s.dry);
    return s;
  }

  /* --------------------------------------------- hand choreography */
  type HandState = {
    at: THREE.Vector3;
    forward: THREE.Vector3;
    facing: THREE.Vector3;
    pose: HandPose;
  };
  const away = (side: -1 | 1): HandState => ({
    at: new THREE.Vector3(side * 2.4, 3.4, -3.6),
    forward: new THREE.Vector3(-side * 0.3, -0.5, 1),
    facing: new THREE.Vector3(-side, -0.2, 0),
    pose: openHand,
  });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  /** Place the wrist so the palm centre (or fingertips) lands on a contact point. */
  const fromPalm = (
    contact: THREE.Vector3,
    forward: THREE.Vector3,
    facing: THREE.Vector3,
    pose: HandPose,
    offset = 0.07,
  ): HandState => {
    const f = forward.clone().normalize();
    const at = contact
      .clone()
      .addScaledVector(f, -right.palm.y * handScale)
      .addScaledVector(facing.clone().normalize(), -offset);
    return { at, forward: f, facing, pose };
  };
  const fromTips = (
    tip: THREE.Vector3,
    forward: THREE.Vector3,
    facing: THREE.Vector3,
    pose: HandPose,
  ): HandState => {
    const f = forward.clone().normalize();
    return {
      at: tip.clone().addScaledVector(f, -1.72 * handScale),
      forward: f,
      facing,
      pose,
    };
  };
  const centring = (side: -1 | 1, y: number, squeeze: number): HandState =>
    fromPalm(
      v(side * (radiusAt(y) + 0.03 - squeeze * 0.02), y, -0.1),
      v(-side * 0.6, -0.18, 0.8),
      v(-side, 0.05, -0.15),
      mixPose(
        cuppedHand,
        { curl: [0.62, 0.62, 0.66, 0.7], thumb: 0.55, spread: 0.1 },
        squeeze,
      ),
    );
  const outside = (y: number, press: number): HandState =>
    fromPalm(
      v(-(radiusAt(y) + 0.04), y, 0.0),
      v(0.5, -0.12, 0.85),
      v(1, 0, -0.1),
      {
        curl: [0.72, 0.58, 0.62, 0.68],
        thumb: 0.5,
        spread: 0.15 + press * 0.05,
      },
    );
  const inside = (y: number, wall: number): HandState =>
    fromTips(
      v(Math.max(0.05, radiusAt(y) - wall - 0.05), y, 0.02),
      v(-0.45, -0.78, 0.38),
      v(1, 0.1, 0),
      { curl: [0.12, 0.25, 0.55, 0.62], thumb: 0.65, spread: 0.05 },
    );
  const pressing = (top: number): HandState =>
    fromTips(v(0.03, top, 0.04), v(0.32, -0.8, 0.46), v(0, 0.2, 1), {
      curl: [0.18, 0.18, 0.42, 0.6],
      thumb: 0.7,
      spread: 0.05,
    });

  const blend = (a: HandState, b: HandState, t: number): HandState => ({
    at: a.at.clone().lerp(b.at, t),
    forward: a.forward.clone().lerp(b.forward, t).normalize(),
    facing: a.facing.clone().lerp(b.facing, t).normalize(),
    pose: mixPose(a.pose, b.pose, t),
  });

  function handsAt(
    t: number,
    s: ReturnType<typeof shapeAt>,
  ): [HandState, HandState] | null {
    if (t <= 0 || t >= T.withdraw + 0.1) return null;
    const top = s.shape.points[6][1] * (1 - 0.035 * s.dry);
    const wall = s.shape.wall;
    const cR = centring(-1, 0.3, s.press);
    const cL = centring(1, 0.34, s.press);
    if (t < T.approach) {
      const p = easeOut(seg(t, 0, T.approach));
      return [
        blend(away(-1), centring(-1, 0.3, 0), p),
        blend(away(1), centring(1, 0.34, 0), p),
      ];
    }
    if (t < T.centre) return [cR, cL];
    if (t < T.open) {
      const p = smooth(seg(t, T.centre, T.centre + 0.45));
      return [blend(cR, pressing(top + 0.01), p), cL];
    }
    const pull = s.contact;
    if (t < T.pull) {
      const p = smooth(seg(t, T.open, T.open + 0.35));
      return [
        blend(pressing(top), outside(pull, s.press), p),
        blend(cL, inside(pull, wall), p),
      ];
    }
    if (t < T.shape) return [outside(pull, s.press), inside(pull, wall)];
    const p = easeInOut(seg(t, T.shape, T.withdraw));
    return [
      blend(outside(pull, 0), away(-1), p),
      blend(inside(pull, wall), away(1), p),
    ];
  }

  function placeHands(t: number, s: ReturnType<typeof shapeAt>) {
    const states = handsAt(t, s);
    right.root.visible = left.root.visible = !!states;
    if (!states) return;
    const apply = (hand: Hand, state: HandState) => {
      hand.root.position.copy(state.at);
      aim(hand.root, state.forward, state.facing);
      hand.pose(state.pose);
    };
    apply(right, states[0]);
    apply(left, states[1]);
  }

  let widthNoteUntil = -1;
  function stageFor(t: number) {
    if (!running && phase === "idle") return "Wet clay · ready to throw";
    if (shapingDrag || t < widthNoteUntil)
      return `Width ${Math.round(width * 100)}% · drag to shape`;
    if (t < T.approach) return "01 · Wet hands";
    if (t < T.centre) return "02 · Centring";
    if (t < T.open) return "03 · Opening";
    if (t < T.pull) return "04 · Pulling the walls";
    if (t < T.shape) return `05 · Shaping the ${form}`;
    if (t < T.withdraw) return "06 · Hands away";
    if (t < T.dry)
      return clock < (T.withdraw + T.dry) / 2
        ? "07 · Leather-hard"
        : "07 · Bone dry";
    return `Finished ${form} · and its ${form === "vase" ? "bowl" : "vase"}`;
  }

  function apply() {
    const s = deformClay(clock);
    placeHands(running || phase === "active" ? clock : 0, s);
    stage(stageFor(clock));
  }

  /* ------------------------------------------------------------ actions */
  const showCompanion = () => {
    const other: PotteryForm = form === "vase" ? "bowl" : "vase";
    companion.geometry = companionGeometry[other];
    companion.material = glazes[other];
  };

  function reset() {
    running = false;
    clock = 0;
    shapingDrag = false;
    setPhase("idle");
    apply();
    dirty = true;
  }
  function play() {
    // The button reads "Throwing…" while active: pressing it again is a no-op.
    if (phase === "active") return;
    start();
  }
  function start() {
    if (context.still()) return finish();
    clock = 0;
    running = true;
    setPhase("active");
    dirty = true;
  }
  function finish() {
    running = false;
    clock = T.dry + 0.01;
    apply();
    setPhase(
      "completed",
      `The ${form} is thrown and dry, beside a glazed ${form === "vase" ? "bowl" : "vase"}.`,
    );
    dirty = true;
  }
  function setForm(next: PotteryForm) {
    if (next === form && phase !== "completed") return;
    form = next;
    width = 1;
    showCompanion();
    start();
  }

  const hit = (info: PointerInfo | null) => !!info?.hit;

  const exhibit: Exhibit & {
    setForm: (f: PotteryForm) => void;
    form: () => PotteryForm;
  } = {
    id: "pottery",
    root,
    view: {
      target: new THREE.Vector3(0.4, 0.15, 0),
      distance: 9.2,
      height: 1.9,
    },
    pickables: [clayMesh, headDisc, companion, right.root, left.root, plinth],
    phase,
    label: () =>
      phase === "active"
        ? "Throwing…"
        : phase === "completed"
          ? "Throw again"
          : `Throw a ${form}`,
    play,
    finish,
    reset,
    setForm,
    form: () => form,
    update(dt) {
      const target =
        (running
          ? clock < T.withdraw
            ? 4.6
            : clock < T.dry
              ? 4.6 * (1 - seg(clock, T.withdraw, T.withdraw + 1.6))
              : 0
          : phase === "completed"
            ? 0.35
            : 0.9) * (hovered ? 1.35 : 1);
      speed = damp(speed, target, 3, dt);
      spin += speed * dt;
      head.rotation.y = spin;
      let moving = speed > 0.01;
      if (running) {
        clock += dt;
        if (clock >= T.dry) {
          clock = T.dry + 0.01;
          running = false;
          apply();
          setPhase(
            "completed",
            `The ${form} is thrown and dry, beside a glazed ${form === "vase" ? "bowl" : "vase"}.`,
          );
        } else apply();
        moving = true;
      } else if (phase === "idle") {
        // Idle: the lump turns slowly; its wobble is what shows it turning.
        moving = true;
      }
      if (dirty) {
        dirty = false;
        moving = true;
      }
      return moving;
    },
    hover(info) {
      hovered = hit(info);
      context.cursor(
        hovered
          ? phase === "active" && clock > T.open && clock < T.shape
            ? "grab"
            : "pointer"
          : "default",
      );
    },
    click(info) {
      if (!hit(info)) return;
      if (phase !== "active") play();
    },
    dragStart(info) {
      // While the walls are being pulled or shaped, dragging sideways
      // changes how wide the finished piece will be.
      if (
        phase === "active" &&
        clock > T.open &&
        clock < T.shape &&
        hit(info)
      ) {
        shapingDrag = true;
        context.cursor("grabbing");
        return true;
      }
      return false;
    },
    drag(_info, dx) {
      if (!shapingDrag) return;
      width = clamp(width + dx * 0.004, 0.78, 1.28);
      widthNoteUntil = clock + 1.2;
    },
    dragEnd() {
      shapingDrag = false;
      context.cursor("default");
    },
    key(key) {
      if (key === "v" || key === "V") return (setForm("vase"), true);
      if (key === "b" || key === "B") return (setForm("bowl"), true);
      return false;
    },
    demo: {
      duration: 7.2,
      rate: 1.75,
      begin: play,
      cursor(t) {
        if (t < 0.35)
          return { point: new THREE.Vector3(0.1, 0.7, 0.5), press: false };
        if (t < 0.6)
          return { point: new THREE.Vector3(0.05, 0.5, 0.5), press: true };
        if (t > 2.6 && t < 3.6) {
          const p = seg(t, 2.6, 3.6);
          return {
            point: new THREE.Vector3(lerp(-0.2, 0.35, smooth(p)), 0.7, 0.6),
            press: true,
          };
        }
        return null;
      },
    },
    dispose() {
      Object.values(companionGeometry).forEach((g) => g.dispose());
      disposeTree(root, new Set([env]));
    },
  };
  showCompanion();
  apply();
  return exhibit;
}

function staticForm(shape: Shape) {
  const profile = new Float32Array(ROWS * 2);
  section(shape, profile);
  const points = Array.from(
    { length: ROWS },
    (_, i) => new THREE.Vector2(profile[i * 2], profile[i * 2 + 1]),
  );
  for (const p of points) p.x += 0.006 * Math.sin(p.y * 50) * clamp(p.y * 6);
  return new THREE.LatheGeometry(points, 64);
}
