/**
 * Shared types for PALETTE.
 * Every colour the app produces is a fully-described `Color` object so the
 * UI never has to re-derive values it already computed during extraction.
 */

export interface RGB {
  r: number; // 0–255
  g: number; // 0–255
  b: number; // 0–255
}

export interface HSL {
  h: number; // 0–360 (degrees)
  s: number; // 0–100 (percent)
  l: number; // 0–100 (percent)
}

export interface Color {
  /** Uppercase hex string, e.g. "#E8D5B7" */
  hex: string;
  rgb: RGB;
  hsl: HSL;
  /** Approximate, design-language colour name derived from HSL */
  name: string;
  /** Share of the sampled image this colour covers, 0–100 */
  frequency: number;
}

/** The three export formats offered in the export bar. */
export type ExportFormat = "hex" | "css" | "figma";

/** Processing lifecycle for the page. */
export type Status = "idle" | "loading" | "ready" | "error";
