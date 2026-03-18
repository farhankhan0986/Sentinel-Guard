"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublicAuthPage =
    pathname === "/admin/login" || pathname === "/admin/signup";
  const [checked, setChecked] = useState(isPublicAuthPage);

  useEffect(() => {
    if (isPublicAuthPage) {
      setChecked(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setChecked(true);
      }
    };

    setChecked(false);
    checkAuth();
  }, [isPublicAuthPage, router]);
  if (isPublicAuthPage) {
    return <div className="min-h-screen bg-[#020617]">{children}</div>;
  }

  if (!checked) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2f7] text-slate-700 relative overflow-hidden">

      {/* subtle light glow */}
      <div className="absolute top-[-120px] left-1/3 w-[400px] h-[400px] bg-sky-200/40 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-1/3 w-[400px] h-[400px] bg-indigo-200/40 blur-3xl rounded-full" />

      <div className="relative flex flex-col items-center gap-6">

        {/* loader */}
        <div className="h-12 w-12 rounded-full border-2 border-slate-300 border-t-sky-500 animate-spin" />

        {/* text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-600">
            Verifying your session
          </p>
          <p className="text-xs text-slate-500">
            Checking authentication and access permissions...
          </p>
        </div>

      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-sky-100/30 text-foreground">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
