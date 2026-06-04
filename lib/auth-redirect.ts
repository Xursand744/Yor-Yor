import type { UserRoleValue } from "@/types/next-auth";

const STAFF_ROLES: UserRoleValue[] = ["admin", "manager"];

/**
 * Rol bo'yicha standart yo'nalish:
 * - client (mijoz) → /mijoz
 * - manager (tadbirkor) va admin → /admin
 */
export function getDefaultPathForRole(
  role: string | undefined | null
): string {
  if (role === "client") return "/mijoz";
  if (role === "admin" || role === "manager") return "/admin";
  return "/";
}

/**
 * Kirish / ro'yxatdan keyin URL: avval rol, keyin xavfsiz callbackUrl.
 */
export function resolvePostAuthRedirect(
  role: string | undefined | null,
  callbackUrl?: string | null
): string {
  const defaultPath = getDefaultPathForRole(role);
  if (!callbackUrl?.trim()) return defaultPath;

  const raw = callbackUrl.trim();
  let path = raw;
  try {
    path = raw.startsWith("/") ? raw : new URL(raw).pathname;
  } catch {
    return defaultPath;
  }

  if (role === "client") {
    if (path === "/" || path.startsWith("/mijoz")) return path;
    return defaultPath;
  }

  if (STAFF_ROLES.includes(role as UserRoleValue)) {
    if (path.startsWith("/admin")) return path;
    return defaultPath;
  }

  return defaultPath;
}
