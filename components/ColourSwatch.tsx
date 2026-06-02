"use client";

import { useState } from "react";
import type { Color } from "@/lib/types";
import { perceivedLuminance } from "@/lib/colourUtils";

interface ColourSwatchProps {
  color: Color;
  index: number;
  onCopy: (text: string, label: string) => void;
}

export default function ColourSwatch({ color, index, onCopy }: ColourSwatchProps) {
  const [copied, setCopied] = useState(false);

  // Pick readable text colour for the label that sits on top of the block.
  const onLight = perceivedLuminance(color.rgb) > 150;
  const labelColor = onLight ? "rgba(8,8,8,0.85)" : "rgba(242,240,237,0.92)";
  const subColor = onLight ? "rgba(8,8,8,0.55)" : "rgba(242,240,237,0.6)";

  const handleCopy = () => {
    onCopy(color.hex, color.hex);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className="swatch-enter group"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${color.hex}`}
        className="relative flex h-[72px] w-full items-end justify-between overflow-hidden rounded-xl px-4 pb-3 text-left transition-transform duration-200 ease-out group-hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        style={{ backgroundColor: color.hex }}
      >
        <span
          className="font-display text-sm font-bold tracking-wide"
          style={{ color: labelColor }}
        >
          {color.name}
        </span>
        <span
          className="font-mono text-xs"
          style={{ color: subColor }}
        >
          {color.frequency}%
        </span>

        {/* Copied flash */}
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs tracking-widest transition-opacity duration-200 ${
            copied ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundColor: color.hex, color: labelColor }}
        >
          COPIED
        </span>
      </button>

      <div className="mt-2 flex items-baseline justify-between px-1">
        <button
          type="button"
          onClick={handleCopy}
          className="font-mono text-sm text-paper/80 transition-colors duration-200 hover:text-gold focus:outline-none focus-visible:text-gold"
        >
          {color.hex}
        </button>

        {/* RGB + HSL revealed on hover */}
        <div className="grid grid-rows-[0fr] overflow-hidden text-right font-mono text-[11px] text-paper/40 transition-all duration-300 group-hover:grid-rows-[1fr]">
          <div className="min-h-0">
            <span className="whitespace-nowrap">
              rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
            </span>
            <span className="ml-3 whitespace-nowrap">
              hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
