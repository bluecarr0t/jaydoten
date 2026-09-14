import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isDevOnlyRoute } from "@/lib/is-dev-only";
import { notFound } from "next/navigation";

export default async function AdminGalleryLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!isDevOnlyRoute()) {
    notFound();
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return children;
}
