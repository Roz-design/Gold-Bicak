/** Gizli admin panel yolu — .env ile değiştirilebilir */
export const ADMIN_SECRET_PATH =
  process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH ||
  process.env.ADMIN_SECRET_PATH ||
  "gb-panel-x7k9m2";

export function adminPath(subpath = ""): string {
  const base = `/${ADMIN_SECRET_PATH}`;
  if (!subpath || subpath === "/") return base;
  return `${base}${subpath.startsWith("/") ? subpath : `/${subpath}`}`;
}

export function adminApiPath(subpath = ""): string {
  const base = `/api/${ADMIN_SECRET_PATH}`;
  if (!subpath || subpath === "/") return base;
  return `${base}${subpath.startsWith("/") ? subpath : `/${subpath}`}`;
}

export function isDirectAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isDirectAdminApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}
