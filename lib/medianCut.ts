/**
 * medianCut — colour quantization from raw image pixels.
 *
 * The Median Cut algorithm (Heckbert, 1980) groups an image's pixels into a
 * small number of representative colours:
 *
 *   1. Put every sampled pixel into a single "box" in RGB space.
 *   2. Find the colour channel (R, G or B) with the widest spread in that box,
 *      sort the pixels along it, and split the box at its median. This yields
 *      two boxes, each holding half the pixels.
 *   3. Repeat the split `depth` times across all boxes, doubling the count each
 *      pass: depth 3 → 2³ = 8 boxes.
 *   4. Optionally merge the smallest boxes until the desired count remains.
 *   5. Average the pixels inside each final box to get one colour per box.
 *
 * Splitting at the median (rather than the midpoint) keeps roughly equal pixel
 * mass in each box, so the resulting palette tracks where colour actually lives
 * in the image instead of being skewed by sparse outliers.
 */

import type { Color, RGB } from "./types";
import { nameColour, perceivedLuminance, rgbToHex, rgbToHsl } from "./colourUtils";

type Channel = keyof RGB;

interface ColorBox {
  pixels: RGB[];
}

/** Range (max − min) of one channel across a set of pixels. */
function channelRange(pixels: readonly RGB[], channel: Channel): number {
  let min = 255;
  let max = 0;
  for (const p of pixels) {
    const v = p[channel];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return max - min;
}

/** The channel with the widest spread — the axis we split along. */
function widestChannel(pixels: readonly RGB[]): Channel {
  const r = channelRange(pixels, "r");
  const g = channelRange(pixels, "g");
  const b = channelRange(pixels, "b");
  if (r >= g && r >= b) return "r";
  if (g >= b) return "g";
  return "b";
}

/** Split a box into two halves at the median of its widest channel. */
function splitBox(box: ColorBox): [ColorBox, ColorBox] {
  const channel = widestChannel(box.pixels);
  const sorted = [...box.pixels].sort((a, b) => a[channel] - b[channel]);
  const mid = sorted.length >> 1;
  return [{ pixels: sorted.slice(0, mid) }, { pixels: sorted.slice(mid) }];
}

/** Recursively split every box `depth` times (1 box → 2^depth boxes). */
function medianCut(boxes: ColorBox[], depth: number): ColorBox[] {
  if (depth === 0) return boxes;

  const next: ColorBox[] = [];
  for (const box of boxes) {
    if (box.pixels.length <= 1) {
      next.push(box);
      continue;
    }
    const [a, b] = splitBox(box);
    next.push(a, b);
  }
  return medianCut(next, depth - 1);
}

/** Merge the two smallest boxes repeatedly until `target` boxes remain. */
function reduceBoxes(boxes: ColorBox[], target: number): ColorBox[] {
  const result = boxes.filter((box) => box.pixels.length > 0);

  while (result.length > target) {
    result.sort((a, b) => a.pixels.length - b.pixels.length);
    const smallest = result.shift();
    const nextSmallest = result.shift();
    if (!smallest || !nextSmallest) break;
    result.push({ pixels: [...smallest.pixels, ...nextSmallest.pixels] });
  }

  return result;
}

/** Mean RGB colour of every pixel in a box. */
function averageColour(pixels: readonly RGB[]): RGB {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const p of pixels) {
    r += p.r;
    g += p.g;
    b += p.b;
  }
  const n = pixels.length || 1;
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
  };
}

export interface ExtractOptions {
  /** How many colours to return. */
  count?: number;
  /** Sample every Nth pixel for speed (4 = every 4th pixel). */
  sampleStep?: number;
  /** Median-cut recursion depth (3 → 8 boxes before merging). */
  depth?: number;
}

/**
 * Extract a palette of dominant colours from raw canvas image data.
 *
 * @param imageData  Output of CanvasRenderingContext2D.getImageData().
 * @returns          Colours sorted from darkest to lightest by perceived
 *                   luminance. Returns an empty array if no opaque pixels
 *                   were found.
 */
export function extractPalette(
  imageData: ImageData,
  { count = 6, sampleStep = 4, depth = 3 }: ExtractOptions = {},
): Color[] {
  const { data } = imageData;
  const stride = 4 * Math.max(1, sampleStep); // 4 bytes per pixel (RGBA)
  const pixels: RGB[] = [];

  for (let i = 0; i + 3 < data.length; i += stride) {
    const alpha = data[i + 3] as number;
    if (alpha < 125) continue; // skip (mostly) transparent pixels
    pixels.push({
      r: data[i] as number,
      g: data[i + 1] as number,
      b: data[i + 2] as number,
    });
  }

  if (pixels.length === 0) return [];

  const totalSampled = pixels.length;
  const boxes = medianCut([{ pixels }], depth);
  const finalBoxes = reduceBoxes(boxes, count);

  const colours: Color[] = finalBoxes.map((box) => {
    const rgb = averageColour(box.pixels);
    const hsl = rgbToHsl(rgb);
    return {
      hex: rgbToHex(rgb),
      rgb,
      hsl,
      name: nameColour(hsl),
      frequency: Math.round((box.pixels.length / totalSampled) * 100),
    };
  });

  colours.sort((a, b) => perceivedLuminance(a.rgb) - perceivedLuminance(b.rgb));
  return colours;
}
