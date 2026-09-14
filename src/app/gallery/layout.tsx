import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GalleryBodyScroll } from "@/components/gallery/gallery-body-scroll";
import { galleryWallClass } from "@/lib/gallery-theme";

export const metadata: Metadata = {
  title: "Gallery (dev)",
  robots: { index: false, follow: false },
};

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`h-dvh overflow-hidden antialiased ${galleryWallClass}`}>
      <GalleryBodyScroll />
      {children}
    </div>
  );
}
