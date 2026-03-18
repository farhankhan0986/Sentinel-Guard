"use client";

import Link from "next/link";
import { ShieldCheck, Globe, LayoutDashboard, PanelsTopLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

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
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-sky-600/15 backdrop-blur-xl">
      {/* subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}

        <Link href="/" className="flex items-center gap-3 group">
          {/* LOGO */}
          <div className="relative group flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
            <Image
              src="/favicon.svg"
              alt="Sentinel Guard"
              width={32}
              height={32}
              className="relative z-10 group-hover:-translate-z-1 group-hover:scale-110 duration-300 transition-transform"
            />

            {/* subtle glow */}
            {/* <div className="absolute inset-0 rounded-xl bg-sky-400/20 blur-md opacity-0 group-hover:opacity-100 transition" /> */}
          </div>

          {/* TEXT */}
          <span className="hidden sm:inline-block text-lg font-semibold tracking-tight text-muted-900 group-hover:text-sky-700 transition">
            Sentinel Guard
          </span>
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {admin ? (
            <>
              {/* WEBSITE STATUS */}
              <div className="hidden md:flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs">
                <span className="flex items-center gap-2 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>

                <span className="text-slate-400">|</span>

                <span className="flex items-center gap-2 text-slate-600">
                  <Globe className="h-4 w-4" />
                  {admin.tenant?.website || admin.tenant?.name || "Your site"}
                </span>
              </div>

              {/* DASHBOARD */}
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-full  bg-sky-600  px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition shadow-sm"
              >
                <PanelsTopLeft className="h-4 w-4" />
                Dashboard
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/admin/login"
                className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Login
              </Link>

              <Link
                href="/admin/signup"
                className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
