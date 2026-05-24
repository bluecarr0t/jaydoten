"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./hero.css";
import { useFloatingOrbs, type OrbConfig } from "./use-floating-orbs";

const TWEAK_DEFAULTS = {
  palette: "sundown" as const,
  motion: "dreamy" as const,
  wordmarkStyle: "rainbow" as const,
  showOrbs: true,
  showGrain: true,
  tagline:
    "A Los Angeles experimental studio for <em>kinetic sculpture</em>, hardware, painting, photography, and quiet wonders.",
};

const PALETTES = {
  sundown: {
    bg: "#F2EAD8",
    ink: "#2A1B2E",
    mist: "#FBF5E9",
    a1: "#E89B6B",
    a2: "#A6C9DE",
    a3: "#C9B8E2",
    a4: "#D87B5A",
    a5: "#E8C9A0",
  },
  glacier: {
    bg: "#E5EDF1",
    ink: "#162028",
    mist: "#F4F8FB",
    a1: "#7FB0C1",
    a2: "#A8CFD0",
    a3: "#D6E3DC",
    a4: "#3F6A78",
    a5: "#B9CFD8",
  },
  lilac: {
    bg: "#EFE9F2",
    ink: "#1F1830",
    mist: "#F8F4FB",
    a1: "#B89CE8",
    a2: "#E5C0E0",
    a3: "#A6B8E2",
    a4: "#7A6AC9",
    a5: "#D9C5E8",
  },
  verdant: {
    bg: "#E7EFDF",
    ink: "#1B2A1E",
    mist: "#F4F8EE",
    a1: "#A3C893",
    a2: "#D9C97E",
    a3: "#7FB1A6",
    a4: "#5C8459",
    a5: "#BCD8B7",
  },
  cosmic: {
    bg: "#1B1730",
    ink: "#F2EAD8",
    mist: "#2A2244",
    a1: "#E89B6B",
    a2: "#7C8BE0",
    a3: "#C9B8E2",
    a4: "#E25F87",
    a5: "#F3D17A",
  },
} as const;

const MOTION = { still: 0.25, dreamy: 1, energetic: 1.8 } as const;

type Palette = (typeof PALETTES)[keyof typeof PALETTES];
type Mouse = { x: number; y: number };

const BLOB_CFG = [
  { c: "a1" as const, w: "62vw", h: "62vw", l: "-8%", t: "-12%", anim: "drift1" },
  { c: "a3" as const, w: "50vw", h: "50vw", l: "60%", t: "8%", anim: "drift2" },
  { c: "a2" as const, w: "70vw", h: "70vw", l: "40%", t: "40%", anim: "drift3" },
  { c: "a5" as const, w: "40vw", h: "40vw", l: "-6%", t: "55%", anim: "drift4" },
];

const ORBS: OrbConfig[] = [
  {
    id: "01",
    label: "Learning to learn",
    x: 11,
    y: 20,
    size: 70,
    color: "a1" as const,
    bob: 8,
    bobd: -1.4,
  },
  {
    id: "02",
    label: "Nurturing curiosity",
    x: 82,
    y: 16,
    size: 96,
    color: "a2" as const,
    bob: 10,
    bobd: -3.1,
  },
  {
    id: "03",
    label: "Following the material",
    x: 6,
    y: 64,
    size: 112,
    color: "a3" as const,
    bob: 12,
    bobd: -0.6,
  },
  {
    id: "04",
    label: "Making room for wonder",
    x: 86,
    y: 66,
    size: 64,
    color: "a4" as const,
    bob: 7,
    bobd: -2.2,
  },
  {
    id: "05",
    label: "Thinking in systems",
    x: 38,
    y: 84,
    size: 48,
    color: "a5" as const,
    bob: 9,
    bobd: -4.5,
  },
  {
    id: "06",
    label: "Staying open to change",
    x: 68,
    y: 6,
    size: 52,
    color: "a1" as const,
    bob: 6,
    bobd: -1.8,
  },
];

const WM_ROTS = [-1.2, 0.4, -0.6, 1.1, 0, -0.8, 0.6, -0.4];
const RAINBOW_COLORS = ["ink", "a4", "ink", "ink", "a1", "ink", "a3", "ink"] as const;

function useMouse() {
  const [mouse, setMouse] = useState<Mouse>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return mouse;
}

function BgBlobs({ palette, mouse }: { palette: Palette; mouse: Mouse }) {
  return (
    <div
      className="bg-blobs"
      style={{
        transform: `translate(${(mouse.x - 0.5) * -22}px, ${(mouse.y - 0.5) * -22}px)`,
        transition: "transform 1.4s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      {BLOB_CFG.map((b, i) => (
        <div
          key={b.anim}
          className="blob"
          style={{
            background: palette[b.c],
            width: b.w,
            height: b.h,
            left: b.l,
            top: b.t,
            animation: `${b.anim} calc(${28 + i * 4}s / var(--motion)) ease-in-out infinite`,
            animationDelay: `${i * -3.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function Wordmark({
  palette,
  style,
  mouse,
}: {
  palette: Palette;
  style: string;
  mouse: Mouse;
}) {
  const renderLetter = (ch: string, i: number) => {
    if (ch === "o" && style === "sunlit") {
      return (
        <span className="wm-sun" key={i} aria-label="o">
          <span className="wm-sun-glow" />
          <span className="wm-sun-core" />
        </span>
      );
    }

    const rainbowKey = RAINBOW_COLORS[i];
    const color =
      style === "rainbow" && ch !== " "
        ? palette[rainbowKey as keyof Palette]
        : palette.ink;

    return (
      <span
        key={i}
        className="wm-letter"
        style={
          {
            "--r": `${WM_ROTS[i]}deg`,
            animationDelay: `${i * -0.55}s`,
            color,
          } as CSSProperties
        }
      >
        {ch}
      </span>
    );
  };

  return (
    <div
      className="wordmark"
      style={{
        transform: `translate(${(mouse.x - 0.5) * 12}px, ${(mouse.y - 0.5) * 8}px)`,
        transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      {"Jaydoten".split("").map(renderLetter)}
    </div>
  );
}

function Orbs({ palette, motion }: { palette: Palette; motion: number }) {
  const { positions, ready } = useFloatingOrbs(ORBS, motion);

  const orbMap = useMemo(
    () => new Map(ORBS.map((orb) => [orb.id, orb])),
    [],
  );

  if (!ready) return <div className="orb-layer" aria-hidden />;

  return (
    <div className="orb-layer">
      {positions.map((pos) => {
        const o = orbMap.get(pos.id);
        if (!o) return null;

        const c = palette[o.color];
        const isTopOrb = pos.isTop;

        return (
          <div
            key={o.id}
            className={`orb${isTopOrb ? " orb-top" : ""}`}
            style={{
              left: 0,
              top: 0,
              width: o.size,
              height: o.size,
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            }}
          >
            <div
              className="orb-shape"
              style={
                {
                  "--bob": `${o.bob}s`,
                  "--bobd": `${o.bobd}s`,
                } as CSSProperties
              }
            >
              <div
                className="orb-inner"
                style={{
                  background: `radial-gradient(circle at 32% 28%,
                    color-mix(in oklab, ${c} 30%, white) 0%,
                    ${c} 55%,
                    color-mix(in oklab, ${c} 60%, ${palette.ink}) 100%)`,
                }}
              />
            </div>
            <div className={`orb-tag${isTopOrb ? " orb-tag-top" : ""}`}>
              {o.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isHot = Boolean(
        el?.closest(
          "a, button, .orb, .wm-letter, .wm-sun",
        ),
      );
      setHot(isHot);
    };

    window.addEventListener("mousemove", move);
    let raf = 0;
    const tick = () => {
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className={`cursor${hot ? " hot" : ""}`} />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}

function Tagline({ text }: { text: string }) {
  const parts = text.split(/(<em>.*?<\/em>)/);

  return (
    <p className="tagline">
      {parts.map((chunk, i) =>
        chunk.startsWith("<em>") ? (
          <em key={i}>{chunk.slice(4, -5)}</em>
        ) : (
          <Fragment key={i}>{chunk}</Fragment>
        ),
      )}
    </p>
  );
}

export function JaydotenHero() {
  const t = TWEAK_DEFAULTS;
  const palette = PALETTES[t.palette];
  const motion = MOTION[t.motion];
  const mouse = useMouse();

  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", palette.bg);
    root.style.setProperty("--ink", palette.ink);
    root.style.setProperty("--mist", palette.mist);
    root.style.setProperty("--a1", palette.a1);
    root.style.setProperty("--a2", palette.a2);
    root.style.setProperty("--a3", palette.a3);
    root.style.setProperty("--a4", palette.a4);
    root.style.setProperty("--a5", palette.a5);
    root.style.setProperty("--motion", String(motion));
  }, [palette, motion]);

  useEffect(() => {
    applyTheme();
    document.body.style.cursor = "none";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";

    return () => {
      document.body.style.cursor = "";
      document.body.style.overflow = "";
    };
  }, [applyTheme]);

  return (
    <div
      className="jaydoten-hero"
      style={
        {
          "--bg": palette.bg,
          "--ink": palette.ink,
          "--mist": palette.mist,
          "--a1": palette.a1,
          "--a2": palette.a2,
          "--a3": palette.a3,
          "--a4": palette.a4,
          "--a5": palette.a5,
          "--motion": motion,
        } as CSSProperties
      }
    >
      <BgBlobs palette={palette} mouse={mouse} />
      {t.showGrain && <div className="grain" />}

      <header className="topbar">
        <div className="brand-mark">
          <svg className="star" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M10 1 L11.6 8.4 L19 10 L11.6 11.6 L10 19 L8.4 11.6 L1 10 L8.4 8.4 Z"
              fill={palette.a4}
            />
          </svg>
          Jaydoten Studio
          <span className="sep">·</span>
          <span style={{ opacity: 0.55 }}>est. 2026 · Los Angeles</span>
        </div>
        <span className="status">
          <span className="dot" />
          new things coming soon
        </span>
      </header>

      <main className="stage">
        <h1 aria-label="Jaydoten">
          <Wordmark palette={palette} style={t.wordmarkStyle} mouse={mouse} />
        </h1>

        <Tagline text={t.tagline} />

        <div className="meta-row">
          <span>made slowly, on purpose</span>
        </div>
      </main>

      {t.showOrbs && <Orbs palette={palette} motion={motion} />}
      <Cursor />
    </div>
  );
}
