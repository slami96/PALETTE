/**
 * colourUtils — pure colour maths plus a couple of small browser helpers.
 *
 * No external colour library is used anywhere in PALETTE: every conversion,
 * the perceived-luminance weighting and the naming heuristic are implemented
 * here by hand. Keeping these pure (no DOM) makes them trivially testable.
 */

import type { Color, ExportFormat, HSL, RGB } from "./types";

/* ------------------------------------------------------------------ *
 * Conversions
 * ------------------------------------------------------------------ */

/** Clamp a number into the 0–255 byte range and round it. */
function toByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Convert an RGB triple to an uppercase hex string ("#RRGGBB"). */
export function rgbToHex({ r, g, b }: RGB): string {
  const hex = (n: number): string => toByte(n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/** Convert an RGB triple to HSL with h in degrees and s/l in percent. */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Perceived luminance using the standard ITU-R BT.601 weighting.
 * Used to order the palette from darkest to lightest.
 */
export function perceivedLuminance({ r, g, b }: RGB): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/* ------------------------------------------------------------------ *
 * Naming — a design-language heuristic, not CSS colour names
 * ------------------------------------------------------------------ */

/**
 * Map an HSL value to an approximate, evocative colour name.
 *
 * The approach: deal with the achromatic (near-grey) cases first by
 * lightness, then split chromatic colours into hue bands and refine each
 * band by saturation and lightness. ~50 distinct names are reachable.
 */
export function nameColour({ h, s, l }: HSL): string {
  // --- Achromatic: very low saturation reads as a neutral ---------------
  if (s <= 10) {
    if (l <= 8) return "Onyx";
    if (l <= 20) return "Charcoal";
    if (l <= 38) return "Graphite";
    if (l <= 55) return "Stone";
    if (l <= 72) return "Ash";
    if (l <= 88) return "Mist";
    return "Porcelain";
  }

  // --- Near-black / near-white regardless of hue ------------------------
  if (l <= 9) return "Onyx";
  if (l >= 95) return "Porcelain";

  const warmTint = (light: string, mid: string, dark: string): string =>
    l >= 78 ? light : l <= 28 ? dark : mid;

  // --- Hue bands --------------------------------------------------------
  // Red
  if (h < 15 || h >= 345) {
    if (s <= 35) return warmTint("Blush", "Clay", "Mahogany");
    return warmTint("Coral", "Crimson", "Maroon");
  }
  // Red-orange
  if (h < 30) {
    if (s <= 35) return warmTint("Peach", "Terracotta", "Sienna");
    return warmTint("Apricot", "Rust", "Brick");
  }
  // Orange
  if (h < 45) {
    if (s <= 35) return warmTint("Sand", "Ochre", "Bronze");
    return warmTint("Tangerine", "Amber", "Caramel");
  }
  // Yellow
  if (h < 65) {
    if (s <= 30) return warmTint("Cream", "Khaki", "Olive");
    return warmTint("Butter", "Gold", "Mustard");
  }
  // Yellow-green
  if (h < 90) {
    if (s <= 30) return warmTint("Linen", "Moss", "Fern");
    return warmTint("Citron", "Lime", "Avocado");
  }
  // Green
  if (h < 150) {
    if (s <= 30) return warmTint("Celadon", "Sage", "Pine");
    return warmTint("Mint", "Emerald", "Forest");
  }
  // Teal
  if (h < 185) {
    if (s <= 30) return warmTint("Seafoam", "Slate Teal", "Spruce");
    return warmTint("Aqua", "Teal", "Deep Teal");
  }
  // Cyan
  if (h < 205) {
    return warmTint("Ice", "Lagoon", "Petrol");
  }
  // Blue
  if (h < 245) {
    if (s <= 30) return warmTint("Powder", "Steel", "Slate");
    return warmTint("Sky Blue", "Azure", "Navy");
  }
  // Indigo
  if (h < 270) {
    return warmTint("Periwinkle", "Indigo", "Midnight");
  }
  // Violet
  if (h < 290) {
    if (s <= 30) return warmTint("Lilac", "Heather", "Aubergine");
    return warmTint("Lavender", "Violet", "Imperial");
  }
  // Purple / Magenta
  if (h < 320) {
    if (s <= 30) return warmTint("Thistle", "Mauve", "Plum");
    return warmTint("Orchid", "Magenta", "Grape");
  }
  // Pink
  if (s <= 35) return warmTint("Rose Quartz", "Dusty Rose", "Wine");
  return warmTint("Bubblegum", "Fuchsia", "Raspberry");
}

/* ------------------------------------------------------------------ *
 * Export formatting
 * ------------------------------------------------------------------ */

/** Build the export payload for the currently selected format. */
export function formatExport(colors: readonly Color[], format: ExportFormat): string {
  switch (format) {
    case "hex":
      return JSON.stringify(
        colors.map((c) => c.hex),
        null,
        2,
      );

    case "css": {
      const lines = colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`);
      return `:root {\n${lines.join("\n")}\n}`;
    }

    case "figma": {
      const entries = colors.reduce<Record<string, { value: string; type: "color" }>>(
        (acc, c, i) => {
          acc[`${i + 1}`] = { value: c.hex, type: "color" };
          return acc;
        },
        {},
      );
      return JSON.stringify({ color: entries }, null, 2);
    }
  }
}

/* ------------------------------------------------------------------ *
 * Clipboard
 * ------------------------------------------------------------------ */

/**
 * Copy text to the clipboard using the async Clipboard API, falling back to
 * the legacy execCommand path for older browsers / insecure contexts.
 * Resolves true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
