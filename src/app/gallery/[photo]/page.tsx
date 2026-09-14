import { GalleryMain } from "@/app/gallery/gallery-main";

type GalleryPhotoPageProps = {
  params: Promise<{ photo: string }>;
};

export default async function GalleryPhotoPage({ params }: GalleryPhotoPageProps) {
  const { photo } = await params;
  return <GalleryMain photoSlug={photo} />;
}
