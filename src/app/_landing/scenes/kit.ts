import * as THREE from "three";
import {
  GLOVE_BONES,
  GLOVE_DIGITS,
  GLOVE_INDICES,
  GLOVE_URL,
  GLOVE_VERTICES,
} from "./gloveRig";

/*
 * Shared pieces for the hobby exhibits: the contract every exhibit implements,
 * timeline helpers, procedural textures and the posable hand rig.
 *
 * Every animated exhibit is written as a pure function of its own clock. The
 * scene only advances that clock, so a replay is "set the clock to zero" and
 * rapid input can never leave a half-finished tween behind.
 */

export type HobbyId = "pottery" | "photography" | "foraging";
export type Phase = "idle" | "active" | "completed";

export type ExhibitContext = {
  environment: THREE.Texture;
  /** Visible stage label (decorative, mirrored to aria-live only on completion). */
  stage: (text: string) => void;
  /** Phase changes are rare; the scene forwards them to React. */
  phase: (phase: Phase, announcement?: string) => void;
  /** Short, polite live message for something the visitor did. */
  announce: (text: string) => void;
  /** True while motion is paused or reduced: sequences jump to their result. */
  still: () => boolean;
  /** The primary action's label or the finished count changed. */
  changed: () => void;
  /** Tells the host the cursor is over something that does something. */
  cursor: (kind: "default" | "pointer" | "grab" | "grabbing") => void;
};

export type DemoCue = { point: THREE.Vector3; press: boolean } | null;

export type Demo = {
  /** Seconds of the exhibit's own clock the preview shows. */
  duration: number;
  /** Clock rate while previewing, so the full story fits a short look. */
  rate: number;
  /** Where the simulated cursor sits at preview time t, in exhibit space. */
  cursor: (t: number) => DemoCue;
  begin: () => void;
};

export type PointerInfo = {
  hit: THREE.Intersection | null;
  ray: THREE.Ray;
};

export interface Exhibit {
  readonly id: HobbyId;
  readonly root: THREE.Group;
  /** Camera framing: what to look at, and how far away. */
  readonly view: { target: THREE.Vector3; distance: number; height: number };
  readonly pickables: THREE.Object3D[];
  phase: Phase;
  /** Words for the primary action button in the current state. */
  label(): string;
  /** The primary action: begin, replay, take a photo, gather. */
  play(): void;
  /** Jump to the finished state without animating. */
  finish(): void;
  reset(): void;
  /** Advance. Returns true while anything is moving and frames are needed. */
  update(dt: number, elapsed: number): boolean;
  hover(info: PointerInfo | null): void;
  click(info: PointerInfo): void;
  /** Claim a drag (return true) or let the scene turn the whole exhibit. */
  dragStart(info: PointerInfo): boolean;
  drag(info: PointerInfo, dx: number, dy: number): void;
  dragEnd(): void;
  /** Keyboard secondary actions. Return true when handled. */
  key(key: string): boolean;
  readonly demo: Demo;
  dispose(): void;
}

/* ---------------------------------------------------------------- timing */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 progress of t through [a, b]. */
export const seg = (t: number, a: number, b: number) =>
  clamp((t - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Frame-rate independent exponential approach. */
export const damp = (
  current: number,
  target: number,
  rate: number,
  dt: number,
) => current + (target - current) * (1 - Math.exp(-rate * dt));
/** A deterministic pseudo-random sequence for layout (never Math.random). */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* -------------------------------------------------------------- textures */

export function canvasTexture(
  width: number,
  height: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  options: { color?: boolean; repeat?: [number, number] } = {},
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  if (options.color) texture.colorSpace = THREE.SRGBColorSpace;
  if (options.repeat) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...options.repeat);
  }
  texture.anisotropy = 4;
  return texture;
}

/** Tileable value noise as a greyscale bump/roughness source. */
export function noiseTexture(
  size: number,
  seed: number,
  scale: number,
  repeat: [number, number] = [1, 1],
) {
  const random = seeded(seed);
  const grid = Math.max(2, Math.round(size / scale));
  const lattice = Array.from({ length: grid * grid }, () => random());
  const at = (x: number, y: number) =>
    lattice[((y + grid) % grid) * grid + ((x + grid) % grid)];
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * grid,
        gy = (y / size) * grid;
      const ix = Math.floor(gx),
        iy = Math.floor(gy);
      const fx = smooth(gx - ix),
        fy = smooth(gy - iy);
      const coarse = lerp(
        lerp(at(ix, iy), at(ix + 1, iy), fx),
        lerp(at(ix, iy + 1), at(ix + 1, iy + 1), fx),
        fy,
      );
      const fine = random();
      const v = 255 * clamp(0.5 + (coarse - 0.5) * 0.75 + (fine - 0.5) * 0.25);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/** A soft radial blot: contact shadows, pollen sprites, glows. */
export function radialTexture(
  inner = "rgba(0,0,0,0.55)",
  outer = "rgba(0,0,0,0)",
) {
  return canvasTexture(128, 128, (g, w, h) => {
    const gradient = g.createRadialGradient(
      w / 2,
      h / 2,
      0,
      w / 2,
      h / 2,
      w / 2,
    );
    gradient.addColorStop(0, inner);
    gradient.addColorStop(1, outer);
    g.fillStyle = gradient;
    g.fillRect(0, 0, w, h);
  });
}

export function contactShadow(width: number, depth: number, opacity = 0.55) {
  const material = new THREE.MeshBasicMaterial({
    map: radialTexture(),
    transparent: true,
    depthWrite: false,
    opacity,
  });
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    material,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = -1;
  return shadow;
}

/** Leather or leatherette grain: packed, slightly domed pebbles. */
export function pebbleTexture(
  size: number,
  seed: number,
  repeat: [number, number],
) {
  const random = seeded(seed);
  return canvasTexture(
    size,
    size,
    (g, w, h) => {
      g.fillStyle = "#6a6a6a";
      g.fillRect(0, 0, w, h);
      const count = Math.round((w * h) / 22);
      for (let i = 0; i < count; i++) {
        const x = random() * w,
          y = random() * h,
          r = 1.6 + random() * 2.8;
        const grad = g.createRadialGradient(
          x - r * 0.3,
          y - r * 0.3,
          0,
          x,
          y,
          r,
        );
        grad.addColorStop(
          0,
          `rgb(${190 + random() * 40},${190 + random() * 40},${190 + random() * 40})`,
        );
        grad.addColorStop(1, "rgba(60,60,60,0)");
        g.fillStyle = grad;
        g.beginPath();
        g.ellipse(
          x,
          y,
          r,
          r * (0.7 + random() * 0.5),
          random() * 3,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    },
    { repeat },
  );
}

/**
 * Engraved markings laid out on a circle for a flat ring or dial face whose
 * UVs are planar (RingGeometry, CircleGeometry). Angles in degrees, 0 = top,
 * clockwise. `radius` is a fraction of the face's outer radius.
 */
export function dialTexture(
  marks: { text: string; angle: number; color?: string; size?: number }[],
  options: {
    base: string;
    radius: number;
    ticks?: number[];
    tickColor?: string;
    size?: number;
  },
) {
  const size = options.size ?? 512;
  return canvasTexture(
    size,
    size,
    (g, w) => {
      const c = w / 2;
      g.fillStyle = options.base;
      g.fillRect(0, 0, w, w);
      g.textAlign = "center";
      g.textBaseline = "middle";
      for (const angle of options.ticks ?? []) {
        g.save();
        g.translate(c, c);
        g.rotate((angle * Math.PI) / 180);
        g.fillStyle = options.tickColor ?? "#e9e4da";
        g.fillRect(-1.2, -c * (options.radius + 0.1), 2.4, c * 0.06);
        g.restore();
      }
      for (const mark of marks) {
        g.save();
        g.translate(c, c);
        g.rotate((mark.angle * Math.PI) / 180);
        g.translate(0, -c * options.radius);
        g.fillStyle = mark.color ?? "#ece7dc";
        g.font = `600 ${Math.round((mark.size ?? 0.07) * w)}px "DM Sans", Arial, sans-serif`;
        g.fillText(mark.text, 0, 0);
        g.restore();
      }
    },
    { color: true },
  );
}

/**
 * Markings around a cylinder band (CylinderGeometry UVs: u runs around, v
 * along the axis). `at` is the u position, 0.5 is the top once the band is
 * turned to face the viewer.
 */
export function bandTexture(
  marks: { text: string; at: number; color?: string }[],
  options: {
    base: string;
    ticks?: number[];
    tickColor?: string;
    fontSize?: number;
    stripe?: string;
  },
) {
  return canvasTexture(
    1024,
    64,
    (g, w, h) => {
      g.fillStyle = options.base;
      g.fillRect(0, 0, w, h);
      if (options.stripe) {
        g.fillStyle = options.stripe;
        g.fillRect(0, h - 6, w, 3);
      }
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `600 ${options.fontSize ?? 26}px "DM Sans", Arial, sans-serif`;
      for (const at of options.ticks ?? []) {
        g.fillStyle = options.tickColor ?? "#e9e4da";
        g.fillRect(at * w - 1, 4, 2, 14);
      }
      for (const mark of marks) {
        g.fillStyle = mark.color ?? "#ece7dc";
        g.fillText(mark.text, mark.at * w, h * 0.58);
      }
    },
    { color: true },
  );
}

/**
 * A flat strap or ribbon with thickness along a curve: u runs along the
 * length, v across the width, so stitching textures line up.
 */
export function ribbonGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  width: number,
  thickness: number,
  segments: number,
  across = new THREE.Vector3(0, 0, 1),
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const length = curve.getLength();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const corners: [number, number][] = [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
    [-0.5, -0.5],
  ];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    curve.getTangentAt(t, tangent);
    // Width runs along `across` (kept perpendicular to the path), so a strap
    // lies flat on a desk and hangs face-on from its lugs without twisting.
    side.copy(across).addScaledVector(tangent, -across.dot(tangent));
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize();
    normal.crossVectors(side, tangent).normalize();
    for (let k = 0; k < 4; k++) {
      const [a, b] = corners[k];
      positions.push(
        p.x + side.x * a * width + normal.x * b * thickness,
        p.y + side.y * a * width + normal.y * b * thickness,
        p.z + side.z * a * width + normal.z * b * thickness,
      );
      uvs.push((t * length) / width, k === 0 || k === 3 ? 0 : 1);
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let k = 0; k < 4; k++) {
      const a = i * 4 + k,
        b = i * 4 + ((k + 1) % 4),
        c = a + 4,
        d = b + 4;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/* ------------------------------------------------------------- materials */

export function physical(
  environment: THREE.Texture,
  properties: THREE.MeshPhysicalMaterialParameters,
) {
  return new THREE.MeshPhysicalMaterial({
    envMap: environment,
    envMapIntensity: 0.8,
    roughness: 0.5,
    ...properties,
  });
}

export function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  parent?: THREE.Object3D,
) {
  const object = new THREE.Mesh(geometry, material);
  parent?.add(object);
  return object;
}

/** Disposes everything a subtree owns. Borrowed textures can be excluded. */
export function disposeTree(
  root: THREE.Object3D,
  keep: Set<THREE.Texture> = new Set(),
) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    const withGeometry = object as THREE.Mesh;
    if (withGeometry.geometry) geometries.add(withGeometry.geometry);
    const material = (object as THREE.Mesh).material;
    if (material) {
      for (const m of Array.isArray(material) ? material : [material]) {
        materials.add(m);
        for (const value of Object.values(m)) {
          if (value instanceof THREE.Texture && !keep.has(value))
            textures.add(value);
        }
        const uniforms = (m as THREE.ShaderMaterial).uniforms;
        if (uniforms)
          for (const u of Object.values(uniforms))
            if (u.value instanceof THREE.Texture && !keep.has(u.value))
              textures.add(u.value);
      }
    }
    if (object instanceof THREE.InstancedMesh) object.dispose();
    if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
    object.userData.disposed = true;
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
  root.removeFromParent();
}

/** Turns an object so local +Y points along `forward` and local +Z along `facing`. */
export function aim(
  object: THREE.Object3D,
  forward: THREE.Vector3,
  facing: THREE.Vector3,
) {
  const y = forward.clone().normalize();
  const z = facing.clone().addScaledVector(y, -facing.dot(y)).normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  object.quaternion.setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(x, y, z),
  );
}

/* -------------------------------------------------------------- the hand */

export type HandPose = {
  /** index, middle, ring, little: 0 open → 1 closed fist. */
  curl: [number, number, number, number];
  thumb: number;
  spread: number;
};

export type Hand = {
  root: THREE.Group;
  /** Palm centre in hand space: useful for placing contact points. */
  palm: THREE.Vector3;
  /** Distance from the wrist to the middle fingertip when open. */
  reach: number;
  pose: (pose: HandPose) => void;
};

export const openHand: HandPose = {
  curl: [0.12, 0.1, 0.12, 0.16],
  thumb: 0.2,
  spread: 0.6,
};
export const cuppedHand: HandPose = {
  curl: [0.42, 0.45, 0.5, 0.55],
  thumb: 0.45,
  spread: 0.2,
};
export const pinchHand: HandPose = {
  curl: [0.62, 0.7, 0.86, 0.92],
  thumb: 0.9,
  spread: 0.1,
};

export function mixPose(a: HandPose, b: HandPose, t: number): HandPose {
  return {
    curl: a.curl.map((c, i) => lerp(c, b.curl[i], t)) as HandPose["curl"],
    thumb: lerp(a.thumb, b.thumb, t),
    spread: lerp(a.spread, b.spread, t),
  };
}

/* --------------------------------------------------- the glove asset */

type GloveData = {
  positions: Float32Array;
  skinIndex: Uint8Array;
  skinWeight: Uint8Array;
  index: Uint16Array;
};

let glove: Promise<GloveData | null> | null = null;

/**
 * The supplied white-glove model, re-rigged (see gloveRig.ts). Fetched once
 * and shared by every hand; resolves to null if it cannot be loaded, in which
 * case hands simply stay empty rather than breaking a scene.
 */
export function loadGlove() {
  glove ??= fetch(GLOVE_URL)
    .then((response) =>
      response.ok ? response.arrayBuffer() : Promise.reject(),
    )
    .then((buffer) => {
      const n = GLOVE_VERTICES;
      let at = 0;
      const positions = new Float32Array(buffer, at, n * 3);
      at += n * 12;
      const skinIndex = new Uint8Array(buffer, at, n * 4);
      at += n * 4;
      const skinWeight = new Uint8Array(buffer, at, n * 4);
      at += n * 4;
      const index = new Uint16Array(buffer, at, GLOVE_INDICES);
      return { positions, skinIndex, skinWeight, index };
    })
    .catch(() => null);
  return glove;
}

/** Where clay, soil or nothing has rubbed into the glove. */
export type GloveWear = "clean" | "clay";

function gloveGeometry(data: GloveData, wear: GloveWear) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(data.positions, 3),
  );
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint8BufferAttribute(data.skinIndex, 4),
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Uint8BufferAttribute(data.skinWeight, 4, true),
  );
  geometry.setIndex(new THREE.BufferAttribute(data.index, 1));
  geometry.computeVertexNormals();
  // Vertex colour carries the fabric's life: a faint weave mottling, darker
  // seams in the finger creases, and, for the potter, wet slip that is
  // heaviest on the fingertips and the palm that meets the clay.
  const count = data.positions.length / 3;
  const colors = new Float32Array(count * 3);
  const white = new THREE.Color("#f7f4ee");
  const crease = new THREE.Color("#d9d4cc");
  const slip = new THREE.Color("#8f735e");
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const x = data.positions[i * 3],
      y = data.positions[i * 3 + 1],
      z = data.positions[i * 3 + 2];
    const weave =
      0.5 +
      0.5 * Math.sin(x * 61 + Math.sin(y * 37) * 2) * Math.sin(y * 53 + z * 29);
    c.copy(white).lerp(crease, weave * 0.18);
    if (wear === "clay") {
      const blot =
        0.5 +
        0.5 *
          Math.sin(x * 9.1 + y * 4.3) *
          Math.sin(y * 7.7 - z * 5.9 + 1.3) *
          Math.sin(z * 11 + x * 3);
      // Fingertips are soaked, the palm side is smeared, the back stays clean.
      const tips = clamp((y - 1.0) * 1.8);
      const palm = clamp(z * 2.5 + 0.2) * clamp((y - 0.25) * 2.5);
      const amount = clamp(tips * 0.85 + palm * 0.55 + (blot - 0.5) * 0.9);
      c.lerp(slip, amount * 0.8);
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** White satin glove fabric. */
export function gloveMaterials(environment: THREE.Texture) {
  const glove = physical(environment, {
    color: "#ffffff",
    vertexColors: true,
    roughness: 0.58,
    sheen: 0.7,
    sheenColor: new THREE.Color("#ffffff"),
    sheenRoughness: 0.45,
    clearcoat: 0.08,
    envMapIntensity: 0.55,
  });
  return { glove };
}

const starVertex = /* glsl */ `
  attribute float size;
  attribute float phase;
  attribute float fade;
  uniform float uTime;
  uniform float uHalfHeight;
  uniform float uScale;
  varying float vAlpha;
  varying float vCore;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.62 + 0.38 * sin(uTime * (1.4 + fract(phase * 7.0) * 1.8) + phase * 6.2831);
    vAlpha = fade * twinkle;
    vCore = step(0.15, size);
    gl_PointSize = size * uScale * projectionMatrix[1][1] * uHalfHeight / -mv.z * (0.85 + 0.3 * twinkle);
    gl_Position = projectionMatrix * mv;
  }
`;
const starFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vCore;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float halo = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.12, 0.0, d);
    // Bright stars get a faint four-point glint.
    float glint = vCore * (smoothstep(0.035, 0.0, abs(c.x)) + smoothstep(0.035, 0.0, abs(c.y))) * smoothstep(0.5, 0.1, d);
    vec3 colour = mix(uColor, vec3(1.0), clamp(core + glint * 0.6, 0.0, 1.0));
    gl_FragColor = vec4(colour, (halo * halo * 0.85 + core + glint * 0.5) * vAlpha);
    #include <colorspace_fragment>
  }
`;

/**
 * What holds the glove up: not an arm but a little constellation — star
 * nodes joined by fine lavender lines, a drift of twinkling stardust and a
 * glow spilling from the cuff — fading out toward where an elbow would be.
 * Built in hand space (the cuff at the origin, trailing down -Y).
 */
function createConstellation() {
  const group = new THREE.Group();
  group.name = "constellation";
  const lavender = new THREE.Color("#c9b6ff");
  const random = seeded(4242);
  const nodes = [
    [0, -0.28, 0],
    [0.26, -1.0, 0.1],
    [-0.16, -1.8, -0.05],
    [0.34, -2.7, 0.12],
    [0.0, -3.6, 0.0],
    [0.46, -4.5, -0.1],
    [0.12, -5.4, 0.05],
    [-0.72, -2.3, 0.12],
    [-0.52, -4.05, -0.1],
    [0.95, -5.05, 0.0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [2, 7],
    [4, 8],
    [5, 9],
  ];
  const fadeAt = (y: number) => clamp(1 - (-y - 0.2) / 5.6) ** 1.3;

  // Lines: additive, so fading the colour to black fades the line.
  const linePositions: number[] = [];
  const lineColors: number[] = [];
  for (const [a, b] of links) {
    for (const node of [nodes[a], nodes[b]]) {
      linePositions.push(node.x, node.y, node.z);
      const f = fadeAt(node.y) * 0.9;
      lineColors.push(lavender.r * f, lavender.g * f, lavender.b * f);
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3),
  );
  lineGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(lineColors, 3),
  );
  const lines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(lines);

  // Stars at the nodes plus stardust drifting around the path.
  const positions: number[] = [];
  const sizes: number[] = [];
  const phases: number[] = [];
  const fades: number[] = [];
  nodes.forEach((node, i) => {
    positions.push(node.x, node.y, node.z);
    sizes.push(i === 0 ? 0.0 : 0.19 + random() * 0.12);
    phases.push(random());
    fades.push(fadeAt(node.y));
  });
  for (let i = 0; i < 150; i++) {
    const t = Math.pow(random(), 0.8);
    const y = -0.15 - t * 5.6;
    const spread = 0.25 + t * 0.55;
    positions.push(
      (random() - 0.5) * spread * 2 + Math.sin(y * 0.9) * 0.2,
      y,
      (random() - 0.5) * spread * 1.4,
    );
    sizes.push(0.04 + random() * 0.07);
    phases.push(random());
    fades.push(fadeAt(y) * (0.5 + random() * 0.5));
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  starGeometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  starGeometry.setAttribute(
    "phase",
    new THREE.Float32BufferAttribute(phases, 1),
  );
  starGeometry.setAttribute("fade", new THREE.Float32BufferAttribute(fades, 1));
  const uniforms = {
    uTime: { value: 0 },
    uHalfHeight: { value: 400 },
    uScale: { value: 1 },
    uColor: { value: lavender.clone() },
  };
  const stars = new THREE.Points(
    starGeometry,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  stars.frustumCulled = false;
  const size = new THREE.Vector2();
  const scale = new THREE.Vector3();
  stars.onBeforeRender = (renderer) => {
    uniforms.uTime.value = performance.now() / 1000;
    renderer.getDrawingBufferSize(size);
    uniforms.uHalfHeight.value = size.y / 2;
    stars.matrixWorld.decompose(
      new THREE.Vector3(),
      new THREE.Quaternion(),
      scale,
    );
    uniforms.uScale.value = Math.abs(scale.y);
  };
  group.add(stars);

  // Light spilling out of the cuff: a soft disc inside and a halo around it.
  const spill = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 32),
    new THREE.MeshBasicMaterial({
      map: radialTexture("rgba(236,226,255,1)", "rgba(201,182,255,0)"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  spill.rotation.x = Math.PI / 2;
  spill.position.y = -0.08;
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture("rgba(201,182,255,0.75)", "rgba(201,182,255,0)"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  halo.scale.setScalar(1.9);
  halo.position.y = -0.2;
  group.add(spill, halo);
  // Purely decorative: never intercept the pointer.
  group.traverse((o) => (o.raycast = () => {}));
  return group;
}

/**
 * A posable right hand: the supplied cartoon glove, skinned to a finger rig,
 * held up by a small constellation instead of an arm. Mirror with
 * scale.x = -1 for a left hand. Fingers point along +Y, the palm faces +Z,
 * the thumb sits at +X, the cuff centre is the origin.
 */
export function createHand(
  gloveMaterial: THREE.Material,
  wear: GloveWear = "clean",
): Hand {
  const root = new THREE.Group();
  root.name = "hand";
  root.add(createConstellation());

  const bones = GLOVE_BONES.map(([name, , x, y, z]) => {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(x, y, z);
    return bone;
  });
  GLOVE_BONES.forEach(([, parent], i) => {
    if (parent >= 0) {
      const p = GLOVE_BONES[parent];
      bones[i].position.sub(new THREE.Vector3(p[2], p[3], p[4]));
      bones[parent].add(bones[i]);
    }
  });
  const skeletonRoot = bones[0];
  const axes = GLOVE_DIGITS.map((d) => new THREE.Vector3(...d.axis));
  const spreadAxis = new THREE.Vector3(0, 0, 1);
  const fan: Record<string, number> = {
    index: -0.12,
    middle: -0.03,
    ring: 0.05,
    pinky: 0.14,
    thumb: 0,
  };
  const q = new THREE.Quaternion();
  const qs = new THREE.Quaternion();
  let current: HandPose = openHand;

  const pose = (next: HandPose) => {
    current = next;
    GLOVE_DIGITS.forEach((digit, d) => {
      const isThumb = digit.digit === "thumb";
      const c = isThumb
        ? next.thumb
        : next.curl[["index", "middle", "ring", "pinky"].indexOf(digit.digit)];
      const angles = isThumb
        ? [0.15 + c * 0.6, c * 0.85, c * 0.75]
        : [c * 1.15, 0.05 + c * 1.35, 0.03 + c * 0.95];
      digit.bones.forEach((b, k) => {
        q.setFromAxisAngle(axes[d], angles[k]);
        if (k === 0 && !isThumb)
          q.premultiply(
            qs.setFromAxisAngle(
              spreadAxis,
              fan[digit.digit] * (next.spread - 0.4),
            ),
          );
        bones[b].quaternion.copy(q);
      });
    });
  };

  void loadGlove().then((data) => {
    if (!data || root.userData.disposed) return;
    const skinned = new THREE.SkinnedMesh(
      gloveGeometry(data, wear),
      gloveMaterial,
    );
    skinned.name = "glove";
    skinned.add(skeletonRoot);
    skinned.bind(new THREE.Skeleton(bones));
    // Skinned bounds change with the pose; never cull a hand mid-gesture.
    skinned.frustumCulled = false;
    root.add(skinned);
    pose(current);
  });

  pose(openHand);
  return { root, palm: new THREE.Vector3(0, 0.72, 0.18), reach: 1.95, pose };
}
