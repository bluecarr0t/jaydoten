import { notFound, redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isDevOnlyRoute } from "@/lib/is-dev-only";

export default async function AdminLoginPage() {
  if (!isDevOnlyRoute()) {
    notFound();
  }

  if (await isAdminAuthenticated()) {
    redirect("/admin/gallery");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#e8e2d6] px-6 py-12">
      <AdminLoginForm />
    </main>
  );
}
