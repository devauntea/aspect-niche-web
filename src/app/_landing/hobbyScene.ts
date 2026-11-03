import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createHobbyModels, disposeHobbyModels } from "./hobbyModels";

export type HobbyModel = "pottery" | "photography" | "foraging";
export type HobbyScene = {
  select: (hobby: HobbyModel) => void;
  pause: (paused: boolean) => void;
  rotate: () => void;
  travel: (progress: number) => void;
  dispose: () => void;
};

/** A single, demand-rendered scene. It owns every GPU resource and listener. */
export function mountHobbyScene(
  host: HTMLElement,
  initial: HobbyModel,
  paused: boolean,
): HobbyScene {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x171b1c, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 0.15, 7.2);
  camera.lookAt(0, 0, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.03);
  room.dispose();
  pmrem.dispose();
  world.environment = environment.texture;
  world.environmentIntensity = 0.75;
  world.add(new THREE.HemisphereLight(0xf8edff, 0x242d30, 0.9));
  const key = new THREE.DirectionalLight(0xffefd9, 2.6);
  key.position.set(-3, 4, 5);
  world.add(key);
  const rim = new THREE.DirectionalLight(0xb99cf3, 1.8);
  rim.position.set(3, 1, -3);
  world.add(rim);
  const assembly = new THREE.Group();
  world.add(assembly);
  const models = createHobbyModels(environment.texture);
  Object.entries(models).forEach(([id, model]) => {
    model.visible = id === initial;
    assembly.add(model);
  });
  let current = initial,
    motionPaused = paused,
    visible = true,
    disposed = false,
    lost = false;
  let frame = 0,
    last = 0,
    turn = 0,
    targetX = 0.04,
    targetY = -0.3,
    scroll = 0;
  let drag = false,
    pointerX = 0;
  let change: { from: HobbyModel; to: HobbyModel; elapsed: number } | null =
    null;
  assembly.rotation.set(targetX, targetY, 0);
  const baseMaterials = new Map<
    THREE.Material,
    { opacity: number; transparent: boolean }
  >();
  Object.values(models).forEach((model) =>
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          if (!baseMaterials.has(material))
            baseMaterials.set(material, {
              opacity: material.opacity,
              transparent: material.transparent,
            });
        }
      }
    }),
  );
  const materialOpacity = (model: THREE.Group, opacity: number) => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        const base = baseMaterials.get(material)!;
        const transparent = base.transparent || opacity < 1;
        if (material.transparent !== transparent) {
          material.transparent = transparent;
          material.needsUpdate = true;
        }
        material.opacity = opacity * base.opacity;
      }
    });
  };
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function render(time: number) {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) return;
    const dt = Math.min(0.04, (time - last) / 1000 || 0.016);
    last = time;
    const damping = motionPaused ? 1 : 1 - Math.exp(-dt * 11);
    assembly.rotation.y += (targetY - assembly.rotation.y) * damping;
    assembly.rotation.x += (targetX - assembly.rotation.x) * damping;
    assembly.position.y += (-scroll * 0.45 - assembly.position.y) * damping;
    camera.position.z += (7.2 + scroll * 0.55 - camera.position.z) * damping;
    if (change) {
      change.elapsed += dt;
      const p = motionPaused ? 1 : Math.min(1, change.elapsed / 0.56);
      const outgoing = models[change.from],
        incoming = models[change.to];
      outgoing.visible = p < 0.42;
      incoming.visible = p >= 0.42;
      if (p < 0.42) {
        const t = p / 0.42;
        materialOpacity(outgoing, 1 - t * t);
        outgoing.rotation.y = t * 0.22;
      } else {
        const t = (p - 0.42) / 0.58;
        materialOpacity(incoming, Math.min(1, t * 2));
        incoming.rotation.y = -0.24 * Math.pow(1 - t, 3);
        incoming.scale.setScalar(1 - 0.06 * Math.pow(1 - t, 3));
      }
      if (p === 1) {
        outgoing.rotation.y = 0;
        incoming.rotation.y = 0;
        incoming.scale.setScalar(1);
        materialOpacity(outgoing, 1);
        materialOpacity(incoming, 1);
        change = null;
      }
    }
    renderer.render(world, camera);
    if (
      change ||
      Math.abs(targetY - assembly.rotation.y) > 0.0008 ||
      Math.abs(targetX - assembly.rotation.x) > 0.0008 ||
      Math.abs(-scroll * 0.45 - assembly.position.y) > 0.001 ||
      Math.abs(7.2 + scroll * 0.55 - camera.position.z) > 0.001
    )
      request();
  }
  function request() {
    if (!frame && visible && !document.hidden && !disposed && !lost)
      frame = requestAnimationFrame(render);
  }
  function resize() {
    if (disposed || !host.clientWidth || !host.clientHeight) return;
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    request();
  }
  const onVisibility = () => {
    if (document.hidden) stop();
    else {
      last = 0;
      request();
    }
  };
  const onDown = (event: PointerEvent) => {
    if (motionPaused) return;
    drag = true;
    pointerX = event.clientX;
    host.setPointerCapture(event.pointerId);
  };
  const onUp = () => {
    drag = false;
  };
  const onMove = (event: PointerEvent) => {
    if (motionPaused || !visible) return;
    const rect = host.getBoundingClientRect();
    if (drag) {
      turn += (event.clientX - pointerX) * 0.007;
      pointerX = event.clientX;
    }
    targetY =
      -0.3 +
      turn +
      (drag ? 0 : ((event.clientX - rect.left) / rect.width - 0.5) * 0.28);
    targetX = 0.04 + ((event.clientY - rect.top) / rect.height - 0.5) * 0.16;
    request();
  };
  const onLeave = () => {
    if (!drag) {
      targetY = -0.3 + turn;
      targetX = 0.04;
      request();
    }
  };
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    stop();
    host.dataset.scene = "fallback";
    renderer.domElement.hidden = true;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      last = 0;
      request();
    } else stop();
  });
  intersection.observe(host);
  document.addEventListener("visibilitychange", onVisibility);
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("pointerleave", onLeave);
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  host.dataset.scene = "ready";
  resize();
  return {
    select(next) {
      if (next === current) return;
      Object.values(models).forEach((model) => {
        materialOpacity(model, 1);
        model.rotation.y = 0;
        model.scale.setScalar(1);
        model.visible = false;
      });
      const from = current;
      current = next;
      turn = 0;
      targetY = -0.3;
      targetX = 0.04;
      if (motionPaused) {
        change = null;
        models[next].visible = true;
      } else {
        models[from].visible = true;
        change = { from, to: next, elapsed: 0 };
      }
      request();
    },
    pause(next) {
      motionPaused = next;
      if (next) {
        scroll = 0;
        targetX = 0.04;
        targetY = -0.3 + turn;
      }
      request();
    },
    rotate() {
      turn += Math.PI / 3;
      targetY = -0.3 + turn;
      request();
    },
    travel(progress) {
      if (motionPaused) return;
      const next = Math.max(0, Math.min(1, progress));
      if (Math.abs(next - scroll) > 0.001) {
        scroll = next;
        request();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      disposeHobbyModels(models);
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.scene;
    },
  };
}
