"use client";

import type { Color, Status } from "@/lib/types";
import ColourSwatch from "./ColourSwatch";
import ExportBar from "./ExportBar";

interface PaletteDisplayProps {
  colors: Color[];
  status: Status;
  onCopy: (text: string, label: string) => void;
}

const SKELETON_COUNT = 6;

export default function PaletteDisplay({
  colors,
  status,
  onCopy,
}: PaletteDisplayProps) {
  const loading = status === "loading";

  return (
    <section className="flex flex-col">
      <header className="mb-7 flex items-baseline justify-between">
        <span className="font-display text-xl font-extrabold tracking-tight">
          PALETTE
        </span>
        <span className="font-mono text-xs text-paper/40">
          {loading ? "extracting…" : `${colors.length} colours extracted`}
        </span>
      </header>

      {loading ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className="h-[72px] w-full animate-pulse rounded-xl bg-white/[0.06]"
                style={{ animationDelay: `${i * 90}ms` }}
              />
              <div className="h-3 w-24 animate-pulse rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-5">
            {colors.map((color, i) => (
              <ColourSwatch
                key={`${color.hex}-${i}`}
                color={color}
                index={i}
                onCopy={onCopy}
              />
            ))}
          </div>

          <ExportBar colors={colors} onCopy={onCopy} />
        </>
      )}
    </section>
  );
}
