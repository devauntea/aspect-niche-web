import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type {
  Exhibit,
  ExhibitContext,
  HobbyId,
  Phase,
  PointerInfo,
} from "./scenes/kit";
import { clamp, damp, smooth } from "./scenes/kit";
import { createPottery, type PotteryForm } from "./scenes/pottery";
import { createPhotography } from "./scenes/photography";
import { createForaging } from "./scenes/foraging";

export type HobbyModel = HobbyId;
export type { Phase, PotteryForm };

export type SceneEvents = {
  /** A phase change, with a sentence worth announcing when it completes. */
  onPhase: (id: HobbyModel, phase: Phase, announcement?: string) => void;
  /** The primary action's label may have changed. */
  onChanged: () => void;
  onAnnounce: (text: string) => void;
  /** The preview changed exhibits (keeps the chips in step). */
  onPreviewSelect: (id: HobbyModel) => void;
  onPreviewEnd: (reason: "finished" | "interrupted" | "skipped") => void;
  /** The GPU context came back after a loss: the caller remounts. */
  onRestored: () => void;
};

export type HobbyScene = {
  select: (hobby: HobbyModel) => void;
  pause: (paused: boolean) => void;
  rotate: (direction?: 1 | -1) => void;
  travel: (progress: number) => void;
  play: () => void;
  label: () => string;
  phase: () => Phase;
  potteryForm: () => PotteryForm;
  setPotteryForm: (form: PotteryForm) => void;
  preview: (options: { order: HobbyModel[]; short: boolean }) => void;
  stopPreview: (reason: "interrupted" | "skipped") => void;
  previewing: () => boolean;
  /** Test hook: advance the current exhibit's clock deterministically. */
  step: (seconds: number) => void;
  dispose: () => void;
};

const BUILDERS: Record<HobbyModel, (context: ExhibitContext) => Exhibit> = {
  pottery: createPottery,
  photography: createPhotography,
  foraging: createForaging,
};

const BASE_YAW = -0.18;
const BASE_PITCH = 0.0;

/**
 * One renderer, one exhibit on screen at a time. Exhibits are built lazily the
 * first time they are chosen and kept until dispose. The loop runs only while
 * the stage is visible, the tab is shown and something is moving; it drops to
 * half rate after a quiet spell and stops entirely while motion is paused.
 */
export function mountHobbyScene(
  host: HTMLElement,
  initial: HobbyModel,
  paused: boolean,
  events: SceneEvents,
): HobbyScene {
  const constrained =
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <=
      4;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !constrained,
    powerPreference: "default",
  });
  let pixelRatio = Math.min(window.devicePixelRatio, constrained ? 1.25 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);

  // Decorative overlays owned by the scene (no React re-render per frame).
  const stageLabel = document.createElement("p");
  stageLabel.className = "stage-step";
  stageLabel.setAttribute("aria-hidden", "true");
  const ghost = document.createElement("span");
  ghost.className = "stage-cursor";
  ghost.setAttribute("aria-hidden", "true");
  host.append(stageLabel, ghost);

  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.03);
  room.dispose();
  pmrem.dispose();
  world.environment = environment.texture;
  world.environmentIntensity = 0.7;
  world.add(new THREE.HemisphereLight(0xf2e9ff, 0x1d2333, 0.85));
  const key = new THREE.DirectionalLight(0xffecd6, 2.5);
  key.position.set(-3, 5, 5);
  world.add(key);
  const rim = new THREE.DirectionalLight(0xb99cf3, 2.0);
  rim.position.set(4, 2, -4);
  world.add(rim);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.5);
  fill.position.set(3, -1, 4);
  world.add(fill);

  const assembly = new THREE.Group();
  world.add(assembly);

  const exhibits = new Map<HobbyModel, Exhibit>();
  let building = false;
  const stageTexts = new Map<HobbyModel, string>();
  let primed = false;
  let current: HobbyModel = initial;
  let motionPaused = paused;
  let visible = true;
  let disposed = false;
  let lost = false;
  let frame = 0;
  let last = 0;
  let quietFor = 0;
  let skip = false;
  let slowFrames = 0;
  let frames = 0;

  // View and input.
  let turn = 0;
  let yaw = BASE_YAW;
  let pitch = BASE_PITCH;
  let tiltX = 0;
  let tiltY = 0;
  let scroll = 0;
  let dolly = 1;
  let previewYaw = 0;
  const pointer = {
    id: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    dragging: false,
    claimed: false,
    touch: false,
  };
  let pendingMove: PointerEvent | null = null;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let swap: { to: HobbyModel; t: number } | null = null;
  let fade = 1;

  /* ------------------------------------------------------------ preview */
  type Preview = {
    order: HobbyModel[];
    index: number;
    t: number;
    short: boolean;
    settle: number;
    begun: boolean;
  };
  let preview: Preview | null = null;

  const context = (id: HobbyModel): ExhibitContext => ({
    environment: environment.texture,
    stage: (text) => {
      stageTexts.set(id, text);
      if (id === current) stageLabel.textContent = text;
    },
    phase: (phase, announcement) => {
      if (building) return;
      if (id === current) host.dataset.state = preview ? "preview" : phase;
      events.onPhase(id, phase, announcement);
      events.onChanged();
    },
    changed: () => {
      if (!building) events.onChanged();
    },
    announce: (text) => events.onAnnounce(text),
    still: () => motionPaused,
    cursor: (kind) => {
      if (id !== current) return;
      host.dataset.cursor = kind;
    },
  });

  function exhibit(id: HobbyModel) {
    let found = exhibits.get(id);
    if (!found) {
      // Exhibits report state while they build; nothing listens until done.
      building = true;
      try {
        found = BUILDERS[id](context(id));
      } finally {
        building = false;
      }
      found.root.visible = false;
      assembly.add(found.root);
      exhibits.set(id, found);
      // Under paused motion the scene shows each finished piece, not a lump.
      if (motionPaused) found.finish();
    }
    return found;
  }
  exhibit(initial).root.visible = true;
  host.dataset.state = exhibit(initial).phase;

  // Shader programs compile in parallel where the browser allows it, so a
  // first switch to an exhibit never stalls on an empty stage.
  const compiled = new Map<HobbyModel, Promise<void>>();
  function prepare(id: HobbyModel) {
    let ready = compiled.get(id);
    if (!ready) {
      const ex = exhibit(id);
      const shown = ex.root.visible;
      ex.root.visible = true;
      // Never wait on the GPU forever: after a short grace period the
      // exhibit is shown and any remaining programs compile on first draw.
      ready = Promise.race([
        renderer.compileAsync(ex.root, camera, world).catch(() => undefined),
        new Promise((resolve) => window.setTimeout(resolve, 2500)),
      ]).then(() => undefined);
      ex.root.visible = shown;
      compiled.set(id, ready);
    }
    return ready;
  }

  function frameCamera(dt: number) {
    const view = exhibit(current).view;
    const aspect = camera.aspect || 1;
    // Narrow stages step back so the diorama stays inside the frame.
    const fit = Math.max(1, 1.28 / aspect) * dolly;
    const distance = view.distance * fit * (1 + scroll * 0.12);
    const pos = new THREE.Vector3(
      view.target.x,
      view.target.y + view.height * fit,
      view.target.z + distance,
    );
    if (dt === 0) camera.position.copy(pos);
    else camera.position.lerp(pos, 1 - Math.exp(-dt * 6));
    camera.lookAt(view.target.x, view.target.y - scroll * 0.4, view.target.z);
  }

  function beginStep() {
    if (!preview) return;
    const id = preview.order[preview.index];
    preview.t = 0;
    preview.settle = 0.45;
    preview.begun = false;
    if (id !== current) {
      events.onPreviewSelect(id);
      choose(id, true);
    }
    host.dataset.state = "preview";
  }

  function endPreview(reason: "finished" | "interrupted" | "skipped") {
    if (!preview) return;
    const visited = preview.order.slice(0, preview.index + 1);
    preview = null;
    ghost.classList.remove("on", "press");
    previewYaw = 0;
    dolly = 1;
    // Nothing is left half done: every exhibit the preview touched (other than
    // the one now on screen, which keeps going) is brought to its finished state.
    for (const id of visited) if (id !== current) exhibit(id).finish();
    if (reason === "finished") {
      const first = visited[0];
      if (first !== current) {
        events.onPreviewSelect(first);
        choose(first, false);
      }
      exhibit(current).finish();
    }
    host.dataset.state = exhibit(current).phase;
    events.onPreviewEnd(reason);
    request();
  }

  function stepPreview(dt: number) {
    if (!preview) return 1;
    // Wait until the exhibit for this step is actually on screen.
    if (swap || preview.order[preview.index] !== current) return 1;
    const ex = exhibit(current);
    if (!preview.begun) {
      preview.begun = true;
      ex.reset();
      ex.demo.begin();
    }
    if (preview.settle > 0) {
      preview.settle -= dt;
      return ex.demo.rate;
    }
    preview.t += dt;
    const t = preview.t;
    const progress = clamp(t / ex.demo.duration);
    // A slow dolly-in and a gentle arc around the piece.
    dolly = 1.06 - 0.1 * smooth(progress);
    previewYaw = -0.22 + 0.36 * smooth(progress);
    const cue = ex.demo.cursor(t);
    if (cue) {
      const p = cue.point.clone();
      ex.root.localToWorld(p);
      p.project(camera);
      const rect = host.getBoundingClientRect();
      ghost.style.transform = `translate(${((p.x + 1) / 2) * rect.width}px, ${((1 - p.y) / 2) * rect.height}px)`;
      ghost.classList.add("on");
      ghost.classList.toggle("press", cue.press);
    } else ghost.classList.remove("on", "press");
    if (t >= ex.demo.duration) {
      // Abbreviate on slow devices: show only what has already played.
      if (preview.short || preview.index >= preview.order.length - 1)
        endPreview("finished");
      else {
        preview.index++;
        beginStep();
      }
    }
    return ex.demo.rate;
  }

  /* --------------------------------------------------------------- loop */
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function request() {
    if (!frame && visible && !document.hidden && !disposed && !lost)
      frame = requestAnimationFrame(render);
  }

  function processPointer() {
    if (!pendingMove) return;
    const event = pendingMove;
    pendingMove = null;
    const info = pick(event);
    if (!pointer.dragging) exhibit(current).hover(info);
    const rect = host.getBoundingClientRect();
    if (!pointer.dragging && !pointer.touch) {
      tiltY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.16;
      tiltX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.08;
    }
  }

  function render(time: number) {
    frame = 0;
    if (disposed || lost || !visible || document.hidden || !primed) return;
    // Capped so a stalled tab resumes calmly, but real time down to 10 fps.
    const raw = last ? Math.min(0.1, (time - last) / 1000) : 1 / 60;
    last = time;
    frames++;
    // Adaptive resolution: sustained slow frames lower the pixel ratio once.
    if (frames > 30 && raw > 0.028) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 45 && pixelRatio > 1) {
      pixelRatio = 1;
      renderer.setPixelRatio(1);
      resize();
      slowFrames = 0;
      if (preview) preview.short = true;
    }
    // After a quiet spell, idle animation renders every other frame.
    quietFor += raw;
    if (quietFor > 12 && !preview) {
      skip = !skip;
      if (skip) {
        frame = requestAnimationFrame(render);
        return;
      }
    }
    const dt = motionPaused ? 0.5 : skip ? raw * 2 : raw;
    processPointer();

    // Exhibit swap: a short fade through the stage background.
    if (swap) {
      swap.t += motionPaused ? 1 : dt;
      fade = motionPaused ? 1 : Math.abs(1 - swap.t / 0.2);
      if (swap.t >= 0.2 && current !== swap.to) {
        exhibit(current).root.visible = false;
        exhibit(current).hover(null);
        current = swap.to;
        const next = exhibit(current);
        next.root.visible = true;
        next.update(0, 0);
        stageLabel.textContent = stageTexts.get(current) ?? "";
        frameCamera(0);
        host.dataset.state = preview ? "preview" : next.phase;
        events.onChanged();
      }
      if (swap.t >= 0.4) {
        swap = null;
        fade = 1;
      }
      renderer.domElement.style.opacity = String(clamp(fade));
    }

    const rate = stepPreview(dt);
    const ex = exhibit(current);
    const moving = ex.update(motionPaused ? 0.5 : dt * rate, time / 1000);
    const targetYaw = BASE_YAW + turn + tiltY + previewYaw;
    const targetPitch = BASE_PITCH + tiltX;
    yaw = motionPaused ? targetYaw : damp(yaw, targetYaw, 7, dt);
    pitch = motionPaused ? targetPitch : damp(pitch, targetPitch, 7, dt);
    assembly.rotation.set(pitch, yaw, 0);
    frameCamera(motionPaused ? 0 : dt);
    renderer.render(world, camera);
    // The poster gives way only once a real frame is on the canvas.
    if (host.dataset.scene !== "ready" && !lost) host.dataset.scene = "ready";

    const settling =
      Math.abs(targetYaw - yaw) > 0.0008 ||
      Math.abs(targetPitch - pitch) > 0.0008 ||
      !!swap ||
      !!preview;
    if (!motionPaused && (moving || settling)) request();
  }

  function resize() {
    if (disposed || !host.clientWidth || !host.clientHeight) return;
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    frameCamera(0);
    request();
  }

  /* -------------------------------------------------------------- input */
  function pick(event: { clientX: number; clientY: number }): PointerInfo {
    const rect = host.getBoundingClientRect();
    ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    assembly.updateMatrixWorld();
    const hits = raycaster
      .intersectObjects(exhibit(current).pickables, true)
      .filter((h) => h.object.visible && isShown(h.object));
    return { hit: hits[0] ?? null, ray: raycaster.ray.clone() };
  }
  const isShown = (object: THREE.Object3D) => {
    for (let o: THREE.Object3D | null = object; o; o = o.parent)
      if (!o.visible) return false;
    return true;
  };
  const interact = () => {
    quietFor = 0;
    if (preview) endPreview("interrupted");
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    interact();
    pointer.id = event.pointerId;
    pointer.startX = pointer.lastX = event.clientX;
    pointer.startY = pointer.lastY = event.clientY;
    pointer.dragging = false;
    pointer.claimed = false;
    pointer.touch = event.pointerType !== "mouse";
    if (pointer.touch) exhibit(current).hover(pick(event));
    try {
      host.setPointerCapture(event.pointerId);
    } catch {
      // The pointer may already be gone (a very quick tap): capture is optional.
    }
    request();
  };
  const onMove = (event: PointerEvent) => {
    if (!visible) return;
    if (pointer.id === event.pointerId) {
      const dx = event.clientX - pointer.lastX,
        dy = event.clientY - pointer.lastY;
      if (
        !pointer.dragging &&
        Math.hypot(
          event.clientX - pointer.startX,
          event.clientY - pointer.startY,
        ) > 6
      ) {
        pointer.dragging = true;
        quietFor = 0;
        pointer.claimed = exhibit(current).dragStart(
          pick({ clientX: pointer.startX, clientY: pointer.startY }),
        );
        if (!pointer.claimed) host.dataset.cursor = "grabbing";
      }
      if (pointer.dragging) {
        if (pointer.claimed) exhibit(current).drag(pick(event), dx, dy);
        else turn += dx * 0.008;
      }
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
    }
    pendingMove = event;
    if (motionPaused) processPointer();
    request();
  };
  const onUp = (event: PointerEvent) => {
    if (pointer.id !== event.pointerId) return;
    const ex = exhibit(current);
    if (pointer.dragging) {
      if (pointer.claimed) ex.dragEnd();
      host.dataset.cursor = "default";
    } else if (event.type === "pointerup") ex.click(pick(event));
    if (pointer.touch) ex.hover(null);
    pointer.id = -1;
    pointer.dragging = pointer.claimed = false;
    request();
  };
  const onLeave = () => {
    if (pointer.dragging) return;
    tiltX = tiltY = 0;
    pendingMove = null;
    exhibit(current).hover(null);
    request();
  };
  const onKey = (event: KeyboardEvent) => {
    interact();
    const ex = exhibit(current);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ex.play();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      turn += event.key === "ArrowLeft" ? -0.35 : 0.35;
    } else if (ex.key(event.key)) event.preventDefault();
    events.onChanged();
    request();
  };
  const onVisibility = () => {
    if (document.hidden) stop();
    else {
      last = 0;
      request();
    }
  };
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    stop();
    if (preview) endPreview("interrupted");
    host.dataset.scene = "fallback";
    renderer.domElement.hidden = true;
  };
  const onRestored = () => events.onRestored();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      last = 0;
      request();
    } else {
      stop();
      if (preview) endPreview("interrupted");
    }
  });
  intersection.observe(host);
  document.addEventListener("visibilitychange", onVisibility);
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("keydown", onKey);
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  renderer.domElement.addEventListener("webglcontextrestored", onRestored);
  host.dataset.scene = "loading";
  resize();
  // Keep the poster up until the first exhibit's programs are ready, then
  // warm the other exhibits one idle period at a time.
  void prepare(initial).then(() => {
    if (disposed) return;
    primed = true;
    request();
    const queue = (Object.keys(BUILDERS) as HobbyModel[]).filter(
      (id) => id !== initial,
    );
    const idle = (fn: () => void) =>
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(fn, { timeout: 2500 })
        : window.setTimeout(fn, 600);
    const warm = () => {
      const id = queue.shift();
      if (!id || disposed) return;
      void prepare(id).then(() => idle(warm));
    };
    idle(warm);
  });

  let wanted: HobbyModel = initial;
  function choose(next: HobbyModel, fromPreview: boolean) {
    if (!fromPreview && preview) endPreview("interrupted");
    wanted = next;
    void prepare(next).then(() => {
      // Only the latest choice wins; a quick run of clicks never stacks.
      if (disposed || wanted !== next) return;
      if (next === current && !swap) return;
      turn = 0;
      if (motionPaused) {
        exhibit(current).root.visible = false;
        current = next;
        exhibit(current).root.visible = true;
        host.dataset.state = exhibit(current).phase;
        frameCamera(0);
        events.onChanged();
      } else if (!swap || swap.to !== next)
        swap = { to: next, t: swap ? 0.2 - Math.min(0.2, swap.t) : 0 };
      request();
    });
  }

  return {
    select(next) {
      if (preview && next === preview.order[preview.index]) return;
      if (swap && swap.to === next) return;
      choose(next, false);
    },
    pause(next) {
      motionPaused = next;
      if (next) {
        if (preview) endPreview("interrupted");
        scroll = 0;
        exhibits.forEach((ex) => {
          if (ex.phase === "active") ex.finish();
        });
      }
      last = 0;
      request();
    },
    rotate(direction = 1) {
      interact();
      turn += (direction * Math.PI) / 4;
      request();
    },
    travel(progress) {
      if (motionPaused) return;
      const next = clamp(progress);
      if (Math.abs(next - scroll) > 0.001) {
        scroll = next;
        request();
      }
    },
    play() {
      interact();
      exhibit(current).play();
      events.onChanged();
      request();
    },
    label: () => exhibit(current).label(),
    phase: () => exhibit(current).phase,
    potteryForm: () =>
      (exhibit("pottery") as Exhibit & { form: () => PotteryForm }).form(),
    setPotteryForm(form) {
      interact();
      (
        exhibit("pottery") as Exhibit & { setForm: (f: PotteryForm) => void }
      ).setForm(form);
      events.onChanged();
      request();
    },
    preview({ order, short }) {
      if (motionPaused || preview || !order.length) return;
      preview = { order, index: 0, t: 0, short, settle: 0, begun: false };
      quietFor = 0;
      beginStep();
      request();
    },
    stopPreview(reason) {
      endPreview(reason);
    },
    previewing: () => !!preview,
    step(seconds) {
      const ex = exhibit(current);
      for (let t = 0; t < seconds; t += 1 / 30) ex.update(1 / 30, 0);
      request();
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
      host.removeEventListener("keydown", onKey);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onRestored,
      );
      exhibits.forEach((ex) => ex.dispose());
      exhibits.clear();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      stageLabel.remove();
      ghost.remove();
      delete host.dataset.scene;
      delete host.dataset.state;
      delete host.dataset.cursor;
    },
  };
}
