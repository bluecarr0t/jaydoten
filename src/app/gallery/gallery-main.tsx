import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GalleryViewportGrid } from "@/components/gallery/gallery-grid";
import { isGalleryRouteEnabled } from "@/lib/is-dev-only";
import { resolveAllGalleryWorks } from "@/lib/resolve-gallery-works";

type GalleryMainProps = {
  photoSlug?: string;
};

export async function GalleryMain({ photoSlug }: GalleryMainProps) {
  if (!isGalleryRouteEnabled()) {
    notFound();
  }

  const worksByCamera = await resolveAllGalleryWorks();

  return (
    <main>
      <Suspense
        fallback={
          <p className="px-8 py-6 font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase">
            Loading…
          </p>
        }
      >
        <GalleryViewportGrid
          worksByCamera={worksByCamera}
          initialPhotoSlug={photoSlug}
        />
      </Suspense>
    </main>
  );
}
