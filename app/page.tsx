"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DropZone from "@/components/DropZone";
import ImagePreview from "@/components/ImagePreview";
import PaletteDisplay from "@/components/PaletteDisplay";
import Toast from "@/components/Toast";
import { extractPalette } from "@/lib/medianCut";
import { copyToClipboard } from "@/lib/colourUtils";
import type { Color, Status } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 800; // downsample large images before sampling
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Draw an image onto an off-screen canvas (never added to the DOM),
 * downsampling very large images first, then run Median Cut on the pixels.
 */
function processImage(img: HTMLImageElement): Color[] {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  return extractPalette(imageData, { count: 6, sampleStep: 4, depth: 3 });
}

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<Color[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported file. Use JPG, PNG, WEBP or GIF.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("That image is over 10MB. Try a smaller file.");
      setStatus("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
      }
    };
    reader.onerror = () => {
      setError("Could not read that file.");
      setStatus("error");
    };
    reader.readAsDataURL(file);
  }, []);

  // Process whenever a new image source is set.
  useEffect(() => {
    if (!imageSrc) return;

    let cancelled = false;
    setStatus("loading");

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      // Defer the heavy work one frame so the loading skeleton paints first.
      requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          const colours = processImage(img);
          if (cancelled) return;
          if (colours.length === 0) {
            setError("Couldn't find any colours in that image.");
            setStatus("error");
            return;
          }
          setPalette(colours);
          setStatus("ready");
        } catch {
          setError("Something went wrong while reading that image.");
          setStatus("error");
        }
      });
    };
    img.onerror = () => {
      if (cancelled) return;
      setError("Could not load that image.");
      setStatus("error");
    };
    img.src = imageSrc;

    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  const handleReset = useCallback(() => {
    setImageSrc(null);
    setPalette([]);
    setStatus("idle");
    setError(null);
  }, []);

  const handleCopy = useCallback(
    async (text: string, label: string) => {
      const ok = await copyToClipboard(text);
      showToast(ok ? `${label} copied` : "Copy failed — try again");
    },
    [showToast],
  );

  const showResult = status === "loading" || status === "ready";

  return (
    <main className="min-h-screen">
      {!showResult ? (
        <DropZone onFile={handleFile} error={error} />
      ) : (
        <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[45fr_55fr] md:gap-12 md:px-10 md:py-16">
          <ImagePreview src={imageSrc} onReset={handleReset} />
          <PaletteDisplay
            colors={palette}
            status={status}
            onCopy={handleCopy}
          />
        </div>
      )}

      <Toast message={toast} />
    </main>
  );
}
