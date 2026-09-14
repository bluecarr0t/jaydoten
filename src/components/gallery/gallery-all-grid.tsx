"use client";

import Image from "next/image";
import { GalleryPlaceholder } from "@/components/gallery/gallery-placeholder";
import type { GalleryCameraId } from "@/lib/gallery-cameras";
import { shouldUnoptimizeGalleryImage } from "@/lib/gallery-image-utils";
import type { ResolvedGalleryWork } from "@/lib/gallery-types";
import { galleryFrameClass } from "@/lib/gallery-theme";

function gridCellAspectClass(
  work: ResolvedGalleryWork,
  cameraId: GalleryCameraId,
): string {
  if (cameraId === "leica-xe") return "aspect-[3/2]";
  if (work.aspect === "portrait") return "aspect-[3/4]";
  if (work.aspect === "square") return "aspect-square";
  return "aspect-[4/3]";
}

type GalleryAllGridProps = {
  works: ResolvedGalleryWork[];
  cameraId: GalleryCameraId;
  onSelect: (index: number) => void;
};

export function GalleryAllGrid({
  works,
  cameraId,
  onSelect,
}: GalleryAllGridProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      role="list"
      aria-label="All photographs"
    >
      {works.map((work, index) => (
        <button
          key={work.id}
          type="button"
          role="listitem"
          onClick={() => onSelect(index)}
          className={`group relative w-full overflow-hidden bg-[#1a1a1a] text-left transition hover:opacity-95 ${galleryFrameClass}`}
        >
          <div
            className={`relative w-full ${gridCellAspectClass(work, cameraId)}`}
          >
            {work.hasImage ? (
              <Image
                src={work.src}
                alt={work.title}
                fill
                unoptimized={shouldUnoptimizeGalleryImage(
                  work.src,
                  work.isMock,
                )}
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <GalleryPlaceholder work={work} />
            )}
          </div>
          <span className="sr-only">View {work.title} full screen</span>
        </button>
      ))}
    </div>
  );
}
