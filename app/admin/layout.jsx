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

  // if (!checked) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
  //       Checking your session...
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
