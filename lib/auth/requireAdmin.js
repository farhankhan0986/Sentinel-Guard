import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function requireAdmin() {
  try {
    const cookieStore = await cookies(); // ✅ await is REQUIRED
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded;
  } catch {
    return null;
  }
}
