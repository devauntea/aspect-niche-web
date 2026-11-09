import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  aim,
  canvasTexture,
  clamp,
  contactShadow,
  createHand,
  damp,
  disposeTree,
  easeInOut,
  easeOut,
  type Exhibit,
  type ExhibitContext,
  lerp,
  mesh,
  mixPose,
  noiseTexture,
  openHand,
  type Phase,
  physical,
  pinchHand,
  type PointerInfo,
  radialTexture,
  seeded,
  seg,
  skinMaterials,
  smooth,
} from "./kit";

/*
 * Foraging: a miniature forest floor. A breeze moves the grass and ferns,
 * seedlings push up, fallen leaves part to reveal a pinecone, a woven basket
 * arrives and a hand gathers the find. Everything collectable is a seed or a
 * fallen leaf for pressing; the mushrooms are scenery and say so. Nothing here
 * suggests a wild plant or fungus can be judged safe to eat by its looks.
 */

type Find = {
  name: string;
  group: THREE.Group;
  rest: THREE.Vector3;
  restRotation: THREE.Euler;
  materials: THREE.MeshPhysicalMaterial[];
  hidden: boolean;
  pickedAt: number | null;
  basketSlot: THREE.Vector3;
  highlight: number;
  glow: THREE.Sprite;
};

const SEQUENCE = {
  gust: 0,
  emerge: 0.8,
  part: 2.2,
  basket: 3.0,
  pick: 4.3,
  settle: 6.7,
  done: 7.4,
};
const PICK = {
  reach: 0.65,
  grasp: 0.95,
  carry: 1.6,
  release: 1.85,
  gone: 2.45,
};
const BASKET_IN = 1.2;

const windChunk = /* glsl */ `
  vec4 objectPosition = vec4( transformed, 1.0 );
  vec3 anchor = vec3( 0.0 );
  #ifdef USE_INSTANCING
    objectPosition = instanceMatrix * objectPosition;
    anchor = instanceMatrix[ 3 ].xyz;
  #endif
  vec4 worldPos = modelMatrix * objectPosition;
  vec3 worldAnchor = ( modelMatrix * vec4( anchor, 1.0 ) ).xyz;
  float bend = clamp( ( worldPos.y - worldAnchor.y ) / uHeight, 0.0, 1.6 );
  bend *= bend;
  float phase = worldAnchor.x * 1.7 + worldAnchor.z * 1.3;
  float sway = sin( uTime * 1.7 + phase ) * 0.6 + sin( uTime * 2.9 + phase * 1.9 ) * 0.25 + sin( uTime * 0.6 + phase * 0.3 ) * 0.4;
  vec2 wind = vec2( 1.0, 0.35 ) * sway * uBreeze * 0.11;
  vec2 away = worldAnchor.xz - uCursor.xz;
  float near = smoothstep( 0.75, 0.0, length( away ) ) * uCursorStrength;
  wind += normalize( away + 1e-4 ) * near * 0.16;
  worldPos.xz += wind * bend;
  worldPos.y -= length( wind ) * bend * 0.35;
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
`;

export function createForaging(context: ExhibitContext): Exhibit {
  const env = context.environment;
  const root = new THREE.Group();
  root.name = "foraging";
  const random = seeded(2026);
  const floor = new THREE.Group();
  root.add(floor);

  const windUniforms = {
    uTime: { value: 0 },
    uBreeze: { value: 0.3 },
    uHeight: { value: 0.5 },
    uCursor: { value: new THREE.Vector3(99, 0, 99) },
    uCursorStrength: { value: 0 },
  };
  const windy = <M extends THREE.Material>(material: M, height = 0.5) => {
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, windUniforms, {
        uHeight: { value: height },
      });
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uTime;\nuniform float uBreeze;\nuniform float uHeight;\nuniform vec3 uCursor;\nuniform float uCursorStrength;",
        )
        .replace("#include <project_vertex>", windChunk);
    };
    material.customProgramCacheKey = () => `wind-${height}`;
    return material;
  };

  /* -------------------------------------------------------- the ground */
  const RADIUS = 2.15;
  const heightAt = (x: number, z: number) => {
    const r = Math.hypot(x, z) / RADIUS;
    return (
      0.05 * Math.sin(x * 2.1 + 0.4) * Math.cos(z * 1.7) +
      0.035 * Math.sin(x * 5.3 + z * 3.1) +
      0.12 * Math.exp(-((x + 0.9) ** 2 + (z + 0.8) ** 2) * 1.2) -
      0.05 * r * r
    );
  };
  const soil = canvasTexture(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#3a2b21";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) {
        const v = random();
        g.fillStyle =
          v > 0.6
            ? `rgba(95,72,52,${0.3 + random() * 0.3})`
            : `rgba(20,14,10,${0.2 + random() * 0.3})`;
        g.fillRect(
          random() * w,
          random() * h,
          1 + random() * 3,
          1 + random() * 2,
        );
      }
      for (let i = 0; i < 70; i++) {
        g.strokeStyle = `rgba(${110 + random() * 50},${80 + random() * 40},${50 + random() * 30},0.5)`;
        g.lineWidth = 1 + random() * 2;
        g.beginPath();
        const x = random() * w,
          y = random() * h;
        g.moveTo(x, y);
        g.lineTo(x + (random() - 0.5) * 60, y + (random() - 0.5) * 60);
        g.stroke();
      }
      for (let i = 0; i < 120; i++) {
        g.fillStyle = `rgba(${130 + random() * 70},${80 + random() * 50},${30 + random() * 30},${0.35 + random() * 0.3})`;
        g.beginPath();
        g.ellipse(
          random() * w,
          random() * h,
          4 + random() * 9,
          2 + random() * 4,
          random() * 3,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    },
    { color: true, repeat: [2, 2] },
  );
  const ground = physical(env, {
    map: soil,
    roughness: 0.95,
    bumpMap: noiseTexture(256, 17, 3, [4, 4]),
    bumpScale: 2.2,
    envMapIntensity: 0.4,
  });
  const strata = physical(env, {
    map: canvasTexture(
      512,
      128,
      (g, w, h) => {
        const bands = ["#2f2219", "#3d2c20", "#4a3626", "#3a2a1f", "#2a1e16"];
        let y = 0;
        bands.forEach((c, i) => {
          const hh = h / bands.length + (i % 2 ? 6 : -4);
          g.fillStyle = c;
          g.fillRect(0, y, w, hh + 2);
          y += hh;
        });
        for (let i = 0; i < 1800; i++) {
          g.fillStyle = `rgba(${150 + random() * 60},${130 + random() * 50},${110 + random() * 40},${0.15 + random() * 0.3})`;
          g.beginPath();
          g.arc(
            random() * w,
            random() * h,
            0.5 + random() * 2.2,
            0,
            Math.PI * 2,
          );
          g.fill();
        }
        g.strokeStyle = "rgba(160,120,90,0.45)";
        for (let i = 0; i < 26; i++) {
          g.lineWidth = 0.6 + random() * 1.5;
          g.beginPath();
          let x = random() * w,
            y2 = random() * h * 0.4;
          g.moveTo(x, y2);
          for (let s = 0; s < 6; s++) {
            x += (random() - 0.5) * 22;
            y2 += random() * 14;
            g.lineTo(x, y2);
          }
          g.stroke();
        }
      },
      { color: true, repeat: [4, 1] },
    ),
    roughness: 0.96,
    bumpMap: noiseTexture(128, 61, 3, [8, 2]),
    bumpScale: 2,
  });
  {
    const rings = 26,
      segments = 112;
    const positions: number[] = [],
      uvs: number[] = [],
      index: number[] = [];
    positions.push(0, heightAt(0, 0), 0);
    uvs.push(0.5, 0.5);
    for (let r = 1; r <= rings; r++) {
      for (let s = 0; s < segments; s++) {
        const a = (s / segments) * Math.PI * 2;
        const rr = (r / rings) * RADIUS;
        const x = Math.cos(a) * rr,
          z = Math.sin(a) * rr;
        positions.push(x, heightAt(x, z), z);
        uvs.push(x / (RADIUS * 2) + 0.5, z / (RADIUS * 2) + 0.5);
      }
    }
    for (let s = 0; s < segments; s++)
      index.push(0, 1 + ((s + 1) % segments), 1 + s);
    for (let r = 1; r < rings; r++) {
      for (let s = 0; s < segments; s++) {
        const a = 1 + (r - 1) * segments + s,
          b = 1 + (r - 1) * segments + ((s + 1) % segments);
        const c = a + segments,
          d = b + segments;
        index.push(a, b, c, b, d, c);
      }
    }
    const top = new THREE.BufferGeometry();
    top.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    top.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    top.setIndex(index);
    top.computeVertexNormals();
    const topMesh = mesh(top, ground, floor);
    topMesh.name = "forest-floor";
    // The cut side: soil strata with fine roots, following the top edge.
    const side = new THREE.CylinderGeometry(
      RADIUS,
      RADIUS * 0.97,
      1,
      segments,
      1,
      true,
    );
    const p = side.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i);
      p.setY(i, p.getY(i) > 0 ? heightAt(x, z) : -0.5);
    }
    side.computeVertexNormals();
    mesh(side, strata, floor);
    const bottom = mesh(
      new THREE.CircleGeometry(RADIUS * 0.97, segments),
      strata,
      floor,
    );
    bottom.rotation.x = Math.PI / 2;
    bottom.position.y = -0.5;
  }
  const shadow = contactShadow(5.4, 5.4, 0.55);
  shadow.position.y = -0.52;
  root.add(shadow);
  const onGround = (x: number, z: number, lift = 0) =>
    new THREE.Vector3(x, heightAt(x, z) + lift, z);
  const scatter = (
    count: number,
    centre: [number, number],
    spread: number,
    keepOut: (x: number, z: number) => boolean = () => false,
  ) => {
    const points: [number, number][] = [];
    let guard = 0;
    while (points.length < count && guard++ < count * 20) {
      const a = random() * Math.PI * 2,
        r = Math.sqrt(random()) * spread;
      const x = centre[0] + Math.cos(a) * r,
        z = centre[1] + Math.sin(a) * r;
      if (Math.hypot(x, z) > RADIUS - 0.12 || keepOut(x, z)) continue;
      points.push([x, z]);
    }
    return points;
  };
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();

  /* ------------------------------------------------------------- moss */
  const moss = physical(env, {
    color: "#ffffff",
    roughness: 1,
    sheen: 0.45,
    sheenColor: new THREE.Color("#8fae55"),
    sheenRoughness: 0.5,
    bumpMap: noiseTexture(64, 5, 1.2, [4, 4]),
    bumpScale: 3,
  });
  const mossPoints = [
    ...scatter(70, [-0.9, -0.75], 0.65),
    ...scatter(46, [0.95, -0.95], 0.5),
    ...scatter(40, [-1.25, 0.75], 0.45),
    ...scatter(30, [0.4, 0.2], 0.35),
  ];
  const mossMesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    moss,
    mossPoints.length,
  );
  mossPoints.forEach(([x, z], i) => {
    const s = 0.6 + random() * 0.9;
    dummy.position.copy(onGround(x, z, -0.015));
    dummy.scale.set(
      s * (1 + random() * 0.6),
      s * 0.45,
      s * (1 + random() * 0.6),
    );
    dummy.rotation.set(0, random() * 6, 0);
    dummy.updateMatrix();
    mossMesh.setMatrixAt(i, dummy.matrix);
    mossMesh.setColorAt(
      i,
      tint.setHSL(
        0.23 + random() * 0.06,
        0.5 + random() * 0.15,
        0.1 + random() * 0.08,
      ),
    );
  });
  floor.add(mossMesh);

  /* --------------------------------------------------- leaf litter */
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.09, 0.05, 0.1, 0.18, 0, 0.3);
  leafShape.bezierCurveTo(-0.1, 0.18, -0.09, 0.05, 0, 0);
  const leafGeometry = new THREE.ShapeGeometry(leafShape, 8);
  {
    const p = leafGeometry.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      p.setZ(i, Math.abs(x) * 0.35 + Math.sin((y / 0.3) * Math.PI) * 0.02);
    }
    leafGeometry.computeVertexNormals();
    leafGeometry.rotateX(-Math.PI / 2);
  }
  const litter = physical(env, {
    color: "#ffffff",
    roughness: 0.85,
    side: THREE.DoubleSide,
    envMapIntensity: 0.35,
  });
  const pinecoreAt = new THREE.Vector2(0.3, 0.55);
  const litterPoints = scatter(
    90,
    [0, 0],
    RADIUS - 0.1,
    (x, z) => Math.hypot(x - pinecoreAt.x, z - pinecoreAt.y) < 0.3,
  );
  const litterMesh = new THREE.InstancedMesh(
    leafGeometry,
    litter,
    litterPoints.length,
  );
  const autumn = () =>
    tint.setHSL(
      0.03 + random() * 0.08,
      0.5 + random() * 0.3,
      0.12 + random() * 0.16,
    );
  litterPoints.forEach(([x, z], i) => {
    const s = 0.7 + random() * 0.7;
    dummy.position.copy(onGround(x, z, 0.012));
    dummy.rotation.set(
      (random() - 0.5) * 0.3,
      random() * Math.PI * 2,
      (random() - 0.5) * 0.3,
    );
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    litterMesh.setMatrixAt(i, dummy.matrix);
    litterMesh.setColorAt(i, autumn());
  });
  floor.add(litterMesh);
  // The leaves covering the pinecone: animated individually when they part.
  const COVER = 9;
  // Centred on their own middle, so a small pile actually hides what is under it.
  const coverGeometry = leafGeometry.clone().translate(0, 0, 0.15);
  const coverMesh = new THREE.InstancedMesh(coverGeometry, litter, COVER);
  const cover = Array.from({ length: COVER }, (_, i) => {
    const a = (i / COVER) * Math.PI * 2 + random() * 0.4;
    const r = random() * 0.06;
    return {
      x: pinecoreAt.x + Math.cos(a) * r,
      z: pinecoreAt.y + 0.07 + Math.sin(a) * r,
      angle: random() * Math.PI * 2,
      out: a,
      scale: 2.1 + random() * 0.6,
    };
  });
  cover.forEach((_, i) => coverMesh.setColorAt(i, autumn()));
  floor.add(coverMesh);
  const placeCover = (part: number, breeze: number, time: number) => {
    cover.forEach((leaf, i) => {
      const p = easeOut(clamp(part * 1.25 - i * 0.04));
      const dist = p * (0.32 + (i % 3) * 0.06);
      const x = leaf.x + Math.cos(leaf.out) * dist,
        z = leaf.z + Math.sin(leaf.out) * dist;
      const flutter = Math.sin(time * 3 + i) * 0.04 * breeze * (1 - p * 0.6);
      dummy.position.copy(
        onGround(
          x,
          z,
          0.02 + (1 - p) * (0.1 + 0.012 * i) + Math.sin(p * Math.PI) * 0.12,
        ),
      );
      dummy.rotation.set(
        flutter + Math.sin(p * Math.PI) * 0.6,
        leaf.angle + p * 1.2,
        flutter * 0.5,
      );
      dummy.scale.setScalar(leaf.scale);
      dummy.updateMatrix();
      coverMesh.setMatrixAt(i, dummy.matrix);
    });
    coverMesh.instanceMatrix.needsUpdate = true;
  };

  /* ------------------------------------------------------------ grass */
  const blade = new THREE.PlaneGeometry(0.03, 1, 1, 5);
  {
    const p = blade.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) + 0.5;
      p.setXYZ(i, p.getX(i) * (1 - y * 0.85), y, y * y * 0.12);
    }
    blade.computeVertexNormals();
  }
  const grassMaterial = windy(
    physical(env, {
      color: "#ffffff",
      roughness: 0.65,
      side: THREE.DoubleSide,
      sheen: 0.15,
      sheenColor: new THREE.Color("#c6dc8a"),
      envMapIntensity: 0.4,
    }),
    0.5,
  );
  const lowPower =
    typeof navigator !== "undefined" &&
    (navigator.hardwareConcurrency ?? 8) <= 4;
  const grassPoints = [
    ...scatter(
      lowPower ? 140 : 260,
      [-0.4, -0.3],
      1.2,
      (x, z) => Math.hypot(x - pinecoreAt.x, z - pinecoreAt.y) < 0.4,
    ),
    ...scatter(lowPower ? 80 : 160, [1.2, 0.2], 0.7),
    ...scatter(lowPower ? 60 : 110, [-1.1, 1.1], 0.6),
  ];
  const grass = new THREE.InstancedMesh(
    blade,
    grassMaterial,
    grassPoints.length,
  );
  grassPoints.forEach(([x, z], i) => {
    dummy.position.copy(onGround(x, z, -0.01));
    const h = 0.18 + random() * 0.38;
    dummy.scale.set(0.8 + random() * 0.8, h, 1);
    dummy.rotation.set(
      (random() - 0.5) * 0.25,
      random() * Math.PI * 2,
      (random() - 0.5) * 0.25,
    );
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
    grass.setColorAt(
      i,
      tint.setHSL(
        0.2 + random() * 0.09,
        0.4 + random() * 0.2,
        0.1 + random() * 0.1,
      ),
    );
  });
  floor.add(grass);

  /* ------------------------------------------------------------ ferns */
  const fernMaterial = windy(
    physical(env, {
      color: "#2f5a2c",
      roughness: 0.65,
      side: THREE.DoubleSide,
      sheen: 0.2,
      sheenColor: new THREE.Color("#a8c97a"),
      envMapIntensity: 0.4,
    }),
    0.9,
  );
  const fernGeometry = (() => {
    const parts: THREE.BufferGeometry[] = [];
    const leaflet = new THREE.PlaneGeometry(0.05, 0.14, 1, 2);
    leaflet.translate(0, 0.07, 0);
    for (let f = 0; f < 6; f++) {
      const heading = (f / 6) * Math.PI * 2 + 0.3;
      const length = 0.7 + (f % 3) * 0.12;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(heading) * length * 0.35,
          length * 0.75,
          Math.sin(heading) * length * 0.35,
        ),
        new THREE.Vector3(
          Math.cos(heading) * length * 0.85,
          length * 0.45,
          Math.sin(heading) * length * 0.85,
        ),
      );
      parts.push(new THREE.TubeGeometry(curve, 12, 0.008, 4, false));
      for (let i = 2; i < 22; i++) {
        const t = i / 22;
        const at = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const side = new THREE.Vector3()
          .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
          .normalize();
        for (const s of [-1, 1]) {
          const g = leaflet.clone();
          const size = Math.sin(t * Math.PI) * 0.9 + 0.2;
          const m = new THREE.Matrix4();
          const dir = side
            .clone()
            .multiplyScalar(s)
            .addScaledVector(tangent, 0.35)
            .normalize();
          const q = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir,
          );
          q.multiply(
            new THREE.Quaternion().setFromAxisAngle(
              new THREE.Vector3(0, 1, 0),
              s * 0.6,
            ),
          );
          m.compose(at, q, new THREE.Vector3(size, size, size));
          g.applyMatrix4(m);
          parts.push(g);
        }
      }
    }
    const merged = mergeGeometries(parts.map((p) => p.toNonIndexed()));
    parts.forEach((p) => p.dispose());
    leaflet.dispose();
    return merged;
  })();
  const ferns = [
    { at: [-1.25, -0.55], s: 0.95 },
    { at: [1.35, -0.5], s: 0.75 },
    { at: [-0.5, 1.25], s: 0.6 },
  ].map(({ at, s }) => {
    const fern = mesh(fernGeometry, fernMaterial, floor);
    fern.position.copy(onGround(at[0], at[1], -0.02));
    fern.scale.setScalar(s);
    fern.rotation.y = random() * 6;
    fern.userData.scale = s;
    return fern;
  });

  /* ---------------------------------------------------------- seedlings */
  const sprouts = [
    [-0.25, -0.1],
    [0.85, 0.75],
    [-0.75, 0.25],
    [0.55, -0.45],
    [1.15, 0.95],
  ].map(([x, z], i) => {
    const sprout = new THREE.Group();
    sprout.position.copy(onGround(x, z));
    floor.add(sprout);
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.02, 0.12, 0),
      new THREE.Vector3(-0.01, 0.24, 0.02),
    ]);
    mesh(
      new THREE.TubeGeometry(stemCurve, 8, 0.012, 5, false),
      fernMaterial,
      sprout,
    );
    for (const s of [-1, 1]) {
      const leaf = mesh(leafGeometry, fernMaterial, sprout);
      leaf.position.set(-0.01, 0.24, 0.02);
      leaf.rotation.set(0, s > 0 ? 0 : Math.PI, 0.5);
      leaf.scale.setScalar(0.55);
    }
    sprout.rotation.y = i * 1.3;
    sprout.scale.setScalar(0.001);
    return sprout;
  });

  /* ---------------------------------------------------------- mushrooms */
  const capMaterial = physical(env, {
    map: canvasTexture(
      128,
      128,
      (g, w, h) => {
        const gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
        gr.addColorStop(0, "#5a3a26");
        gr.addColorStop(0.7, "#8d6242");
        gr.addColorStop(1, "#b48a62");
        g.fillStyle = gr;
        g.fillRect(0, 0, w, h);
      },
      { color: true },
    ),
    roughness: 0.5,
    clearcoat: 0.4,
  });
  const stemMaterial = physical(env, { color: "#e9dfcc", roughness: 0.8 });
  const gillMaterial = physical(env, {
    map: canvasTexture(128, 128, (g, w, h) => {
      g.fillStyle = "#cdb89a";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#8a7356";
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2;
        g.beginPath();
        g.moveTo(w / 2 + Math.cos(a) * 10, h / 2 + Math.sin(a) * 10);
        g.lineTo(w / 2 + Math.cos(a) * 64, h / 2 + Math.sin(a) * 64);
        g.stroke();
      }
    }),
    roughness: 0.9,
  });
  const capGeometry = new THREE.LatheGeometry(
    [
      [0.001, 0.13],
      [0.06, 0.125],
      [0.11, 0.1],
      [0.14, 0.06],
      [0.15, 0.03],
      [0.13, 0.025],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    32,
  );
  const gillGeometry = new THREE.CircleGeometry(0.135, 32);
  gillGeometry.rotateX(Math.PI / 2);
  const mushroomParts: THREE.Object3D[] = [];
  [
    { at: [-0.95, -0.1], s: 1 },
    { at: [-0.78, -0.02], s: 0.7 },
    { at: [-0.88, 0.12], s: 0.5 },
  ].forEach(({ at, s }, i) => {
    const m = new THREE.Group();
    m.position.copy(onGround(at[0], at[1], -0.01));
    m.scale.setScalar(s * 1.4);
    m.rotation.set((i - 1) * 0.12, i, (i - 1) * 0.1);
    floor.add(m);
    const stem = mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.2, 12),
      stemMaterial,
      m,
    );
    stem.position.y = 0.1;
    const cap = mesh(capGeometry, capMaterial, m);
    cap.position.y = 0.15;
    const gills = mesh(gillGeometry, gillMaterial, m);
    gills.position.y = 0.176;
    mushroomParts.push(m);
  });

  /* ------------------------------------------- twigs and pebbles */
  const bark = physical(env, {
    color: "#5b4636",
    roughness: 0.9,
    bumpMap: noiseTexture(64, 77, 2, [1, 6]),
    bumpScale: 2,
  });
  for (let i = 0; i < 3; i++) {
    const x = -0.3 + i * 0.6,
      z = -1.2 + i * 0.35;
    const curve = new THREE.CatmullRomCurve3([
      onGround(x, z, 0.02),
      onGround(x + 0.25, z + 0.08, 0.035),
      onGround(x + 0.5, z + 0.02, 0.02),
    ]);
    mesh(
      new THREE.TubeGeometry(curve, 10, 0.022 - i * 0.004, 6, false),
      bark,
      floor,
    );
  }
  const stone = physical(env, {
    color: "#7d8088",
    roughness: 0.7,
    bumpMap: noiseTexture(64, 8, 3),
    bumpScale: 1.5,
  });
  [
    [1.55, -0.1, 0.13],
    [1.4, 0.05, 0.08],
    [-1.55, 0.2, 0.1],
  ].forEach(([x, z, s]) => {
    const pebble = mesh(new THREE.IcosahedronGeometry(1, 2), stone, floor);
    pebble.position.copy(onGround(x, z, s * 0.25));
    pebble.scale.set(s * 1.3, s * 0.65, s);
  });

  /* -------------------------------------------------------------- finds */
  const glowTexture = radialTexture(
    "rgba(214,196,255,0.9)",
    "rgba(214,196,255,0)",
  );
  const makeFind = (
    name: string,
    group: THREE.Group,
    x: number,
    z: number,
    lift: number,
    slot: THREE.Vector3,
    hidden: boolean,
  ): Find => {
    const rest = onGround(x, z, lift);
    group.position.copy(rest);
    floor.add(group);
    const materials: THREE.MeshPhysicalMaterial[] = [];
    group.traverse((o) => {
      if (
        o instanceof THREE.Mesh &&
        o.material instanceof THREE.MeshPhysicalMaterial &&
        !materials.includes(o.material)
      )
        materials.push(o.material);
    });
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    glow.scale.setScalar(0.55);
    glow.position.copy(onGround(x, z, 0.03));
    floor.add(glow);
    return {
      name,
      group,
      rest,
      restRotation: group.rotation.clone(),
      materials,
      hidden,
      pickedAt: null,
      basketSlot: slot,
      highlight: 0,
      glow,
    };
  };
  // Pinecone: overlapping woody scales in a Fibonacci spiral.
  const pinecone = (() => {
    const g = new THREE.Group();
    const scaleMaterial = physical(env, {
      color: "#7a5236",
      roughness: 0.7,
      bumpMap: noiseTexture(64, 13, 2, [2, 2]),
      bumpScale: 1.2,
      emissive: new THREE.Color("#cdb8ff"),
      emissiveIntensity: 0,
    });
    const core = mesh(new THREE.SphereGeometry(0.06, 16, 12), scaleMaterial, g);
    core.scale.set(1, 2.1, 1);
    const scaleGeometry = new THREE.SphereGeometry(
      0.05,
      10,
      6,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    scaleGeometry.scale(1, 0.32, 0.8);
    const count = 84;
    const scales = new THREE.InstancedMesh(scaleGeometry, scaleMaterial, count);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const y = lerp(-0.12, 0.13, t);
      const radius = 0.07 * Math.sin(Math.PI * clamp(t * 0.95 + 0.05)) + 0.012;
      const a = i * 2.39996;
      dummy.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
      dummy.rotation.set(0, -a + Math.PI / 2, 0);
      dummy.rotateX(-0.9 + t * 0.5);
      const s = 0.65 + Math.sin(Math.PI * t) * 0.6;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      scales.setMatrixAt(i, dummy.matrix);
    }
    g.add(scales);
    g.rotation.set(Math.PI / 2 - 0.15, 0, Math.PI / 2 - 0.3);
    g.scale.setScalar(1.15);
    return g;
  })();
  const acorn = (() => {
    const g = new THREE.Group();
    const nut = physical(env, {
      color: "#a87a3e",
      roughness: 0.35,
      clearcoat: 0.6,
      emissive: new THREE.Color("#cdb8ff"),
      emissiveIntensity: 0,
    });
    const capMat = physical(env, {
      color: "#6e5536",
      roughness: 0.95,
      bumpMap: noiseTexture(64, 71, 1.4, [3, 3]),
      bumpScale: 3,
      emissive: new THREE.Color("#cdb8ff"),
      emissiveIntensity: 0,
    });
    const body = mesh(
      new THREE.LatheGeometry(
        [
          [0.001, -0.1],
          [0.025, -0.09],
          [0.055, -0.05],
          [0.065, 0],
          [0.06, 0.04],
          [0.05, 0.05],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        24,
      ),
      nut,
      g,
    );
    body.position.y = 0;
    const cap = mesh(
      new THREE.SphereGeometry(0.068, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      capMat,
      g,
    );
    cap.position.y = 0.035;
    cap.scale.y = 0.75;
    const stalk = mesh(
      new THREE.CylinderGeometry(0.006, 0.008, 0.04, 6),
      capMat,
      g,
    );
    stalk.position.y = 0.1;
    g.rotation.set(Math.PI / 2 - 0.3, 0.4, 0.2);
    g.scale.setScalar(1.7);
    return g;
  })();
  const goldLeaf = (() => {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    const lobes = 5;
    for (let i = 0; i <= lobes * 2; i++) {
      const a = Math.PI * 0.1 + (i / (lobes * 2)) * Math.PI * 0.8;
      const r = i % 2 === 0 ? 0.2 : 0.09;
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.lineTo(0, 0);
    const geometry = new THREE.ShapeGeometry(shape, 4);
    const p = geometry.getAttribute("position");
    for (let i = 0; i < p.count; i++)
      p.setZ(i, Math.hypot(p.getX(i), p.getY(i)) ** 2 * 0.8);
    geometry.computeVertexNormals();
    const leaf = mesh(
      geometry,
      physical(env, {
        color: "#d9a43c",
        roughness: 0.55,
        side: THREE.DoubleSide,
        sheen: 0.5,
        sheenColor: new THREE.Color("#ffe3a0"),
        emissive: new THREE.Color("#cdb8ff"),
        emissiveIntensity: 0,
      }),
      g,
    );
    leaf.rotation.x = -Math.PI / 2;
    const stalk = mesh(
      new THREE.CylinderGeometry(0.004, 0.006, 0.1, 5),
      bark,
      g,
    );
    stalk.rotation.z = Math.PI / 2;
    stalk.position.set(0, 0.005, 0.04);
    g.rotation.y = 0.8;
    g.scale.setScalar(1.6);
    return g;
  })();
  const finds: Find[] = [
    makeFind(
      "pinecone",
      pinecone,
      pinecoreAt.x,
      pinecoreAt.y,
      0.05,
      new THREE.Vector3(-0.08, 0.16, 0.02),
      true,
    ),
    makeFind(
      "acorn",
      acorn,
      -0.35,
      0.95,
      0.09,
      new THREE.Vector3(0.14, 0.17, -0.06),
      false,
    ),
    makeFind(
      "golden leaf",
      goldLeaf,
      1.0,
      0.35,
      0.03,
      new THREE.Vector3(0.02, 0.24, 0.1),
      false,
    ),
  ];

  /* ------------------------------------------------------------ basket */
  const weave = canvasTexture(
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#4a321c";
      g.fillRect(0, 0, w, h);
      const rows = 12,
        cols = 16;
      const cw = w / cols,
        rh = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const over = (r + c) % 2 === 0;
          const grad = g.createLinearGradient(
            c * cw,
            r * rh,
            c * cw,
            (r + 1) * rh,
          );
          const light = over ? 205 : 160;
          grad.addColorStop(
            0,
            `rgb(${light - 50},${light - 85},${light - 130})`,
          );
          grad.addColorStop(0.5, `rgb(${light},${light - 40},${light - 95})`);
          grad.addColorStop(
            1,
            `rgb(${light - 60},${light - 95},${light - 135})`,
          );
          g.fillStyle = grad;
          g.beginPath();
          g.roundRect(c * cw + 1, r * rh + 2, cw - 2, rh - 4, 5);
          g.fill();
        }
      }
    },
    { color: true, repeat: [3, 1] },
  );
  const weaveBump = canvasTexture(
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, w, h);
      const rows = 12,
        cols = 16;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          g.fillStyle = (r + c) % 2 === 0 ? "#fff" : "#888";
          g.beginPath();
          g.roundRect(
            (c * w) / cols + 2,
            (r * h) / rows + 3,
            w / cols - 4,
            h / rows - 6,
            6,
          );
          g.fill();
        }
    },
    { repeat: [3, 1] },
  );
  const wicker = physical(env, {
    map: weave,
    bumpMap: weaveBump,
    bumpScale: 2.5,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  const basket = new THREE.Group();
  basket.name = "basket";
  floor.add(basket);
  const basketBody = mesh(
    new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.26, 0],
        [0.33, 0.04],
        [0.4, 0.16],
        [0.44, 0.3],
        [0.42, 0.3],
        [0.38, 0.17],
        [0.31, 0.06],
        [0.001, 0.04],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      48,
    ),
    wicker,
    basket,
  );
  basketBody.scale.set(1, 1, 0.8);
  const rimGeometry = new THREE.TorusGeometry(0.43, 0.026, 8, 48);
  const rim = mesh(rimGeometry, wicker, basket);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.3;
  rim.scale.set(1, 0.8, 1);
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.42, 0.3, 0),
    new THREE.Vector3(-0.36, 0.62, 0),
    new THREE.Vector3(0, 0.78, 0),
    new THREE.Vector3(0.36, 0.62, 0),
    new THREE.Vector3(0.42, 0.3, 0),
  ]);
  mesh(
    new THREE.TubeGeometry(handleCurve, 32, 0.024, 8, false),
    wicker,
    basket,
  );
  const cloth = mesh(
    new THREE.CircleGeometry(0.34, 24),
    physical(env, {
      color: "#d9cfe8",
      roughness: 0.9,
      sheen: 0.6,
      sheenColor: new THREE.Color("#ffffff"),
      side: THREE.DoubleSide,
    }),
    basket,
  );
  cloth.rotation.x = -Math.PI / 2;
  cloth.position.y = 0.12;
  cloth.scale.set(1, 0.78, 1);
  const basketShadow = contactShadow(1.1, 0.9, 0.5);
  basketShadow.position.y = 0.01;
  basket.add(basketShadow);
  const basketHome = onGround(1.25, 0.95, 0);
  basket.rotation.y = -0.35;

  /* -------------------------------------------------------------- hand */
  const { skin, nail, sleeve } = skinMaterials(env, 0);
  const hand = createHand(skin, nail, sleeve);
  const handScale = 0.36;
  hand.root.scale.setScalar(handScale);
  hand.root.visible = false;
  floor.add(hand.root);
  const handForward = new THREE.Vector3(-0.5, -0.62, 0.6).normalize();
  const handFacing = new THREE.Vector3(-0.3, -0.7, -0.6);
  const handHome = new THREE.Vector3(2.6, 2.2, -1.4);

  /* ------------------------------------------------------------ pollen */
  const POLLEN = 150;
  const pollenSeeds = Array.from({ length: POLLEN }, () => [
    random() * 4 - 2,
    random() * 2.2,
    random() * 3.2 - 1.6,
    random() * 6,
    0.05 + random() * 0.08,
  ]);
  const pollenGeometry = new THREE.BufferGeometry();
  const pollenPositions = new Float32Array(POLLEN * 3);
  pollenGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(pollenPositions, 3),
  );
  const pollen = new THREE.Points(
    pollenGeometry,
    new THREE.PointsMaterial({
      size: 0.05,
      map: radialTexture("rgba(255,240,205,0.95)", "rgba(255,240,205,0)"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.7,
    }),
  );
  pollen.frustumCulled = false;
  root.add(pollen);
  const shaft = mesh(
    new THREE.PlaneGeometry(1.6, 4.2),
    new THREE.MeshBasicMaterial({
      map: canvasTexture(64, 256, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, "rgba(255,236,200,0.0)");
        gr.addColorStop(0.35, "rgba(255,236,200,0.22)");
        gr.addColorStop(1, "rgba(255,236,200,0.0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, w, h);
        const side = g.createLinearGradient(0, 0, w, 0);
        side.addColorStop(0, "rgba(0,0,0,1)");
        side.addColorStop(0.5, "rgba(0,0,0,0)");
        side.addColorStop(1, "rgba(0,0,0,1)");
        g.globalCompositeOperation = "destination-out";
        g.fillStyle = side;
        g.fillRect(0, 0, w, h);
      }),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
    root,
  );
  shaft.position.set(-0.4, 1.3, -0.3);
  shaft.rotation.set(0, 0.2, -0.42);
  const sun = new THREE.DirectionalLight("#ffe2b8", 0.55);
  sun.position.set(-2, 4, 1);
  root.add(sun);

  /* -------------------------------------------------------------- state */
  let clock = 0;
  let phase: Phase = "idle";
  let sequenceStart: number | null = null;
  let basketStart: number | null = null;
  let picks: { find: Find; start: number }[] = [];
  let hovered: Find | null = null;
  let cursorStrength = 0;
  const cursorLocal = new THREE.Vector3(99, 0, 99);
  const inverse = new THREE.Matrix4();
  const localRay = new THREE.Ray();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.02);
  const point = new THREE.Vector3();
  let lastStage = "";

  const setPhase = (next: Phase, message?: string) => {
    if (phase !== next) {
      phase = next;
      exhibit.phase = next;
      context.phase(next, message);
    }
    context.changed();
  };
  const stage = (text: string) => {
    if (text !== lastStage) {
      lastStage = text;
      context.stage(text);
    }
  };

  const seqT = () => (sequenceStart === null ? -1 : clock - sequenceStart);
  const revealed = (find: Find) =>
    !find.hidden || seqT() >= SEQUENCE.part + 0.6;
  const available = () =>
    finds.filter(
      (f) =>
        f.pickedAt === null && !picks.some((p) => p.find === f) && revealed(f),
    );

  function queuePick(find: Find) {
    if (basketStart === null) basketStart = clock;
    const last = picks[picks.length - 1];
    const ready = Math.max(
      clock,
      basketStart + BASKET_IN * 0.7,
      last ? last.start + PICK.gone - 0.25 : 0,
    );
    picks.push({ find, start: ready });
    setPhase("active");
  }

  function placeBasket() {
    if (basketStart === null) {
      basket.visible = false;
      return;
    }
    basket.visible = true;
    const p = clamp((clock - basketStart) / BASKET_IN);
    const e = easeOut(p);
    basket.position
      .copy(basketHome)
      .add(
        new THREE.Vector3(
          (1 - e) * 2.2,
          Math.abs(Math.sin(p * Math.PI * 2.5)) * 0.12 * (1 - p),
          (1 - e) * 0.6,
        ),
      );
    basket.rotation.z = (1 - e) * -0.25;
  }

  const fingertip = () =>
    hand.root.position
      .clone()
      .addScaledVector(handForward, hand.reach * handScale * 0.9)
      .addScaledVector(handFacing.clone().normalize(), 0.03);

  function placeHandAndFinds() {
    let active: { find: Find; t: number } | null = null;
    for (const pick of picks) {
      const t = clock - pick.start;
      if (t >= 0 && t < PICK.gone) {
        active = { find: pick.find, t };
        break;
      }
    }
    for (const find of finds) {
      const pick = picks.find((p) => p.find === find);
      const t = pick ? clock - pick.start : -1;
      if (!pick || t < PICK.grasp) {
        find.group.position.copy(find.rest);
        find.group.position.y += find.highlight * 0.03;
        find.group.rotation.copy(find.restRotation);
      } else if (t >= PICK.release) {
        // Dropped: falls into its place in the basket.
        const drop = easeOut(seg(t, PICK.release, PICK.release + 0.35));
        basket.updateMatrix();
        const inBasket = find.basketSlot.clone().applyMatrix4(basket.matrix);
        const above = inBasket.clone().add(new THREE.Vector3(0, 0.25, 0));
        find.group.position.lerpVectors(above, inBasket, drop);
      }
      find.glow.material.opacity = find.highlight * 0.45;
    }
    if (!active) {
      hand.root.visible = false;
      return;
    }
    hand.root.visible = true;
    const { find, t } = active;
    basket.updateMatrix();
    const target = find.rest.clone().add(new THREE.Vector3(0, 0.05, 0));
    const over = find.basketSlot
      .clone()
      .applyMatrix4(basket.matrix)
      .add(new THREE.Vector3(0, 0.35, 0));
    const lift = target.clone().add(new THREE.Vector3(0, 0.6, 0));
    const tipToWrist = handForward
      .clone()
      .multiplyScalar(-hand.reach * handScale * 0.9);
    const above = target
      .clone()
      .add(tipToWrist)
      .add(new THREE.Vector3(0, 0.25, 0));
    let wrist: THREE.Vector3;
    let grip = 0;
    if (t < PICK.reach) {
      const p = easeInOut(seg(t, 0, PICK.reach));
      wrist = handHome.clone().lerp(above, p);
    } else if (t < PICK.grasp) {
      const p = smooth(seg(t, PICK.reach, PICK.grasp));
      wrist = above.clone().lerp(target.clone().add(tipToWrist), p);
      grip = smooth(seg(t, PICK.reach + 0.15, PICK.grasp));
    } else if (t < PICK.carry) {
      const p = easeInOut(seg(t, PICK.grasp, PICK.carry));
      const mid = lift
        .clone()
        .lerp(over, 0.5)
        .add(new THREE.Vector3(0, 0.25, 0));
      const tip = new THREE.Vector3()
        .copy(target)
        .multiplyScalar((1 - p) ** 2)
        .addScaledVector(mid, 2 * (1 - p) * p)
        .addScaledVector(over, p * p);
      wrist = tip.clone().add(tipToWrist);
      grip = 1;
    } else if (t < PICK.release) {
      wrist = over.clone().add(tipToWrist);
      grip = 1 - smooth(seg(t, PICK.carry + 0.05, PICK.release));
    } else {
      const p = easeInOut(seg(t, PICK.release, PICK.gone));
      wrist = over.clone().add(tipToWrist).lerp(handHome, p);
    }
    hand.root.position.copy(wrist);
    aim(hand.root, handForward, handFacing);
    hand.pose(mixPose(openHand, pinchHand, grip));
    if (t >= PICK.grasp && t < PICK.release) {
      find.group.position.copy(fingertip());
      find.group.rotation.set(
        find.restRotation.x + (t - PICK.grasp) * 0.8,
        find.restRotation.y,
        find.restRotation.z,
      );
    }
  }

  function apply(dt: number) {
    const s = seqT();
    // Breeze: a gust at the start of the sequence, otherwise a soft idle air.
    const gust = s >= 0 ? Math.exp(-(((s - 0.9) / 0.7) ** 2)) * 0.9 : 0;
    windUniforms.uBreeze.value = 0.32 + gust;
    windUniforms.uTime.value = clock;
    // Seedlings emerge, staggered; ferns unfurl a little.
    sprouts.forEach((sprout, i) => {
      const p =
        s < 0
          ? 0
          : easeOut(
              seg(
                s,
                SEQUENCE.emerge + i * 0.22,
                SEQUENCE.emerge + 0.9 + i * 0.22,
              ),
            );
      sprout.scale.setScalar(
        Math.max(0.001, p * (1 + 0.12 * Math.sin(p * Math.PI))),
      );
    });
    ferns.forEach((fern, i) => {
      const p =
        s < 0
          ? 0
          : easeOut(
              seg(
                s,
                SEQUENCE.emerge + i * 0.2,
                SEQUENCE.emerge + 1.4 + i * 0.2,
              ),
            );
      const base = fern.userData.scale as number;
      fern.scale.set(base, base * lerp(0.82, 1, p), base);
    });
    placeCover(
      s < 0 ? 0 : seg(s, SEQUENCE.part, SEQUENCE.part + 1.1),
      windUniforms.uBreeze.value,
      clock,
    );
    placeBasket();
    placeHandAndFinds();
    // Pollen drifts up through the light, turns in the gust.
    for (let i = 0; i < POLLEN; i++) {
      const [x, y, z, ph, speed] = pollenSeeds[i];
      const yy = ((y + clock * speed) % 2.2) - 0.05;
      pollenPositions[i * 3] =
        x +
        Math.sin(clock * 0.4 + ph) * 0.18 +
        gust * Math.sin(ph + clock) * 0.3;
      pollenPositions[i * 3 + 1] = yy;
      pollenPositions[i * 3 + 2] = z + Math.cos(clock * 0.3 + ph) * 0.15;
    }
    pollenGeometry.getAttribute("position").needsUpdate = true;
    // Highlights and cursor sway.
    cursorStrength = damp(cursorStrength, cursorLocal.x < 50 ? 1 : 0, 4, dt);
    windUniforms.uCursorStrength.value = cursorStrength;
    root.updateMatrixWorld();
    windUniforms.uCursor.value.copy(cursorLocal).applyMatrix4(root.matrixWorld);
    for (const find of finds) {
      const on =
        find === hovered &&
        revealed(find) &&
        find.pickedAt === null &&
        !picks.some((p) => p.find === find);
      find.highlight = damp(find.highlight, on ? 1 : 0, 9, dt);
      for (const m of find.materials)
        m.emissiveIntensity = find.highlight * 0.16;
    }
  }

  function stageText() {
    const s = seqT();
    const gathered = finds.filter((f) => f.pickedAt !== null).length;
    if (sequenceStart !== null && s < SEQUENCE.done) {
      if (s < SEQUENCE.emerge) return "A breeze through the clearing";
      if (s < SEQUENCE.part) return "New growth pushing up";
      if (s < SEQUENCE.basket) return "Something under the leaves…";
      if (s < SEQUENCE.pick) return "The basket comes along";
      return "Gathering a fallen pinecone";
    }
    if (picks.some((p) => clock - p.start < PICK.gone)) return "Gathering…";
    if (phase === "idle") return "A quiet patch of forest floor";
    if (gathered === finds.length)
      return "Basket full: pinecone, acorn, golden leaf";
    return `${gathered} of ${finds.length} finds in the basket`;
  }

  /* ------------------------------------------------------------ actions */
  function reset() {
    clock = 0;
    sequenceStart = null;
    basketStart = null;
    picks = [];
    finds.forEach((f) => (f.pickedAt = null));
    setPhase("idle");
    apply(0);
  }
  function play() {
    if (phase === "completed" && available().length) {
      queuePick(available()[0]);
      return;
    }
    if (phase === "active") return;
    reset();
    if (context.still()) return finish();
    sequenceStart = clock;
    basketStart = clock + SEQUENCE.basket;
    picks.push({ find: finds[0], start: clock + SEQUENCE.pick });
    setPhase("active");
  }
  function finish() {
    if (sequenceStart === null) {
      sequenceStart = clock - 20;
      basketStart = clock - 20;
      picks.push({ find: finds[0], start: clock - 20 });
    }
    for (const p of picks) p.start = Math.min(p.start, clock - 20);
    if (basketStart !== null) basketStart = Math.min(basketStart, clock - 20);
    sequenceStart = Math.min(sequenceStart, clock - 20);
    picks.forEach((p) => (p.find.pickedAt = p.start));
    apply(0);
    setPhase("completed", "A pinecone gathered into the basket.");
  }

  const toLocal = (info: PointerInfo) => {
    root.updateMatrixWorld();
    inverse.copy(root.matrixWorld).invert();
    return localRay.copy(info.ray).applyMatrix4(inverse);
  };
  const findOf = (object: THREE.Object3D | undefined) => {
    for (let o = object; o; o = o.parent ?? undefined) {
      const f = finds.find((x) => x.group === o);
      if (f) return f;
    }
    return null;
  };
  const isMushroom = (object: THREE.Object3D | undefined) => {
    for (let o = object; o; o = o.parent ?? undefined)
      if (mushroomParts.includes(o)) return true;
    return false;
  };

  const exhibit: Exhibit = {
    id: "foraging",
    root,
    view: {
      target: new THREE.Vector3(0, 0.15, 0.1),
      distance: 6.6,
      height: 2.7,
    },
    pickables: [floor],
    phase,
    label() {
      if (phase === "idle") return "Search the floor";
      if (phase === "active") return "Gathering…";
      const next = available()[0];
      return next
        ? `Gather the ${next.name.replace("golden ", "")}`
        : "Walk again";
    },
    play,
    finish,
    reset,
    update(dt) {
      clock += dt;
      apply(dt);
      for (const pick of picks)
        if (pick.find.pickedAt === null && clock - pick.start >= PICK.release)
          pick.find.pickedAt = clock;
      const busy =
        (sequenceStart !== null && seqT() < SEQUENCE.done) ||
        picks.some((p) => clock - p.start < PICK.gone);
      if (phase === "active" && !busy) {
        const gathered = finds
          .filter((f) => f.pickedAt !== null)
          .map((f) => f.name);
        setPhase("completed", `Gathered: ${gathered.join(", ")}.`);
      }
      stage(stageText());
      return true;
    },
    hover(info) {
      if (!info) {
        hovered = null;
        cursorLocal.set(99, 0, 99);
        context.cursor("default");
        return;
      }
      const ray = toLocal(info);
      if (
        ray.intersectPlane(groundPlane, point) &&
        Math.hypot(point.x, point.z) < RADIUS + 0.4
      )
        cursorLocal.copy(point);
      else cursorLocal.set(99, 0, 99);
      const object = info.hit?.object;
      const find = findOf(object);
      hovered = find && revealed(find) && find.pickedAt === null ? find : null;
      if (isMushroom(object))
        stage(
          "Look, don't pick: no wild mushroom can be judged safe by its looks",
        );
      context.cursor(hovered ? "pointer" : info.hit ? "grab" : "default");
    },
    click(info) {
      const find = findOf(info.hit?.object);
      if (
        find &&
        revealed(find) &&
        find.pickedAt === null &&
        !picks.some((p) => p.find === find)
      ) {
        if (context.still()) {
          if (basketStart === null) basketStart = clock - 20;
          picks.push({ find, start: clock - 20 });
          find.pickedAt = clock;
          apply(0);
          setPhase("completed", `The ${find.name} is in the basket.`);
          return;
        }
        queuePick(find);
        context.announce(`Gathering the ${find.name}.`);
        return;
      }
      if (!info.hit || isMushroom(info.hit.object)) return;
      if (phase !== "active") play();
    },
    dragStart: () => false,
    drag() {},
    dragEnd() {},
    key: () => false,
    demo: {
      duration: 6.6,
      rate: 1.2,
      begin: play,
      cursor(t) {
        if (t < 1.4)
          return {
            point: new THREE.Vector3(
              lerp(-1, 0.2, smooth(seg(t, 0, 1.4))),
              0.25,
              lerp(0.2, 0.7, smooth(seg(t, 0, 1.4))),
            ),
            press: false,
          };
        if (t > 4.6 && t < 5.6)
          return {
            point: new THREE.Vector3(-0.35, 0.15, 0.95),
            press: t > 5.1,
          };
        return null;
      },
    },
    dispose() {
      disposeTree(root, new Set([env]));
    },
  };
  reset();
  return exhibit;
}
