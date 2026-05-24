"use client";

import { useEffect, useRef, useState } from "react";

export type OrbConfig = {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: "a1" | "a2" | "a3" | "a4" | "a5";
  bob: number;
  bobd: number;
};

export type OrbPosition = {
  id: string;
  x: number;
  y: number;
  size: number;
  isTop: boolean;
};

type OrbBody = {
  id: string;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const EDGE_PADDING = 20;
const RESTITUTION = 0.78;
const COLLISION_ITERATIONS = 4;

function orbMass(size: number) {
  return size * size;
}

function randomSpeed(motion: number) {
  const base = 0.22 * motion;
  const sign = Math.random() > 0.5 ? 1 : -1;
  return sign * (base + Math.random() * base * 0.6);
}

function initBodies(configs: OrbConfig[], motion: number): OrbBody[] {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return configs.map((orb) => {
    const radius = orb.size / 2;
    const minX = radius + EDGE_PADDING;
    const maxX = width - radius - EDGE_PADDING;
    const minY = radius + EDGE_PADDING;
    const maxY = height - radius - EDGE_PADDING;

    return {
      id: orb.id,
      size: orb.size,
      x: Math.min(maxX, Math.max(minX, (orb.x / 100) * width)),
      y: Math.min(maxY, Math.max(minY, (orb.y / 100) * height)),
      vx: randomSpeed(motion),
      vy: randomSpeed(motion),
    };
  });
}

function clampBodies(bodies: OrbBody[]) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (const body of bodies) {
    const radius = body.size / 2;
    const minX = radius + EDGE_PADDING;
    const maxX = width - radius - EDGE_PADDING;
    const minY = radius + EDGE_PADDING;
    const maxY = height - radius - EDGE_PADDING;

    body.x = Math.min(maxX, Math.max(minX, body.x));
    body.y = Math.min(maxY, Math.max(minY, body.y));
  }
}

function resolveOrbCollisions(bodies: OrbBody[]) {
  for (let pass = 0; pass < COLLISION_ITERATIONS; pass++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const r1 = a.size / 2;
        const r2 = b.size / 2;

        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        const minDist = r1 + r2;

        if (dist === 0) {
          const angle = Math.random() * Math.PI * 2;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          dist = 1;
        }

        if (dist >= minDist) continue;

        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        const massA = orbMass(a.size);
        const massB = orbMass(b.size);
        const totalMass = massA + massB;

        const separation =
          (overlap / COLLISION_ITERATIONS) * 0.92;
        a.x -= nx * separation * (massB / totalMass);
        a.y -= ny * separation * (massB / totalMass);
        b.x += nx * separation * (massA / totalMass);
        b.y += ny * separation * (massA / totalMass);

        const dvx = b.vx - a.vx;
        const dvy = b.vy - a.vy;
        const closingSpeed = dvx * nx + dvy * ny;

        if (closingSpeed < 0) {
          const invMassA = 1 / massA;
          const invMassB = 1 / massB;
          const impulse =
            (-(1 + RESTITUTION) * closingSpeed) / (invMassA + invMassB);

          a.vx -= impulse * nx * invMassA;
          a.vy -= impulse * ny * invMassA;
          b.vx += impulse * nx * invMassB;
          b.vy += impulse * ny * invMassB;
        }
      }
    }
  }
}

function resolveWallCollisions(bodies: OrbBody[]) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (const body of bodies) {
    const radius = body.size / 2;
    const minX = radius + EDGE_PADDING;
    const maxX = width - radius - EDGE_PADDING;
    const minY = radius + EDGE_PADDING;
    const maxY = height - radius - EDGE_PADDING;

    if (body.x <= minX) {
      body.x = minX;
      body.vx = Math.abs(body.vx) * 0.98;
    } else if (body.x >= maxX) {
      body.x = maxX;
      body.vx = -Math.abs(body.vx) * 0.98;
    }

    if (body.y <= minY) {
      body.y = minY;
      body.vy = Math.abs(body.vy) * 0.98;
    } else if (body.y >= maxY) {
      body.y = maxY;
      body.vy = -Math.abs(body.vy) * 0.98;
    }
  }
}

function clampOrbSpeeds(bodies: OrbBody[], motion: number) {
  const maxSpeed = 0.55 * motion;
  const minSpeed = 0.12 * motion;

  for (const body of bodies) {
    const speed = Math.hypot(body.vx, body.vy);

    if (speed > maxSpeed) {
      body.vx = (body.vx / speed) * maxSpeed;
      body.vy = (body.vy / speed) * maxSpeed;
    } else if (speed < minSpeed) {
      if (speed === 0) {
        body.vx = randomSpeed(motion);
        body.vy = randomSpeed(motion);
      } else {
        const scale = minSpeed / speed;
        body.vx *= scale;
        body.vy *= scale;
      }
    }
  }
}

function stepBodies(bodies: OrbBody[], motion: number) {
  for (const body of bodies) {
    body.x += body.vx;
    body.y += body.vy;
  }

  resolveOrbCollisions(bodies);
  resolveWallCollisions(bodies);
  resolveOrbCollisions(bodies);
  resolveWallCollisions(bodies);
  clampOrbSpeeds(bodies, motion);
}

export function useFloatingOrbs(configs: OrbConfig[], motion: number) {
  const bodiesRef = useRef<OrbBody[]>([]);
  const [positions, setPositions] = useState<OrbPosition[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setPositions(
        configs.map((orb) => ({
          id: orb.id,
          size: orb.size,
          x: (orb.x / 100) * width - orb.size / 2,
          y: (orb.y / 100) * height - orb.size / 2,
          isTop: (orb.y / 100) * height < height * 0.12,
        })),
      );
      setReady(true);
      return;
    }

    bodiesRef.current = initBodies(configs, motion);
    for (let i = 0; i < 6; i++) {
      resolveOrbCollisions(bodiesRef.current);
      resolveWallCollisions(bodiesRef.current);
    }
    const toPositions = (bodies: OrbBody[]): OrbPosition[] => {
      const height = window.innerHeight;
      return bodies.map((body) => ({
        id: body.id,
        x: body.x - body.size / 2,
        y: body.y - body.size / 2,
        size: body.size,
        isTop: body.y < height * 0.12,
      }));
    };

    setPositions(toPositions(bodiesRef.current));
    setReady(true);

    let frame = 0;

    const tick = () => {
      stepBodies(bodiesRef.current, motion);
      setPositions(toPositions(bodiesRef.current));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    const onResize = () => {
      clampBodies(bodiesRef.current);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [configs, motion]);

  return { positions, ready };
}
