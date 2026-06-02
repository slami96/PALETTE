"use client";

import { useRef, useState } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
  error: string | null;
}

export default function DropZone({ onFile, error }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
      className={`flex min-h-screen flex-col items-center justify-center px-6 transition-colors duration-300 ${
        isDragging ? "bg-[#0f0e0c]" : "bg-transparent"
      }`}
    >
      <div
        className={`flex w-full max-w-2xl flex-col items-center rounded-3xl border border-dashed px-8 py-20 text-center transition-all duration-300 ${
          isDragging
            ? "border-gold/80 shadow-[0_0_60px_-15px_rgba(200,169,110,0.45)]"
            : "border-white/15"
        }`}
      >
        <h1 className="font-display text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
          PALETTE
        </h1>

        <p className="mt-5 font-mono text-sm text-paper/45 sm:text-base">
          Drop an image to extract its colours
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-9 rounded-full border border-white/20 px-6 py-2.5 font-mono text-xs tracking-wide text-paper/80 transition-all duration-200 hover:border-gold/70 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          Upload an image
        </button>

        <p className="mt-6 font-mono text-[11px] tracking-wide text-paper/25">
          JPG · PNG · WEBP · GIF — max 10MB
        </p>

        {error && (
          <p className="mt-6 font-mono text-xs text-red-400/90" role="alert">
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}
