import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

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

/**
 * A posable right hand with forearm and rolled sleeve, built from tapered
 * capsules with real joints (forward kinematics). Mirror with scale.x = -1 for
 * a left hand. Fingers point along +Y, the palm faces +Z, the thumb sits at +X.
 */
export function createHand(
  skin: THREE.Material,
  nail: THREE.Material,
  sleeve: THREE.Material,
): Hand {
  const root = new THREE.Group();
  root.name = "hand";

  const forearmGeometry = new THREE.CapsuleGeometry(0.25, 2.3, 6, 16);
  {
    const p = forearmGeometry.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const t = clamp((y + 1.4) / 2.8);
      const widen = lerp(1.18, 0.78, t);
      p.setXYZ(i, p.getX(i) * widen * 1.18, y - 1.32, p.getZ(i) * widen * 0.82);
    }
    forearmGeometry.computeVertexNormals();
  }
  mesh(forearmGeometry, skin, root);

  const sleeveGeometry = new THREE.CylinderGeometry(
    0.43,
    0.47,
    2.4,
    22,
    1,
    true,
  );
  sleeveGeometry.translate(0, -3.05, 0);
  const sleeveMesh = mesh(sleeveGeometry, sleeve, root);
  sleeveMesh.scale.set(1.06, 1, 0.88);
  const cuff = mesh(new THREE.TorusGeometry(0.43, 0.085, 10, 26), sleeve, root);
  cuff.rotation.x = Math.PI / 2;
  cuff.position.y = -1.86;
  cuff.scale.set(1.06, 0.88, 1.2);

  // The palm: a rounded block that widens toward the knuckles and is fuller
  // in the middle, plus the thumb's fleshy base and a wrist transition.
  const palmGeometry = new RoundedBoxGeometry(0.86, 0.98, 0.3, 4, 0.14);
  {
    const p = palmGeometry.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const t = clamp((y + 0.49) / 0.98);
      const width = lerp(0.8, 1.02, Math.sqrt(t));
      const belly =
        z > 0 ? 1 + 0.25 * Math.sin(Math.PI * t) * (1 - Math.abs(x) * 1.3) : 1;
      p.setXYZ(i, x * width, y, z * belly);
    }
    palmGeometry.computeVertexNormals();
  }
  palmGeometry.translate(0, 0.5, 0);
  mesh(palmGeometry, skin, root);
  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const thenar = mesh(sphere, skin, root);
  thenar.position.set(0.24, 0.32, 0.07);
  thenar.scale.set(0.22, 0.3, 0.13);
  thenar.rotation.z = -0.4;
  const wrist = mesh(sphere, skin, root);
  wrist.position.set(0, 0.04, 0);
  wrist.scale.set(0.36, 0.22, 0.2);

  type Digit = { joints: THREE.Group[]; kind: "finger" | "thumb" };
  const digits: Digit[] = [];
  const nailGeometry = new THREE.SphereGeometry(1, 12, 8);

  const segment = (
    parent: THREE.Object3D,
    length: number,
    radius: number,
    tipRadius: number,
  ) => {
    const joint = new THREE.Group();
    parent.add(joint);
    const geometry = new THREE.CapsuleGeometry(
      radius,
      Math.max(0.02, length - radius * 0.5),
      5,
      12,
    );
    const p = geometry.getAttribute("position");
    const half = length / 2 + radius;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const taper = lerp(1, tipRadius / radius, clamp((y + half) / (2 * half)));
      p.setXYZ(i, p.getX(i) * taper, y, p.getZ(i) * taper * 0.88);
    }
    geometry.translate(0, length / 2, 0);
    geometry.computeVertexNormals();
    mesh(geometry, skin, joint);
    return joint;
  };

  const fingers = [
    { x: 0.29, lengths: [0.46, 0.28, 0.21], radius: 0.088, fan: -0.1 },
    { x: 0.095, lengths: [0.5, 0.31, 0.22], radius: 0.09, fan: -0.03 },
    { x: -0.1, lengths: [0.47, 0.29, 0.21], radius: 0.085, fan: 0.04 },
    { x: -0.29, lengths: [0.37, 0.23, 0.18], radius: 0.074, fan: 0.12 },
  ];
  for (const finger of fingers) {
    const base = new THREE.Group();
    base.position.set(finger.x, 0.95, 0.01);
    base.userData.fan = finger.fan;
    root.add(base);
    const knuckle = mesh(sphere, skin, base);
    knuckle.position.set(0, 0, -0.035);
    knuckle.scale.set(
      finger.radius * 1.12,
      finger.radius * 0.95,
      finger.radius,
    );
    const joints: THREE.Group[] = [];
    let parent: THREE.Object3D = base;
    let radius = finger.radius;
    finger.lengths.forEach((length, i) => {
      const tip = radius * (i === 2 ? 0.86 : 0.93);
      const joint = segment(parent, length, radius, tip);
      if (i > 0) joint.position.y = finger.lengths[i - 1];
      joints.push(joint);
      parent = joint;
      radius = tip;
    });
    const nailMesh = mesh(nailGeometry, nail, joints[2]);
    nailMesh.position.set(0, finger.lengths[2] * 0.6, -radius * 0.74);
    nailMesh.scale.set(radius * 0.78, finger.lengths[2] * 0.36, radius * 0.28);
    nailMesh.rotation.x = 0.12;
    digits.push({ joints: [base, ...joints], kind: "finger" });
  }
  {
    const base = new THREE.Group();
    base.position.set(0.32, 0.22, 0.06);
    root.add(base);
    const lengths = [0.4, 0.3, 0.24];
    const joints: THREE.Group[] = [];
    let parent: THREE.Object3D = base;
    let radius = 0.118;
    lengths.forEach((length, i) => {
      const tip = radius * 0.88;
      const joint = segment(parent, length, radius, tip);
      if (i > 0) joint.position.y = lengths[i - 1];
      joints.push(joint);
      parent = joint;
      radius = tip;
    });
    const nailMesh = mesh(nailGeometry, nail, joints[2]);
    nailMesh.position.set(0, lengths[2] * 0.58, -radius * 0.76);
    nailMesh.scale.set(radius * 0.8, lengths[2] * 0.36, radius * 0.28);
    digits.push({ joints: [base, ...joints], kind: "thumb" });
  }

  const pose = (next: HandPose) => {
    digits.forEach((digit, index) => {
      const [base, a, b, c] = digit.joints;
      if (digit.kind === "finger") {
        const curl = next.curl[index];
        base.rotation.set(
          0,
          0,
          (base.userData.fan as number) * (0.4 + next.spread),
        );
        a.rotation.x = curl * 1.2;
        b.rotation.x = 0.06 + curl * 1.45;
        c.rotation.x = 0.04 + curl * 0.95;
      } else {
        const t = next.thumb;
        base.rotation.set(0.15 + t * 0.55, -0.35 - t * 0.55, -0.8 + t * 0.42);
        a.rotation.x = 0.1 + t * 0.3;
        b.rotation.x = 0.12 + t * 0.6;
        c.rotation.x = 0.1 + t * 0.55;
      }
    });
  };
  pose(openHand);
  return { root, palm: new THREE.Vector3(0, 0.5, 0.16), reach: 1.95, pose };
}

/** A lightly freckled skin with fine pores. `slip` adds dried clay. */
export function skinMaterials(environment: THREE.Texture, slip = 0) {
  const pores = noiseTexture(128, 911, 3, [6, 6]);
  const map = canvasTexture(
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#a9775d";
      g.fillRect(0, 0, w, h);
      const random = seeded(77);
      for (let i = 0; i < 260; i++) {
        g.fillStyle = `rgba(${120 + random() * 40},${70 + random() * 30},${55 + random() * 20},${0.08 + random() * 0.08})`;
        g.beginPath();
        g.arc(random() * w, random() * h, 2 + random() * 9, 0, Math.PI * 2);
        g.fill();
      }
      if (slip) {
        for (let i = 0; i < 140 * slip; i++) {
          g.fillStyle = `rgba(${165 + random() * 30},${140 + random() * 25},${120 + random() * 20},${0.12 + random() * 0.2})`;
          g.beginPath();
          g.ellipse(
            random() * w,
            random() * h,
            3 + random() * 10,
            2 + random() * 5,
            random() * 3,
            0,
            Math.PI * 2,
          );
          g.fill();
        }
      }
    },
    { color: true, repeat: [2, 2] },
  );
  const skin = physical(environment, {
    map,
    roughness: 0.62,
    sheen: 0.55,
    sheenColor: new THREE.Color("#ffc1a6"),
    sheenRoughness: 0.55,
    bumpMap: pores,
    bumpScale: 0.6,
    envMapIntensity: 0.55,
  });
  const nail = physical(environment, {
    color: "#d8aa98",
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
  });
  const sleeve = physical(environment, {
    color: "#545b63",
    roughness: 0.92,
    sheen: 0.6,
    sheenColor: new THREE.Color("#8e96a3"),
    bumpMap: noiseTexture(64, 41, 2, [8, 8]),
    bumpScale: 1.4,
    envMapIntensity: 0.4,
  });
  return { skin, nail, sleeve };
}
