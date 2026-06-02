"use client";

interface ImagePreviewProps {
  src: string | null;
  onReset: () => void;
}

export default function ImagePreview({ src, onReset }: ImagePreviewProps) {
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)]">
        {src ? (
          // Local object/data URL only — next/image isn't needed and would
          // require remote-pattern config. A plain img keeps it self-contained.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="Uploaded image being analysed"
            className="block max-h-[70vh] w-full object-contain bg-black/30"
          />
        ) : (
          <div className="aspect-square w-full animate-pulse bg-white/5" />
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 self-start font-mono text-xs tracking-wide text-paper/45 transition-colors duration-200 hover:text-gold focus:outline-none focus-visible:text-gold"
      >
        ← Extract from a new image
      </button>
    </div>
  );
}
