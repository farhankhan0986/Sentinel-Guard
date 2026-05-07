import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = verifyToken(token);
    return {
      adminId: decoded.adminId,
      role: "ADMIN",
      tenantId: decoded.tenantId,
    };
  } catch {
    return null;
  }
}
