"use client";

import { useEffect } from "react";

/** Undo hero `overflow: hidden` on body when viewing the gallery. */
export function GalleryBodyScroll() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  return null;
}
