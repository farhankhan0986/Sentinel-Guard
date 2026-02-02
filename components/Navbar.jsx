"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [admin, setAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          credentials: "include",
        });

        setAdmin(res.ok);
      } catch {
        setAdmin(false);
      }
    };

    checkAdmin();
  }, [pathname]);

  // Hide navbar on admin auth pages
  if (pathname === "/admin/login" || pathname === "/admin/signup") {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });

    setAdmin(false);
    router.push("/admin/login");
  };

  const linkClass = (href) =>
    `text-sm transition ${
      pathname === href
        ? "text-accent"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground"
        >
          <ShieldCheck className="h-5 w-5 text-accent" />
          <span>Sentinel Guard</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {admin ? (
            <>
              <Link
                href="/admin/dashboard"
                className={linkClass("/admin/dashboard")}
              >
                Dashboard
              </Link>

              <Link
                href="/admin/rules"
                className={linkClass("/admin/rules")}
              >
                Rules
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-border px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
