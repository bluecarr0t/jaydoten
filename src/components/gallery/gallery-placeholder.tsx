import type { GalleryWork } from "@/lib/gallery-content";

const SEEDS: Record<string, number> = {
  "sm-01": 11,
  "sm-02": 23,
  "sm-03": 37,
  "sm-04": 41,
  "sm-05": 53,
  "sm-06": 67,
  "vb-01": 71,
  "vb-02": 83,
  "vb-03": 97,
  "vb-04": 101,
  "vb-05": 113,
  "vb-06": 127,
};

function gradientForWork(work: GalleryWork): string {
  const seed = SEEDS[work.id] ?? 1;
  const warm = work.location === "santa-monica";
  const h1 = warm ? 28 + (seed % 12) : 200 + (seed % 18);
  const h2 = (h1 + 35 + (seed % 20)) % 360;
  return `linear-gradient(145deg, hsl(${h1} 8% ${18 + (seed % 8)}%), hsl(${h2} 12% ${32 + (seed % 10)}%))`;
}

type GalleryPlaceholderProps = {
  work: GalleryWork;
};

export function GalleryPlaceholder({ work }: GalleryPlaceholderProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: gradientForWork(work) }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
      <p className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
        Awaiting frame
      </p>
    </div>
  );
}
