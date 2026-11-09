import * as THREE from "three";
import {
  canvasTexture,
  clamp,
  contactShadow,
  damp,
  disposeTree,
  easeInOut,
  type Exhibit,
  type ExhibitContext,
  lerp,
  mesh,
  noiseTexture,
  type Phase,
  physical,
  type PointerInfo,
  radialTexture,
  seeded,
  seg,
  smooth,
} from "./kit";

/*
 * Instant photography: an unbranded instant camera with a real lens assembly
 * (rings, three glass elements, a seven-blade iris), a flash and a film slot.
 * Focus → shutter → flash → a print ejects → the image develops → prints
 * gather into a pinned composition. Every print's motion is a pure function of
 * the time since its own shot, so repeated clicks queue cleanly.
 *
 * The photographs are fixed, licensed crops shipped with the site
 * (public/landing/instant). Nothing is generated at runtime.
 */

export const INSTANT_PHOTOS = [
  "/landing/instant/studio-hands.webp",
  "/landing/instant/forest-canopy.webp",
  "/landing/instant/forest-walker.webp",
  "/landing/instant/studio-shelves.webp",
  "/landing/instant/forest-roots.webp",
  "/landing/instant/forest-moss.webp",
];

const PRINT_W = 0.6;
const PRINT_H = 0.73;
const IMAGE = 0.52;
const IMAGE_Y = (PRINT_H - IMAGE) / 2 - 0.04;

// Board slots, in board space: x, y, tilt.
const SLOTS: [number, number, number][] = [
  [-0.62, 0.36, -0.09],
  [0.08, 0.44, 0.05],
  [0.72, 0.3, -0.04],
  [-0.48, -0.4, 0.07],
  [0.2, -0.32, -0.06],
  [0.8, -0.42, 0.08],
];

// Per-shot timeline (seconds after the shutter fires).
const SHOT = {
  eject: 0.18,
  ejected: 1.25,
  lift: 1.85,
  hold: 3.0,
  board: 3.8,
  developed: 5.2,
};
const QUICK = {
  eject: 0.18,
  ejected: 0.95,
  lift: 1.4,
  hold: 1.4,
  board: 2.3,
  developed: 3.1,
};
const FOCUS = 0.85;

const developVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const developFragment = /* glsl */ `
  uniform sampler2D map;
  uniform float develop;
  uniform float glow;
  varying vec2 vUv;
  void main() {
    vec3 img = texture2D(map, vUv).rgb;
    float lum = dot(img, vec3(0.299, 0.587, 0.114));
    vec3 blank = vec3(0.105, 0.13, 0.135);
    // Instant film: a dark blank, then a cool ghost of the shadows, then
    // warm mid-tones, and full colour arriving last.
    vec3 ghost = mix(blank, vec3(lum) * vec3(0.78, 0.86, 0.95) + 0.03, smoothstep(0.0, 0.55, develop));
    vec3 colour = mix(ghost, img * vec3(1.04, 1.0, 0.94), smoothstep(0.35, 1.0, develop));
    vec2 c = vUv - 0.5;
    colour *= 1.0 - dot(c, c) * 0.55;
    gl_FragColor = vec4(colour * (0.92 + glow * 0.18), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

type Shot = { start: number; print: Print; quick: boolean };
type Print = {
  group: THREE.Group;
  face: THREE.Mesh;
  uniforms: {
    map: { value: THREE.Texture };
    develop: { value: number };
    glow: { value: number };
  };
  slot: number;
  offset: THREE.Vector2;
  hover: number;
  shot: Shot | null;
  onBoard: boolean;
};

function roundedRect(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const l = -width / 2,
    r = width / 2,
    b = -height / 2,
    t = height / 2;
  shape.moveTo(l + radius, b);
  shape.lineTo(r - radius, b);
  shape.quadraticCurveTo(r, b, r, b + radius);
  shape.lineTo(r, t - radius);
  shape.quadraticCurveTo(r, t, r - radius, t);
  shape.lineTo(l + radius, t);
  shape.quadraticCurveTo(l, t, l, t - radius);
  shape.lineTo(l, b + radius);
  shape.quadraticCurveTo(l, b, l + radius, b);
  return shape;
}

function roundedBody(
  width: number,
  height: number,
  depth: number,
  radius: number,
  bevel = 0.035,
) {
  const geometry = new THREE.ExtrudeGeometry(
    roundedRect(width, height, radius),
    {
      depth: Math.max(0.001, depth - bevel * 2),
      steps: 1,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments: 10,
    },
  );
  geometry.translate(0, 0, -depth / 2 + bevel);
  return geometry;
}

export function createPhotography(context: ExhibitContext): Exhibit {
  const env = context.environment;
  const root = new THREE.Group();
  root.name = "photography";
  const random = seeded(12);

  /* ------------------------------------------------------------ materials */
  const shell = physical(env, {
    color: "#e9e1d2",
    roughness: 0.46,
    clearcoat: 0.3,
    clearcoatRoughness: 0.5,
    bumpMap: noiseTexture(128, 21, 2, [6, 6]),
    bumpScale: 0.35,
  });
  const leatherette = physical(env, {
    color: "#1f2a44",
    roughness: 0.82,
    sheen: 0.4,
    sheenColor: new THREE.Color("#6f7fae"),
    bumpMap: noiseTexture(256, 7, 2.2, [5, 4]),
    bumpScale: 1.6,
  });
  const aluminium = physical(env, {
    color: "#cfcdc6",
    metalness: 0.92,
    roughness: 0.24,
    bumpMap: canvasTexture(256, 16, (g, w, h) => {
      for (let x = 0; x < w; x++) {
        g.fillStyle = `rgb(${120 + random() * 40},${120 + random() * 40},${120 + random() * 40})`;
        g.fillRect(x, 0, 1, h);
      }
    }),
    bumpScale: 0.12,
  });
  const anodised = physical(env, {
    color: "#15181d",
    metalness: 0.6,
    roughness: 0.38,
  });
  const rubber = physical(env, {
    color: "#101317",
    roughness: 0.9,
    bumpMap: noiseTexture(64, 99, 2, [8, 2]),
    bumpScale: 0.8,
  });
  const well = new THREE.MeshStandardMaterial({
    color: "#020305",
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const lavender = physical(env, {
    color: "#a993d6",
    roughness: 0.35,
    clearcoat: 0.6,
    metalness: 0.1,
  });
  const cream = physical(env, { color: "#efe6d4", roughness: 0.5 });
  const glass = (tint: string, opacity: number) =>
    physical(env, {
      color: tint,
      roughness: 0.04,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      transparent: true,
      opacity,
      envMapIntensity: 2.2,
      depthWrite: false,
    });
  const blade = physical(env, {
    color: "#0b0c0f",
    metalness: 0.7,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });
  const flashWindow = physical(env, {
    color: "#f5f2ea",
    roughness: 0.15,
    transmission: 0,
    transparent: true,
    opacity: 0.88,
    emissive: new THREE.Color("#fff6e8"),
    emissiveIntensity: 0,
    emissiveMap: canvasTexture(128, 64, (g, w, h) => {
      g.fillStyle = "#aaa";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 6) {
        g.fillStyle = "#fff";
        g.fillRect(x, 0, 3, h);
      }
    }),
  });
  const board = physical(env, {
    map: canvasTexture(
      256,
      256,
      (g, w, h) => {
        g.fillStyle = "#b3a891";
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 4000; i++) {
          g.fillStyle = `rgba(${90 + random() * 60},${80 + random() * 50},${60 + random() * 40},${0.08 + random() * 0.1})`;
          g.fillRect(random() * w, random() * h, 1 + random() * 2, 1);
        }
      },
      { color: true, repeat: [2, 2] },
    ),
    roughness: 0.95,
    bumpMap: noiseTexture(128, 31, 2, [6, 6]),
    bumpScale: 0.8,
  });
  const frame = physical(env, { color: "#2b3446", roughness: 0.55 });
  const table = physical(env, {
    color: "#1c2333",
    roughness: 0.6,
    clearcoat: 0.2,
    bumpMap: noiseTexture(256, 2, 12, [2, 2]),
    bumpScale: 0.6,
  });
  const paper = physical(env, {
    color: "#f4f1ea",
    roughness: 0.62,
    bumpMap: noiseTexture(64, 4, 1.5, [3, 3]),
    bumpScale: 0.25,
  });
  const filmBack = new THREE.MeshStandardMaterial({
    color: "#121316",
    roughness: 0.6,
  });

  /* ------------------------------------------------------------ the set */
  const surface = mesh(roundedBody(5.6, 3.4, 0.14, 0.4, 0.03), table, root);
  surface.rotation.x = -Math.PI / 2;
  surface.position.set(0.35, -0.86, 0);
  const shadow = contactShadow(2.6, 1.9, 0.6);
  shadow.position.set(-0.62, -0.785, 0.2);
  root.add(shadow);

  const pinboard = new THREE.Group();
  pinboard.position.set(1.5, 0.42, -0.85);
  pinboard.rotation.set(-0.06, -0.32, 0);
  root.add(pinboard);
  mesh(roundedBody(2.5, 1.95, 0.08, 0.06, 0.02), frame, pinboard);
  const linen = mesh(new THREE.PlaneGeometry(2.36, 1.82), board, pinboard);
  linen.position.z = 0.045;
  const boardShadow = contactShadow(2.8, 0.7, 0.4);
  boardShadow.position.set(1.5, -0.785, -0.6);
  root.add(boardShadow);

  /* -------------------------------------------------------------- camera */
  const camera = new THREE.Group();
  camera.position.set(-0.62, -0.05, 0.25);
  root.add(camera);
  const body = mesh(roundedBody(1.95, 1.32, 1.05, 0.2, 0.06), shell, camera);
  body.name = "camera-body";
  const front = mesh(
    roundedBody(1.83, 0.9, 0.04, 0.12, 0.012),
    leatherette,
    camera,
  );
  front.position.set(0, -0.08, 0.53);
  const topPlate = mesh(roundedBody(1.9, 0.08, 1.0, 0.04, 0.02), cream, camera);
  topPlate.position.y = 0.65;
  for (const x of [-0.7, 0.7]) {
    const foot = mesh(
      new THREE.CylinderGeometry(0.08, 0.09, 0.05, 20),
      rubber,
      camera,
    );
    foot.position.set(x, -0.68, 0.25);
  }
  // Film slot and door seam.
  const slot = mesh(
    roundedBody(PRINT_W + 0.12, 0.035, 0.06, 0.015, 0.008),
    well,
    camera,
  );
  slot.position.set(0, -0.535, 0.535);
  const lip = mesh(
    roundedBody(PRINT_W + 0.22, 0.03, 0.08, 0.015, 0.01),
    anodised,
    camera,
  );
  lip.position.set(0, -0.575, 0.53);
  const seam = mesh(new THREE.BoxGeometry(1.86, 0.008, 0.01), well, camera);
  seam.position.set(0, -0.47, 0.552);

  // Lens: mount, focus ring with grip, aperture ring with ticks, bezel, a
  // recessed iris and three glass elements.
  const lens = new THREE.Group();
  lens.position.set(0.12, -0.02, 0.53);
  camera.add(lens);
  const ring = (
    radius: number,
    depth: number,
    z: number,
    material: THREE.Material,
    open = false,
  ) => {
    const object = mesh(
      new THREE.CylinderGeometry(radius, radius, depth, 72, 1, open),
      material,
      lens,
    );
    object.rotation.x = Math.PI / 2;
    object.position.z = z;
    return object;
  };
  ring(0.5, 0.05, 0.025, aluminium);
  const barrel = new THREE.Group();
  lens.add(barrel);
  const moving = (
    radius: number,
    depth: number,
    z: number,
    material: THREE.Material,
    open = false,
  ) => {
    const object = ring(radius, depth, z, material, open);
    barrel.add(object);
    return object;
  };
  moving(0.46, 0.14, 0.12, anodised);
  const focusRing = new THREE.Group();
  focusRing.position.z = 0.12;
  barrel.add(focusRing);
  const ribs = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.03, 0.04, 0.12),
    rubber,
    48,
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 0.47, Math.sin(a) * 0.47, 0);
    dummy.rotation.set(0, 0, a);
    dummy.updateMatrix();
    ribs.setMatrixAt(i, dummy.matrix);
  }
  focusRing.add(ribs);
  const focusMark = mesh(
    new THREE.BoxGeometry(0.018, 0.05, 0.02),
    lavender,
    focusRing,
  );
  focusMark.position.set(0, 0.49, 0.06);
  moving(0.43, 0.13, 0.25, aluminium);
  const apertureRing = new THREE.Group();
  apertureRing.position.z = 0.25;
  barrel.add(apertureRing);
  const ticks = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.008, 0.035, 0.01),
    anodised,
    9,
  );
  for (let i = 0; i < 9; i++) {
    const a = Math.PI / 2 + (i - 4) * 0.16;
    dummy.position.set(Math.cos(a) * 0.432, Math.sin(a) * 0.432, 0.02);
    dummy.rotation.set(0, 0, a - Math.PI / 2);
    dummy.updateMatrix();
    ticks.setMatrixAt(i, dummy.matrix);
  }
  apertureRing.add(ticks);
  moving(0.4, 0.08, 0.35, anodised);
  const bezel = mesh(new THREE.RingGeometry(0.255, 0.4, 72), anodised, barrel);
  bezel.position.z = 0.392;
  const bezelEdge = mesh(
    new THREE.TorusGeometry(0.4, 0.012, 8, 72),
    aluminium,
    barrel,
  );
  bezelEdge.position.z = 0.39;
  const innerTube = moving(0.255, 0.5, 0.15, well, true);
  innerTube.material = well;
  const back = mesh(new THREE.CircleGeometry(0.256, 48), well, barrel);
  back.position.z = -0.09;
  // A dark baffle in front of the iris hides the blades' outer ends.
  const baffle = mesh(new THREE.RingGeometry(0.25, 0.455, 64), well, barrel);
  baffle.position.z = 0.112;
  // The iris sits inside the tube, behind the front element.
  const iris = new THREE.Group();
  iris.position.z = 0.1;
  barrel.add(iris);
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.17, 0);
  bladeShape.quadraticCurveTo(0, -0.03, 0.17, 0);
  bladeShape.lineTo(0.16, 0.22);
  bladeShape.lineTo(-0.16, 0.22);
  bladeShape.closePath();
  const bladeGeometry = new THREE.ShapeGeometry(bladeShape, 6);
  const blades: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const b = mesh(bladeGeometry, blade, iris);
    b.position.z = i * 0.0015;
    blades.push(b);
  }
  const setAperture = (opening: number) => {
    const a = lerp(0.008, 0.2, opening);
    blades.forEach((b, i) => {
      const theta = (i / 7) * Math.PI * 2;
      b.position.x = Math.cos(theta) * a;
      b.position.y = Math.sin(theta) * a;
      b.rotation.z = theta - Math.PI / 2 + 0.32;
    });
  };
  const element = (
    radius: number,
    z: number,
    cap: number,
    tint: string,
    opacity: number,
  ) => {
    const geometry = new THREE.SphereGeometry(
      radius / Math.sin(cap),
      48,
      12,
      0,
      Math.PI * 2,
      0,
      cap,
    );
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, -(radius / Math.sin(cap)) * Math.cos(cap));
    const object = mesh(geometry, glass(tint, opacity), barrel);
    object.position.z = z;
    object.renderOrder = 2;
    return object;
  };
  element(0.25, 0.37, 0.55, "#8fa3d6", 0.28);
  element(0.24, 0.24, 0.35, "#a98fd0", 0.2);
  element(0.22, 0.02, 0.4, "#86c0b0", 0.16);
  const glint = mesh(
    new THREE.RingGeometry(0.12, 0.135, 48, 1, 0.6, 1.3),
    new THREE.MeshBasicMaterial({
      color: "#d9cdfb",
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    }),
    barrel,
  );
  glint.position.z = 0.43;

  // Flash, viewfinder, shutter button, dial, lugs.
  const flash = mesh(
    roundedBody(0.5, 0.26, 0.05, 0.05, 0.015),
    flashWindow,
    camera,
  );
  flash.position.set(-0.62, 0.38, 0.535);
  const flashBezel = mesh(
    roundedBody(0.56, 0.32, 0.03, 0.07, 0.012),
    anodised,
    camera,
  );
  flashBezel.position.set(-0.62, 0.38, 0.515);
  const flashGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture("rgba(255,248,232,1)", "rgba(255,248,232,0)"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  flashGlow.position.set(-0.62, 0.38, 0.7);
  camera.add(flashGlow);
  const flashLight = new THREE.PointLight("#fff2dd", 0, 7, 1.6);
  flashLight.position.set(-0.62, 0.38, 0.9);
  camera.add(flashLight);
  const finder = mesh(
    roundedBody(0.3, 0.2, 0.05, 0.04, 0.012),
    glass("#5b6d8f", 0.75),
    camera,
  );
  finder.position.set(0.66, 0.42, 0.535);
  const finderBezel = mesh(
    roundedBody(0.36, 0.26, 0.03, 0.05, 0.01),
    anodised,
    camera,
  );
  finderBezel.position.set(0.66, 0.42, 0.515);
  const eyepiece = mesh(
    roundedBody(0.34, 0.26, 0.08, 0.08, 0.02),
    rubber,
    camera,
  );
  eyepiece.position.set(0.66, 0.42, -0.55);
  const shutter = new THREE.Group();
  shutter.position.set(0.62, 0.69, 0.18);
  camera.add(shutter);
  const shutterCollar = mesh(
    new THREE.CylinderGeometry(0.15, 0.16, 0.05, 40),
    aluminium,
    camera,
  );
  shutterCollar.position.set(0.62, 0.705, 0.18);
  const shutterButton = mesh(
    new THREE.CylinderGeometry(0.105, 0.11, 0.08, 40),
    lavender,
    shutter,
  );
  shutterButton.position.y = 0.06;
  shutterButton.name = "shutter";
  const shutterHalo = mesh(
    new THREE.TorusGeometry(0.13, 0.008, 6, 48),
    new THREE.MeshBasicMaterial({
      color: "#d8c8ff",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    shutter,
  );
  shutterHalo.rotation.x = Math.PI / 2;
  shutterHalo.position.y = 0.1;
  const dial = mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.07, 48),
    anodised,
    camera,
  );
  dial.position.set(-0.55, 0.725, 0.05);
  const knurl = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.012, 0.06, 0.02),
    aluminium,
    40,
  );
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 0.172, 0, Math.sin(a) * 0.172);
    dummy.rotation.set(0, -a, 0);
    dummy.updateMatrix();
    knurl.setMatrixAt(i, dummy.matrix);
  }
  dial.add(knurl);
  const dialMark = mesh(
    new THREE.BoxGeometry(0.02, 0.01, 0.08),
    lavender,
    dial,
  );
  dialMark.position.set(0, 0.04, 0.1);
  for (const x of [-1, 1]) {
    const lug = mesh(
      new THREE.TorusGeometry(0.07, 0.02, 8, 20),
      aluminium,
      camera,
    );
    lug.position.set(x * 0.99, 0.42, 0);
    lug.rotation.y = Math.PI / 2;
  }
  const counter = mesh(
    roundedBody(0.22, 0.12, 0.02, 0.03, 0.008),
    glass("#20252e", 0.9),
    camera,
  );
  counter.position.set(-0.6, -0.25, -0.535);

  /* -------------------------------------------------------------- prints */
  const loader = new THREE.TextureLoader();
  const textures = INSTANT_PHOTOS.map((url) => {
    const t = loader.load(url, () => (dirty = true));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });
  const printBody = roundedBody(PRINT_W, PRINT_H, 0.01, 0.012, 0.003);
  const faceGeometry = new THREE.PlaneGeometry(IMAGE, IMAGE);
  const prints: Print[] = Array.from({ length: SLOTS.length }, (_, i) => {
    const group = new THREE.Group();
    group.visible = false;
    root.add(group);
    const card = mesh(printBody, paper, group);
    card.name = "print";
    const backing = mesh(
      new THREE.PlaneGeometry(PRINT_W - 0.01, PRINT_H - 0.01),
      filmBack,
      group,
    );
    backing.rotation.y = Math.PI;
    backing.position.z = -0.0056;
    const uniforms = {
      map: { value: textures[i] },
      develop: { value: 1 },
      glow: { value: 0 },
    };
    const face = mesh(
      faceGeometry,
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: developVertex,
        fragmentShader: developFragment,
      }),
      group,
    );
    face.position.set(0, IMAGE_Y, 0.0056);
    const pin = mesh(new THREE.SphereGeometry(0.03, 12, 8), lavender, group);
    pin.position.set(0, PRINT_H / 2 - 0.05, 0.02);
    pin.name = "pin";
    group.userData.pin = pin;
    return {
      group,
      face,
      uniforms,
      slot: i,
      offset: new THREE.Vector2(),
      hover: 0,
      shot: null,
      onBoard: false,
    };
  });

  /* --------------------------------------------------------------- state */
  let clock = 0;
  let phase: Phase = "idle";
  let shots: Shot[] = [];
  let photoIndex = 0;
  let nextPrint = 0;
  let lastFire = -10;
  let focusStart = -10;
  let queued: { at: number; quick: boolean }[] = [];
  let hoveredPrint: Print | null = null;
  let hoverShutter = false;
  let dragging: Print | null = null;
  let enlarged: Print | null = null;
  let enlargeAmount = 0;
  let dirty = true;
  const look = new THREE.Vector2();
  const lookTarget = new THREE.Vector2();
  const inverse = new THREE.Matrix4();
  const localRay = new THREE.Ray();
  const plane = new THREE.Plane();
  const point = new THREE.Vector3();

  const setPhase = (next: Phase, message?: string) => {
    if (phase === next) return;
    phase = next;
    exhibit.phase = next;
    context.phase(next, message);
  };

  function boardPose(
    print: Print,
    out: { position: THREE.Vector3; quaternion: THREE.Quaternion },
  ) {
    const [x, y, tilt] = SLOTS[print.slot];
    out.position
      .set(
        x + print.offset.x,
        y + print.offset.y,
        0.06 + print.hover * 0.06 + print.slot * 0.004,
      )
      .applyMatrix4(pinboard.matrix);
    out.quaternion
      .copy(pinboard.quaternion)
      .multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          tilt,
        ),
      );
  }

  const slotPose = () => {
    camera.updateMatrix();
    const position = new THREE.Vector3(0, -0.53, 0.5).applyMatrix4(
      camera.matrix,
    );
    const quaternion = camera.quaternion
      .clone()
      .multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-Math.PI / 2, 0, Math.PI),
        ),
      );
    return { position, quaternion };
  };
  const ejectDirection = () =>
    new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
  const holdPose = (quick: boolean, index: number) => ({
    position: quick
      ? new THREE.Vector3(0.95 + index * 0.12, 0.15, 1.15)
      : new THREE.Vector3(1.0, 0.25, 1.4),
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-0.12, -0.28, quick ? 0.08 : -0.05),
    ),
  });

  const pose = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
  };
  function placePrint(print: Print) {
    const shot = print.shot;
    if (!shot) return;
    const t = clock - shot.start;
    const k = shot.quick ? QUICK : SHOT;
    const g = print.group;
    if (t < k.eject) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const slotAt = slotPose();
    const out = ejectDirection();
    // Motor-driven ejection: it shudders out in short pulses.
    const e = seg(t, k.eject, k.ejected);
    const pulse = e + Math.sin(e * Math.PI * 9) * 0.018 * (1 - e);
    const ejectPos = slotAt.position
      .clone()
      .addScaledVector(out, -PRINT_H * 0.5 + pulse * PRINT_H * 0.9);
    const ejectQuat = slotAt.quaternion;
    const hold = holdPose(shot.quick, shots.indexOf(shot));
    boardPose(print, pose);
    if (t < k.ejected) {
      g.position.copy(ejectPos);
      g.quaternion.copy(ejectQuat);
    } else if (t < k.lift) {
      const p = easeInOut(seg(t, k.ejected, k.lift));
      g.position.lerpVectors(ejectPos, hold.position, p);
      g.position.y += Math.sin(p * Math.PI) * 0.25;
      g.quaternion.slerpQuaternions(ejectQuat, hold.quaternion, p);
    } else if (t < k.hold) {
      g.position.copy(hold.position);
      g.position.y += Math.sin((t - k.lift) * 2.2) * 0.012;
      g.quaternion.copy(hold.quaternion);
    } else if (t < k.board) {
      const p = easeInOut(seg(t, k.hold, k.board));
      g.position.lerpVectors(hold.position, pose.position, p);
      g.position.z += Math.sin(p * Math.PI) * 0.35;
      g.quaternion.slerpQuaternions(hold.quaternion, pose.quaternion, p);
    } else {
      print.onBoard = true;
      g.position.copy(pose.position);
      g.quaternion.copy(pose.quaternion);
    }
    print.uniforms.develop.value = smooth(seg(t, k.ejected - 0.2, k.developed));
    (g.userData.pin as THREE.Mesh).visible = t >= k.board;
  }

  function placeBoardPrint(print: Print) {
    boardPose(print, pose);
    print.group.position.copy(pose.position);
    print.group.quaternion.copy(pose.quaternion);
  }

  function fire(quick: boolean) {
    const print = prints[nextPrint % prints.length];
    nextPrint++;
    print.uniforms.map.value = textures[photoIndex % textures.length];
    photoIndex++;
    print.slot = (nextPrint - 1) % SLOTS.length;
    print.offset.set(0, 0);
    print.onBoard = false;
    print.uniforms.develop.value = 0;
    if (enlarged === print) enlarged = null;
    const shot = { start: clock, print, quick };
    print.shot = shot;
    shots = shots.filter((s) => s.print !== print).concat(shot);
    lastFire = clock;
  }

  function takePhoto(quick = false) {
    if (context.still()) {
      fire(true);
      const shot = shots[shots.length - 1];
      shot.start = clock - 10;
      lastFire = focusStart = clock - 10;
      placePrint(shot.print);
      setPhase("completed", "Photo taken and pinned to the board.");
      dirty = true;
      return;
    }
    focusStart = clock;
    queued.push({ at: clock + (quick ? 0.25 : FOCUS), quick });
    setPhase("active");
    dirty = true;
  }

  function reset() {
    clock = 0;
    shots = [];
    queued = [];
    photoIndex = 0;
    nextPrint = 0;
    enlarged = null;
    enlargeAmount = 0;
    lastFire = focusStart = -10;
    prints.forEach((p) => {
      p.shot = null;
      p.onBoard = false;
      p.group.visible = false;
      p.group.scale.setScalar(1);
    });
    // Two earlier photos are already pinned, so the board starts a story.
    for (const i of [4, 5]) {
      const p = prints[i];
      p.slot = i;
      p.offset.set(0, 0);
      p.uniforms.map.value = textures[i];
      p.shot = { start: -100, print: p, quick: true };
      p.onBoard = true;
      p.group.visible = true;
      (p.group.userData.pin as THREE.Mesh).visible = true;
      placeBoardPrint(p);
    }
    setPhase("idle");
    context.stage("Loaded with instant film · 6 exposures");
    dirty = true;
  }

  function play() {
    if (phase === "idle" && !context.still()) {
      // The full sequence: one considered shot, then two quick ones; all
      // three end up arranged on the board.
      takePhoto();
      queued.push(
        { at: clock + FOCUS + 2.4, quick: true },
        { at: clock + FOCUS + 3.3, quick: true },
      );
      return;
    }
    if (phase === "idle") {
      finish();
      return;
    }
    takePhoto(phase === "active");
  }

  function finish() {
    queued = [];
    if (shots.length < 3) {
      while (shots.length < 3) fire(true);
    }
    for (const s of shots) s.start = clock - 10;
    lastFire = focusStart = clock - 10;
    shots.forEach((s) => placePrint(s.print));
    setPhase("completed", "Three instant photos developed and pinned.");
    dirty = true;
  }

  const toLocal = (info: PointerInfo) => {
    root.updateMatrixWorld();
    inverse.copy(root.matrixWorld).invert();
    return localRay.copy(info.ray).applyMatrix4(inverse);
  };
  const printOf = (object: THREE.Object3D | undefined) =>
    object
      ? (prints.find((p) => p.group === object || p.group === object.parent) ??
        null)
      : null;
  const isCamera = (object: THREE.Object3D | undefined) => {
    for (let o = object; o; o = o.parent ?? undefined)
      if (o === camera) return true;
    return false;
  };

  function stageText() {
    const since = clock - lastFire;
    if (phase === "idle") return "Loaded with instant film · 6 exposures";
    if (clock - focusStart < FOCUS && queued.length) return "Focusing…";
    if (since < 0.35) return "Click. Flash.";
    if (since < 1.3) return "Ejecting the print";
    if (since < 5.2) return "Developing…";
    return `${shots.filter((s) => s.print.onBoard).length} photos on the board`;
  }

  const exhibit: Exhibit = {
    id: "photography",
    root,
    view: {
      target: new THREE.Vector3(0.35, 0.15, 0),
      distance: 8.2,
      height: 1.4,
    },
    pickables: [camera, ...prints.map((p) => p.group), pinboard, surface],
    phase,
    label: () => (phase === "idle" ? "Take a photo" : "Another photo"),
    play,
    finish,
    reset,
    update(dt) {
      clock += dt;
      let moving = false;
      // Fire queued shutters.
      while (queued.length && queued[0].at <= clock) {
        const next = queued.shift()!;
        fire(next.quick);
      }
      // Camera mechanisms.
      const sinceFocus = clock - focusStart;
      const sinceFire = clock - lastFire;
      const focusing = sinceFocus < FOCUS + 0.4;
      focusRing.rotation.z = focusing
        ? Math.sin(seg(sinceFocus, 0, FOCUS) * Math.PI) * 0.7
        : 0;
      barrel.position.z = focusing
        ? 0.05 * Math.sin(seg(sinceFocus, 0, FOCUS) * Math.PI * 0.5)
        : damp(barrel.position.z, 0, 4, dt);
      apertureRing.rotation.z = focusing
        ? -0.25 * smooth(seg(sinceFocus, 0.2, FOCUS))
        : damp(apertureRing.rotation.z, 0, 3, dt);
      let opening =
        1 - 0.55 * (focusing ? smooth(seg(sinceFocus, 0.2, FOCUS)) : 0);
      if (sinceFire >= 0 && sinceFire < 0.2)
        opening = sinceFire < 0.03 || sinceFire > 0.14 ? 0.02 : 1;
      setAperture(opening);
      const press =
        sinceFire >= -0.1 && sinceFire < 0.25
          ? Math.sin(seg(sinceFire, -0.1, 0.25) * Math.PI)
          : 0;
      shutterButton.position.y = 0.06 - press * 0.035;
      const flashPower =
        sinceFire >= 0.05 && sinceFire < 0.5
          ? Math.exp(-(sinceFire - 0.05) * 14)
          : 0;
      flashLight.intensity = flashPower * 26;
      (flash.material as THREE.MeshPhysicalMaterial).emissiveIntensity =
        flashPower * 6;
      flashGlow.material.opacity = flashPower;
      flashGlow.scale.setScalar(0.6 + flashPower * 2.4);
      shutterHalo.material.opacity = damp(
        shutterHalo.material.opacity,
        hoverShutter && phase !== "active" ? 0.9 : 0,
        10,
        dt,
      );
      // The camera turns a little toward the cursor; it breathes when idle.
      look.x = damp(look.x, lookTarget.x, 5, dt);
      look.y = damp(look.y, lookTarget.y, 5, dt);
      camera.rotation.set(
        -look.y * 0.18 + Math.sin(clock * 0.8) * 0.006,
        look.x * 0.32,
        Math.sin(clock * 0.6) * 0.004,
      );
      camera.position.y =
        -0.05 +
        (press ? -0.006 * press : 0) +
        (flashPower ? Math.sin(sinceFire * 120) * 0.004 * flashPower : 0);
      // Prints.
      for (const print of prints) {
        print.hover = damp(
          print.hover,
          print === hoveredPrint || print === dragging ? 1 : 0,
          10,
          dt,
        );
        if (print.shot && !print.onBoard) placePrint(print);
        else if (print.onBoard && print.shot) {
          placeBoardPrint(print);
          print.uniforms.develop.value = smooth(
            seg(
              clock - print.shot.start,
              0,
              (print.shot.quick ? QUICK : SHOT).developed,
            ),
          );
        }
        print.uniforms.glow.value = print.hover;
      }
      // Enlarged print flies to the front, facing the viewer.
      enlargeAmount = damp(enlargeAmount, enlarged ? 1 : 0, 7, dt);
      if (enlarged && enlargeAmount > 0.001) {
        const g = enlarged.group;
        const target = new THREE.Vector3(0.35, 0.3, 2.5);
        g.position.lerp(target, enlargeAmount);
        g.quaternion.slerp(new THREE.Quaternion(), enlargeAmount);
        g.scale.setScalar(lerp(1, 2.6, enlargeAmount));
      }
      prints.forEach((p) => {
        if (p !== enlarged && p.group.scale.x !== 1)
          p.group.scale.setScalar(damp(p.group.scale.x, 1, 8, dt));
      });
      // Completion: every shot pinned and no shutter waiting.
      const busy =
        queued.length > 0 ||
        shots.some((s) => clock - s.start < (s.quick ? QUICK : SHOT).developed);
      if (phase === "active" && !busy)
        setPhase(
          "completed",
          `${shots.length} instant ${shots.length === 1 ? "photo" : "photos"} developed and pinned.`,
        );
      context.stage(stageText());
      moving = true; // idle breathing and pointer look keep a gentle loop
      if (dirty) dirty = false;
      return moving;
    },
    hover(info) {
      if (!info) {
        hoveredPrint = null;
        hoverShutter = false;
        lookTarget.set(0, 0);
        context.cursor("default");
        return;
      }
      const ray = toLocal(info);
      plane.set(new THREE.Vector3(0, 0, 1), -2.2);
      if (ray.intersectPlane(plane, point)) {
        lookTarget.set(
          clamp((point.x - camera.position.x) / 3, -1, 1),
          clamp((point.y - 0.1) / 2.2, -1, 1),
        );
      }
      const object = info.hit?.object;
      const print = printOf(object);
      hoveredPrint = print?.onBoard || print === enlarged ? print : null;
      hoverShutter = isCamera(object);
      context.cursor(
        hoveredPrint ? "grab" : hoverShutter ? "pointer" : "default",
      );
    },
    click(info) {
      const object = info.hit?.object;
      const print = printOf(object);
      if (enlarged) {
        enlarged = null;
        return;
      }
      if (print?.onBoard) {
        enlarged = print;
        context.announce(
          "Photo enlarged. Click or press Escape to put it back.",
        );
        return;
      }
      if (isCamera(object)) play();
    },
    dragStart(info) {
      const print = printOf(info.hit?.object);
      if (!print?.onBoard || enlarged) return false;
      dragging = print;
      context.cursor("grabbing");
      return true;
    },
    drag(info) {
      if (!dragging) return;
      const ray = toLocal(info);
      pinboard.updateMatrixWorld();
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(
        pinboard.quaternion,
      );
      plane.setFromNormalAndCoplanarPoint(
        normal,
        pinboard.position.clone().addScaledVector(normal, 0.06),
      );
      if (ray.intersectPlane(plane, point)) {
        const local = point
          .clone()
          .applyMatrix4(new THREE.Matrix4().copy(pinboard.matrix).invert());
        const [x, y] = SLOTS[dragging.slot];
        dragging.offset.set(
          clamp(local.x - x, -1 - x, 1 - x),
          clamp(local.y - y, -0.6 - y, 0.6 - y),
        );
      }
    },
    dragEnd() {
      dragging = null;
      context.cursor("default");
    },
    key(key) {
      if (key === "Escape" && enlarged) {
        enlarged = null;
        return true;
      }
      return false;
    },
    demo: {
      duration: 5.6,
      rate: 1.3,
      begin: play,
      cursor(t) {
        const shutterPoint = new THREE.Vector3(0, 0.78, 0.18).add(
          camera.position,
        );
        if (t < 0.5)
          return {
            point: shutterPoint.clone().add(new THREE.Vector3(0.3, 0.2, 0)),
            press: false,
          };
        if (t < 0.9) return { point: shutterPoint, press: true };
        return null;
      },
    },
    dispose() {
      textures.forEach((t) => t.dispose());
      faceGeometry.dispose();
      disposeTree(root, new Set([env]));
    },
  };
  setAperture(1);
  reset();
  return exhibit;
}
