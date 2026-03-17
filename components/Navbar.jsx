"use client";

import Link from "next/link";
import { ShieldCheck, Globe, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [admin, setAdmin] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setAdmin(null);
          return;
        }

        const data = await res.json();
        setAdmin(data.admin);
      } catch {
        setAdmin(null);
      }
    };

    checkAdmin();
  }, [pathname]);

  if (pathname === "/admin/login" || pathname === "/admin/signup") {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });

    setAdmin(null);
    router.push("/admin/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Sentinel Guard</p>
            <p className="text-xs text-slate-500">Website traffic protection</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/#features"
            className="hidden rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 sm:inline-flex"
          >
            Features
          </Link>

          {admin ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 md:flex">
                <Globe className="h-4 w-4 text-slate-500" />
                <span>{admin.tenant?.website || admin.tenant?.name || "Your website"}</span>
              </div>

              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/admin/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href="/admin/signup"
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
