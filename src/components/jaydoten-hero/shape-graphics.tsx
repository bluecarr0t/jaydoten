import { useId, type ReactNode } from "react";

export type ShapeKind =
  | "amoeba"
  | "scoop"
  | "chevron"
  | "bar"
  | "notch"
  | "wrap"
  | "triangle"
  | "disc"
  | "diamond"
  | "petal"
  | "fan"
  | "boomerang"
  | "arch"
  | "custom";

export type Piece = {
  id: string;
  kind: ShapeKind;
  fill: string;
  width: number;
  path?: string;
  viewBox?: string;
  fillRule?: "evenodd" | "nonzero";
};

const CATALOG_KINDS: ShapeKind[] = [
  "amoeba",
  "scoop",
  "chevron",
  "bar",
  "notch",
  "wrap",
  "triangle",
  "disc",
  "diamond",
  "petal",
  "fan",
  "boomerang",
  "arch",
];

const SHAPE_FILLS = [
  "#E8782C",
  "#8A62C4",
  "#2F8F46",
  "#D32F27",
  "#2F6BC4",
  "#C45A8A",
];

let generatedPieceSeq = 0;

function pickItem<T>(items: readonly T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) {
    throw new Error("Cannot pick from an empty list");
  }
  return item;
}

function polarBlobPath(
  cx: number,
  cy: number,
  count: number,
  minR: number,
  maxR: number,
): string {
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 - Math.PI * 0.12;
    const radius = minR + Math.random() * (maxR - minR);
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * (radius * (0.72 + Math.random() * 0.28)),
    });
  }
  const first = points[0];
  if (!first) {
    return "";
  }
  const parts = [`M${first.x.toFixed(1)} ${first.y.toFixed(1)}`];
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    if (!current || !next) continue;
    const mx = (current.x + next.x) / 2;
    const my = (current.y + next.y) / 2;
    parts.push(`Q${current.x.toFixed(1)} ${current.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

export function generateSculpturePiece(): Piece {
  generatedPieceSeq += 1;
  const fill = pickItem(SHAPE_FILLS);
  const width = Math.round((7.5 + Math.random() * 6.5) * 10) / 10;

  if (Math.random() < 0.42) {
    return {
      id: `p-gen-${generatedPieceSeq}`,
      kind: pickItem(CATALOG_KINDS),
      fill,
      width,
    };
  }

  const viewBox = "0 0 210 150";
  const outer = polarBlobPath(118, 75, 6 + Math.floor(Math.random() * 4), 42, 78);
  const withHole = Math.random() < 0.35;
  const path = withHole
    ? `${outer} ${polarBlobPath(124, 76, 5, 12, 22)}`
    : outer;

  return {
    id: `p-gen-${generatedPieceSeq}`,
    kind: "custom",
    fill,
    width,
    path,
    viewBox,
    fillRule: withHole ? "evenodd" : "nonzero",
  };
}

export type ShapeBite = {
  x: number;
  y: number;
  r: number;
};

export function pieceRivetShift(kind: ShapeKind): { x: number; y: number } {
  switch (kind) {
    case "notch":
      return { x: 34, y: 0 };
    case "wrap":
      return { x: 30, y: 0 };
    case "amoeba":
      return { x: 18, y: 12 };
    case "scoop":
      return { x: 10, y: -8 };
    case "chevron":
      return { x: 8, y: 6 };
    case "bar":
      return { x: 6, y: 0 };
    case "triangle":
      return { x: 24, y: 0 };
    case "disc":
      return { x: 0, y: 0 };
    case "diamond":
      return { x: 28, y: 0 };
    case "petal":
      return { x: 22, y: 0 };
    case "fan":
      return { x: 16, y: 10 };
    case "boomerang":
      return { x: 20, y: 0 };
    case "arch":
      return { x: 24, y: 12 };
    case "custom":
      return { x: 18, y: 0 };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function ShapeSvg({
  viewBox,
  fill,
  className,
  bites,
  children,
}: {
  viewBox: string;
  fill: string;
  className?: string;
  bites?: ShapeBite[];
  children: ReactNode;
}) {
  const svgClass = className ?? "h-auto w-full";
  const reactId = useId();
  const maskId = `shape-bite-${reactId.replace(/:/g, "")}`;
  const parts = viewBox.split(" ");
  const vw = Number(parts[2]);
  const vh = Number(parts[3]);
  const hasBites = Boolean(bites && bites.length > 0);

  return (
    <svg viewBox={viewBox} className={svgClass} fill={fill}>
      {hasBites ? (
        <defs>
          <mask id={maskId}>
            <rect width={vw} height={vh} fill="white" />
            {bites?.map((bite, index) => (
              <circle
                key={`${bite.x}-${bite.y}-${index}`}
                cx={bite.x * vw}
                cy={bite.y * vh}
                r={bite.r * Math.min(vw, vh)}
                fill="black"
              />
            ))}
          </mask>
        </defs>
      ) : null}
      <g mask={hasBites ? `url(#${maskId})` : undefined}>{children}</g>
    </svg>
  );
}

export function ShapeGraphic({
  kind,
  fill,
  className,
  bites,
  path,
  viewBox,
  fillRule,
}: {
  kind: ShapeKind;
  fill: string;
  className?: string;
  bites?: ShapeBite[];
  path?: string;
  viewBox?: string;
  fillRule?: "evenodd" | "nonzero";
}) {
  switch (kind) {
    case "amoeba":
      return (
        <ShapeSvg viewBox="0 0 240 150" fill={fill} className={className} bites={bites}>
          <path
            fillRule="evenodd"
            d="M18 86 46 22 112 6 176 20 232 64 216 122 148 146 72 138 16 112Z M98 56l36-8 18 28-32 22-28-16Z"
          />
        </ShapeSvg>
      );
    case "scoop":
      return (
        <ShapeSvg viewBox="0 0 240 130" fill={fill} className={className} bites={bites}>
          <path d="M4 8h176l36 18v28H132c-20 2-28 28-58 36H10L4 8Z" />
        </ShapeSvg>
      );
    case "chevron":
      return (
        <ShapeSvg viewBox="0 0 220 100" fill={fill} className={className} bites={bites}>
          <path d="M2 42 96 6l122 38v36L90 58 22 94Z" />
        </ShapeSvg>
      );
    case "bar":
      return (
        <ShapeSvg viewBox="0 0 220 48" fill={fill} className={className} bites={bites}>
          <path d="M0 16h164l36-16v48l-36-12H0Z" />
        </ShapeSvg>
      );
    case "notch":
      return (
        <ShapeSvg viewBox="0 0 230 120" fill={fill} className={className} bites={bites}>
          <path d="M8 12h204v36H118c-26 0-44 20-70 28v-2C48 92 70 108 118 108h94v12H8V12Z" />
        </ShapeSvg>
      );
    case "wrap":
      return (
        <ShapeSvg viewBox="0 0 200 180" fill={fill} className={className} bites={bites}>
          <path d="M144 21A82 82 0 1 0 144 160L125 131A48 48 0 1 1 125 49Z" />
        </ShapeSvg>
      );
    case "triangle":
      return (
        <ShapeSvg viewBox="0 0 100 72" fill={fill} className={className} bites={bites}>
          <path d="M8 8v56L94 36Z" />
        </ShapeSvg>
      );
    case "disc":
      return (
        <ShapeSvg viewBox="0 0 40 40" fill={fill} className={className} bites={bites}>
          <circle cx="20" cy="20" r="18" />
        </ShapeSvg>
      );
    case "diamond":
      return (
        <ShapeSvg viewBox="0 0 180 200" fill={fill} className={className} bites={bites}>
          <path d="M58 8 154 38l22 58-46 22 38 62-94 12L8 136l28-46L12 52Z" />
        </ShapeSvg>
      );
    case "petal":
      return (
        <ShapeSvg viewBox="0 0 200 120" fill={fill} className={className} bites={bites}>
          <path d="M12 60C18 18 72 8 188 60 72 112 18 102 12 60Z" />
        </ShapeSvg>
      );
    case "fan":
      return (
        <ShapeSvg viewBox="0 0 160 160" fill={fill} className={className} bites={bites}>
          <path d="M14 146V18A128 128 0 0 1 146 146Z" />
        </ShapeSvg>
      );
    case "boomerang":
      return (
        <ShapeSvg viewBox="0 0 200 160" fill={fill} className={className} bites={bites}>
          <path d="M8 78 86 8l36 24-48 46 52 50-40 24L8 86Z" />
        </ShapeSvg>
      );
    case "arch":
      return (
        <ShapeSvg viewBox="0 0 180 150" fill={fill} className={className} bites={bites}>
          <path
            fillRule="evenodd"
            d="M10 142V52C10 18 38 6 90 6s80 12 80 46v90h-40V58c0-16-12-24-40-24S50 42 50 58v84H10Z"
          />
        </ShapeSvg>
      );
    case "custom":
      return (
        <ShapeSvg
          viewBox={viewBox ?? "0 0 210 150"}
          fill={fill}
          className={className}
          bites={bites}
        >
          <path fillRule={fillRule ?? "nonzero"} d={path ?? "M20 75h170v20H20Z"} />
        </ShapeSvg>
      );
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
