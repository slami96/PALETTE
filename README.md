# PALETTE

**Drop an image → extract its six dominant colours → copy them in HEX, CSS variables, or Figma tokens.**

A small, focused tool that pulls a usable colour palette out of any image entirely in the browser — no backend, no upload, no external colour library. The colour quantization is implemented from scratch in TypeScript.

![PALETTE](./public/preview.png)

---

## What this demonstrates

PALETTE is a deliberate dual signal — design thinking *and* algorithm implementation:

- **Canvas API pixel manipulation** — images are drawn to an off-screen canvas and read back with `getImageData()` for raw RGBA sampling.
- **Median Cut quantization, hand-written** — a classic colour-reduction algorithm implemented in plain TypeScript (`lib/medianCut.ts`), no `node-vibrant`, no `color-thief`.
- **Strict TypeScript** — `strict` mode on, zero `any`. Every colour is a fully typed `Color` object with hex, RGB, HSL, an approximate name, and a frequency share.
- **Design-tool thinking** — perceptually ordered swatches, a heuristic colour-naming system using design language (Ochre, Celadon, Periwinkle…), and developer-friendly export formats.

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Colour maths | Custom — Canvas API only |
| Hosting | Vercel |

> Built against the latest stable releases at time of writing (Next 16, React 19, Tailwind 4). The brief targeted Next 15; everything used here is App Router + React 19 and runs identically on either.

---

## How Median Cut works (plain English)

The goal is to reduce thousands of pixel colours down to a handful of representative ones.

1. **One box.** Every sampled pixel is dropped into a single "box" in RGB colour space.
2. **Find the longest axis.** For that box, measure how spread out the red, green and blue values are. Whichever channel varies the most is the axis we cut along.
3. **Cut at the median.** Sort the pixels along that axis and split the box in half at the middle pixel. Now there are two boxes, each holding half the pixels.
4. **Repeat.** Do this across every box, three times over: 1 → 2 → 4 → 8 boxes.
5. **Trim to six.** Merge the smallest boxes together until six remain.
6. **Average each box.** The mean colour of the pixels in each box becomes one palette colour.

Cutting at the *median* (instead of the geometric midpoint) keeps a roughly equal number of pixels on each side, so the palette follows where colour actually concentrates in the image rather than being pulled around by a few stray pixels.

Finally the six colours are ordered by **perceived luminance** (`0.299·R + 0.587·G + 0.114·B`) so the palette reads cleanly from dark to light.

Implementation lives in [`lib/medianCut.ts`](./lib/medianCut.ts); conversions, naming and exports in [`lib/colourUtils.ts`](./lib/colourUtils.ts).

---

## Performance & constraints

- All processing is **client-side only** (`'use client'`). Files never leave the browser.
- The sampling canvas is created in code and **never mounted in the DOM**.
- Images larger than 800px are **downsampled** before sampling, and only every 4th pixel is read — fast even on large photos.
- Heavy work runs after a `requestAnimationFrame` so the loading skeleton paints first and the UI thread never visibly blocks.
- Max file size **10MB**; accepts JPG, PNG, WEBP and GIF (first frame).

---

## Run locally

Requires Node.js 18.18+ (Node 20+ recommended).

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # next lint
```

---

## Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js — no configuration needed. Hit **Deploy**.

Or from the CLI:

```bash
npm i -g vercel
vercel
```

---

## Project structure

```
app/
  layout.tsx          fonts (Syne + JetBrains Mono), metadata
  page.tsx            upload, processing, state, layout
  globals.css         Tailwind v4 theme tokens + scrollbar + keyframes
components/
  DropZone.tsx        drag & drop / click upload (empty state)
  ImagePreview.tsx    uploaded image + reset
  PaletteDisplay.tsx  swatches, loading skeleton, export bar
  ColourSwatch.tsx    one swatch — hover detail, copy-on-click
  ExportBar.tsx       HEX / CSS VARS / FIGMA TOKENS selector + copy
  Toast.tsx           copy confirmation
lib/
  medianCut.ts        the quantization algorithm
  colourUtils.ts      hex/rgb/hsl, luminance, naming, export, clipboard
  types.ts            Color and shared types
```

---

Built by **Adam Slamen** — Multimedia Design & Creative Developer.
