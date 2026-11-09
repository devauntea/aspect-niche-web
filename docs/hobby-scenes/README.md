# Hobby scenes — audit, design and verification

Branch `feature/hobby-scenes`, based on `main` at `51c1d32`.

## 1. Audit: what was there

The landing hero (`src/app/_landing/Hero.tsx`) showed three procedural three.js
models. They came from `hobbyModels.ts` and were mounted by `hobbyScene.ts`. They
are the only 3D models on the site. Other hobby imagery (the gallery and pocket
SVGs, the Memory Walk photographs and the app screenshots) is flat 2D, so the
brief's "every other hobby model" item has nothing further to cover.

| Model | Geometry | Materials | Motion and interaction |
| --- | --- | --- | --- |
| Pottery | Two `LatheGeometry` profiles (vase, bowl) with a slight handmade wobble, plus a foot ring | Ceramic and lavender glaze with a 128 px bump grain; matte clay foot | None. A static still life. |
| Film camera | Extruded rounded body, layered lens cylinders and torus rings, 24 instanced focus ribs, dials, lugs | Aluminium, dark metal, leather bump, tinted lens glass, lavender badge | None |
| Foraging sprig | Tube stems, gridded curved leaf geometry, three seed heads | Two leaf greens, stem, seed | None |

Shared behaviour: the scene loaded only after the visitor pressed
"Explore in 3D". Rendering was on demand. Pointer movement tilted the whole
group, horizontal drag and the "Turn the object" button rotated it, and changing
hobby crossfaded material opacity. Scroll added a small dolly. It paused offscreen
and on hidden tabs. A lost context fell back to the poster, with no restore path.
Pixel ratio was capped at 1.5. The posters in `public/landing/app-preview/*-poster.webp`
were renders of these models.

## 2. Design

The site's direction is kept: dark ink stage, lavender accent, cream ceramics,
serif captions, and the orbit rings and rabbit label around the stage. Each hobby
becomes a small diorama with a story that has a beginning, an action and a
finished state, plus a quiet idle loop. Everything is still procedural three.js:
no new dependency and no downloaded models.

### Shared architecture (`hobbyScene.ts`, `scenes/kit.ts`)

- **One renderer, one exhibit on screen.** Exhibits are built lazily. The first
  is compiled with `compileAsync` before the poster gives way, and the others
  are built and compiled in idle callbacks. Switching waits for the target's
  programs, then fades through the stage background in 0.4 s, so a first switch
  never stalls on an empty canvas.
- **Exhibit contract** (`Exhibit` in `kit.ts`): `play`, `finish`, `reset`,
  `update`, `hover`, `click`, `dragStart`/`drag`/`dragEnd`, `key`, `label`
  and a `demo` script for the preview. Phases are explicit: `idle`, `active`
  and `completed`. The stage carries `data-state` (`idle | preview | active |
  completed`).
- **Deterministic timelines.** Every animated exhibit is a pure function of its
  own clock. A replay sets the clock to zero, and rapid input can only start,
  queue or no-op an action, never leave a half-finished tween. The latest scene
  choice wins (`wanted`), and queued photo shots and foraging picks are ordered
  on the same clock.
- **Input.** Pointer hover raycasts once per frame. Press, then move more than
  6 px, and it becomes a drag: the exhibit may claim it (print drag, pottery
  width) or the scene turns. Pointer exit clears hover and tilt. Touch uses
  `touch-action: pan-y`, so vertical swipes still scroll the page and horizontal
  drags turn the scene. A tap is a click (with a hover pass first for
  highlighting). Keyboard: the stage is focusable; Enter and Space play,
  ← and → turn, V and B switch vase or bowl, Escape closes an enlarged photo.
  Every primary action also has a real button.
- **Performance.** Instancing is used for grass, moss, leaf litter, pinecone
  scales, lens ribs, aperture ticks and dial knurling. Fern fronds are merged
  into one geometry. Textures are small procedural canvases or data textures,
  and the photographs are 384 px WebP. The loop runs only while the stage is
  visible and the tab is shown. After 12 s without input it renders every other
  frame. Sustained slow frames drop the pixel ratio to 1 once and abbreviate a
  running preview. Constrained devices (≤4 cores or ≤4 GB) start at ratio 1.25
  with antialiasing off and less grass. Reduced motion and the pause control stop
  the loop entirely; the scene then renders on demand and every action jumps to
  its finished state. All geometry, materials and textures are disposed with the
  scene. A lost context shows the poster, and a restored context remounts.
- **No React re-render loop.** Per-frame visuals (the stage step label and the
  simulated cursor) are written to the DOM by the scene. React hears only about
  phase and label changes.

### Pottery (`scenes/pottery.ts`)

A turned clay body on a wheel head inside a splash pan, with a water bowl,
sponge and wooden rib. A glazed companion piece sits on a stool, and the plinth
has a contact shadow. The clay is one lathe mesh (88 profile rows × 80 segments)
whose profile is recomputed each frame from blended control shapes: lump →
centred → opened → pulled → vase or bowl. On top of that come an off-centre
wobble that dies away as the clay centres, throwing rings, a travelling finger
indentation and an uneven rim. Two posable hands are built with forward
kinematics: capsule phalanges with joints, nails, a thenar pad, forearm and rolled
sleeve. They track the live wall radius while they centre, open, pull and shape,
then withdraw. Drying is per-vertex: the rim turns leather-hard first, then
the whole piece goes bone dry, with rising roughness, fading clearcoat, more grain
and 3.5 % shrinkage.

- Hover speeds the wheel by 35 %. Click starts or replays the throw.
- Horizontal drag during pulling or shaping sets the finished width (78–128 %).
  At other times a drag turns the scene for inspection.
- The vase/bowl toggle (or V and B) throws the chosen form. The finished scene
  always shows both: the new piece dried on the wheel and the other form glazed
  on the stool.

### Photography (`scenes/photography.ts`)

An unbranded instant camera:

- **Body:** a cream shell with a pebbled navy leatherette front, a cream top
  plate, rubber feet, a film door seam and an ejection slot with a lip.
- **Lens:** a mount ring, a rotating focus ring with 48 grip ribs and an index
  mark, an aperture ring with ticks, a bezel, three tinted glass elements, a
  baffle and a seven-blade iris.
- **Controls:** a flash with a Fresnel window, glow sprite and point light; a
  viewfinder and eyepiece; a lavender shutter button with a hover halo; a
  knurled dial, strap lugs and a frame-counter window.

The sequence runs: focus (ring turns, barrel extends, iris stops down) → shutter
press → leaf-shutter blink → flash → the print shudders out of the slot → it
lifts and develops. A shader takes it from a dark blank, through a cool ghost of
the shadows, to full colour. The print is then pinned into a composition on a
linen board, followed by two quicker shots.

- The camera turns slightly toward the cursor. Clicking the camera, the button
  or Enter takes a photo; repeats cycle through six preloaded prints and recycle
  the oldest.
- Prints can be hovered (they lift and glow), dragged across the board, and
  clicked to enlarge. Click again or press Escape to return a print.

### Foraging (`scenes/foraging.ts`)

A cut-away forest floor: a displaced soil top, a strata side with roots and grit,
moss cushions, a few hundred instanced grass blades, three merged ferns, leaf
litter, twigs, pebbles and three mushrooms. Grass and ferns sway in a breeze
through a vertex shader. A light shaft carries drifting pollen.

The sequence runs: a gust → seedlings push up and ferns unfurl → a pile of
leaves parts to reveal a pinecone → a woven basket rolls in (with a canvas weave,
bump, rim, handle and cloth lining) → a hand reaches in, pinches the pinecone,
carries it and drops it into the basket → the scene settles.

- The cursor parts nearby grass and ferns. Hover gives the discoverable finds (a
  pinecone, an acorn and a fallen golden leaf) a soft lavender glow. Click
  gathers one with the hand, and drag turns the scene.
- Safety: the collectables are seeds and a leaf for pressing, never food.
  Hovering a mushroom says "Look, don't pick: no wild mushroom can be judged safe
  by its looks". Mushrooms cannot be collected.

### First-visit preview (`previewPolicy.ts`, `Hero.tsx`, `hobbyScene.ts`)

On a capable device the live scene loads after `load` and an idle callback.
Data saver, 2G and ≤2 GB devices wait for "Explore in 3D". Once the stage is
60 % in view, the preview plays pottery, then photography, then foraging. Only
one exhibit is ever on screen. Each step has a slow dolly-in and arc and a
simulated cursor (a soft ring that shows a press), and runs its exhibit at 1.2–1.75×.
It ends back on the finished pottery with a "Drag to turn · click to play" hint.

The preview:

- can be skipped from a "Skip preview" button;
- stops on any real pointer, key, wheel or touch input anywhere, or when the
  stage scrolls out of view;
- is remembered in `localStorage`, falling back to `sessionStorage` and then to
  memory, so it never replays on later visits or remounts;
- does not play under reduced motion or the pause control;
- shows a single scene on slow devices (≤4 cores or ≤4 GB memory, or 3G), and
  is cut short if frames run slow during play;
- never holds focus or scrolling.

## 3. Changed files

- `src/app/_landing/hobbyScene.ts`: rewritten as the scene host.
- `src/app/_landing/scenes/kit.ts`, `pottery.ts`, `photography.ts`, `foraging.ts`: new.
- `src/app/_landing/hobbyModels.ts`: removed (superseded).
- `src/app/_landing/previewPolicy.ts` and `.test.ts`: new.
- `src/app/_landing/Hero.tsx`: controls, preview, announcements and remount on restore.
- `src/app/_landing/immersive.css`: stage overlays, hint, simulated cursor, buttons.
- `public/landing/instant/*.webp` and `PHOTO-CREDITS.md`: the prints and their provenance.
- `docs/hobby-scenes/README.md`: this file.
