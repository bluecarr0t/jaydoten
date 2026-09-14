import { GalleryAdminPanel } from "@/components/admin/gallery-admin-panel";
import { notFound } from "next/navigation";
import { isDevOnlyRoute } from "@/lib/is-dev-only";

export default function AdminGalleryPage() {
  if (!isDevOnlyRoute()) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-[#f4f1eb] px-5 py-10 text-[#141414] md:px-10">
      <GalleryAdminPanel />
    </main>
  );
}
