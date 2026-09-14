"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type GalleryPhotoTransitionHandle = {
  run: (applyChange: () => void) => void;
};

const EXIT_MS = 220;
const ENTER_MS = 420;

type GalleryPhotoTransitionProps = {
  children: ReactNode;
  className?: string;
};

export const GalleryPhotoTransition = forwardRef<
  GalleryPhotoTransitionHandle,
  GalleryPhotoTransitionProps
>(function GalleryPhotoTransition({ children, className }, ref) {
  const [fadedOut, setFadedOut] = useState(false);
  const busyRef = useRef(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  }, []);

  const run = useCallback(
    (applyChange: () => void) => {
      if (busyRef.current) return;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        applyChange();
        return;
      }

      busyRef.current = true;
      clearTimers();
      setFadedOut(true);

      exitTimerRef.current = setTimeout(() => {
        applyChange();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFadedOut(false);
            enterTimerRef.current = setTimeout(() => {
              busyRef.current = false;
            }, ENTER_MS);
          });
        });
      }, EXIT_MS);
    },
    [clearTimers],
  );

  useImperativeHandle(ref, () => ({ run }), [run]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      className={`relative transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none ${
        fadedOut ? "scale-[0.988] opacity-0" : "scale-100 opacity-100"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
});
