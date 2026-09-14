"use client";

import type { GalleryViewMode } from "@/lib/gallery-url";

function GridIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="size-3.5"
    >
      <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1" />
      <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1" />
      <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1" />
      <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function SingleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="size-3.5"
    >
      <rect x="2" y="2.5" width="10" height="9" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

type GalleryViewToggleProps = {
  mode: GalleryViewMode;
  onChange: (mode: GalleryViewMode) => void;
};

export function GalleryViewToggle({ mode, onChange }: GalleryViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Gallery view"
      className="inline-flex items-center border border-white/15"
    >
      <button
        type="button"
        aria-pressed={mode === "single"}
        onClick={() => onChange("single")}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase transition ${
          mode === "single"
            ? "bg-white text-black"
            : "text-white/45 hover:text-white/75"
        }`}
      >
        <SingleIcon />
        Single
      </button>
      <button
        type="button"
        aria-pressed={mode === "grid"}
        onClick={() => onChange("grid")}
        className={`flex items-center gap-1.5 border-l border-white/15 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase transition ${
          mode === "grid"
            ? "bg-white text-black"
            : "text-white/45 hover:text-white/75"
        }`}
      >
        <GridIcon />
        Grid
      </button>
    </div>
  );
}
