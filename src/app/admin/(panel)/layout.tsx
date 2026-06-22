import { getCurrentUser, clearAuthCookie } from "@/lib/auth";
import { adminPath } from "@/lib/admin-path";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    await clearAuthCookie();
    redirect(adminPath("/giris"));
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
