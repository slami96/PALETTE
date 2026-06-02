"use client";

import { useState } from "react";
import type { Color, ExportFormat } from "@/lib/types";
import { formatExport } from "@/lib/colourUtils";

interface ExportBarProps {
  colors: readonly Color[];
  onCopy: (text: string, label: string) => void;
}

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "hex", label: "HEX" },
  { id: "css", label: "CSS VARS" },
  { id: "figma", label: "FIGMA TOKENS" },
];

export default function ExportBar({ colors, onCopy }: ExportBarProps) {
  const [format, setFormat] = useState<ExportFormat>("hex");

  const handleCopy = () => {
    const label = FORMATS.find((f) => f.id === format)?.label ?? "Export";
    onCopy(formatExport(colors, format), label);
  };

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <div className="flex flex-wrap items-center gap-2">
        {FORMATS.map(({ id, label }) => {
          const active = id === format;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFormat(id)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                active
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/15 text-paper/55 hover:border-white/30 hover:text-paper/80"
              }`}
            >
              {label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto rounded-full bg-gold px-5 py-1.5 font-mono text-[11px] font-medium tracking-wide text-ink transition-all duration-200 hover:bg-gold/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
