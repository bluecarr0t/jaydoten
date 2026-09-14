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

  if (Math.random() < 0.22) {
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
            d="M22 78C18 48 38 16 72 12C104 8 132 22 162 18C196 12 228 38 230 70C232 104 204 132 168 142C132 152 98 138 64 140C28 142 8 112 22 78Z M92 58C108 46 132 52 138 70C144 90 118 104 98 96C82 90 80 68 92 58Z"
          />
        </ShapeSvg>
      );
    case "scoop":
      return (
        <ShapeSvg viewBox="0 0 240 130" fill={fill} className={className} bites={bites}>
          <path d="M8 22C6 8 22 4 52 6C92 8 148 4 176 12C204 20 228 34 226 52C224 68 198 70 168 66C138 62 122 78 92 88C60 98 24 90 14 72C6 58 10 34 8 22Z" />
        </ShapeSvg>
      );
    case "chevron":
      return (
        <ShapeSvg viewBox="0 0 220 100" fill={fill} className={className} bites={bites}>
          <path d="M8 46C14 28 42 8 68 10C96 12 128 28 162 36C188 42 214 40 214 52C214 66 188 70 158 62C128 54 98 48 74 58C50 68 22 86 12 78C4 72 4 56 8 46Z" />
        </ShapeSvg>
      );
    case "bar":
      return (
        <ShapeSvg viewBox="0 0 220 48" fill={fill} className={className} bites={bites}>
          <path d="M4 22C6 12 24 10 48 8C92 4 148 10 176 6C196 4 216 10 216 20C216 32 198 38 176 36C148 34 96 42 52 40C24 38 2 32 4 22Z" />
        </ShapeSvg>
      );
    case "notch":
      return (
        <ShapeSvg viewBox="0 0 230 120" fill={fill} className={className} bites={bites}>
          <path d="M10 18C12 8 32 6 70 8C120 10 178 6 208 14C224 18 226 34 214 40C186 44 140 38 118 48C92 60 78 78 108 88C138 98 186 90 208 96C222 100 220 114 196 116C150 120 86 112 48 108C18 104 4 88 6 62C8 40 8 26 10 18Z" />
        </ShapeSvg>
      );
    case "wrap":
      return (
        <ShapeSvg viewBox="0 0 200 180" fill={fill} className={className} bites={bites}>
          <path d="M142 26C176 48 186 96 160 134C136 168 84 180 48 154C12 128 8 74 36 42C60 16 104 12 136 30C148 38 142 52 130 48C102 34 64 42 50 70C34 102 52 140 86 148C122 156 152 136 158 108C164 80 148 56 126 48C114 42 118 28 142 26Z" />
        </ShapeSvg>
      );
    case "triangle":
      return (
        <ShapeSvg viewBox="0 0 100 72" fill={fill} className={className} bites={bites}>
          <path d="M10 16C16 4 30 8 38 22C52 18 78 24 90 34C98 40 94 52 82 54C58 58 28 68 16 62C4 56 4 28 10 16Z" />
        </ShapeSvg>
      );
    case "disc":
      return (
        <ShapeSvg viewBox="0 0 40 40" fill={fill} className={className} bites={bites}>
          <path d="M8 18C7 10 14 5 22 6C31 8 36 14 34 22C32 31 24 36 16 34C8 32 9 25 8 18Z" />
        </ShapeSvg>
      );
    case "diamond":
      return (
        <ShapeSvg viewBox="0 0 180 200" fill={fill} className={className} bites={bites}>
          <path d="M62 12C78 4 118 18 148 34C168 46 178 72 168 96C160 112 142 118 158 148C172 174 138 188 102 186C64 184 18 164 14 132C10 102 32 92 28 62C24 34 46 20 62 12Z" />
        </ShapeSvg>
      );
    case "petal":
      return (
        <ShapeSvg viewBox="0 0 200 120" fill={fill} className={className} bites={bites}>
          <path d="M14 64C18 28 56 8 112 18C150 26 186 42 188 62C190 84 148 102 108 108C62 116 16 96 14 64Z" />
        </ShapeSvg>
      );
    case "fan":
      return (
        <ShapeSvg viewBox="0 0 160 160" fill={fill} className={className} bites={bites}>
          <path d="M18 142C12 118 16 62 22 34C28 8 52 12 86 28C124 48 150 86 148 122C146 148 112 154 84 148C52 140 24 150 18 142Z" />
        </ShapeSvg>
      );
    case "boomerang":
      return (
        <ShapeSvg viewBox="0 0 200 160" fill={fill} className={className} bites={bites}>
          <path d="M12 82C18 52 48 12 84 14C108 16 126 32 118 52C112 68 92 78 108 96C126 116 150 128 138 146C126 162 92 150 62 132C28 110 6 108 12 82Z" />
        </ShapeSvg>
      );
    case "arch":
      return (
        <ShapeSvg viewBox="0 0 180 150" fill={fill} className={className} bites={bites}>
          <path
            fillRule="evenodd"
            d="M14 138C10 104 16 48 28 28C44 4 78 2 108 10C142 20 172 42 168 78C166 104 170 136 162 142C148 148 138 128 136 96C134 62 118 44 92 42C64 40 52 58 54 92C56 122 48 146 32 146C20 146 16 144 14 138Z"
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
