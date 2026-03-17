"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/signup")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr,1fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Simple website security monitoring.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Create your account, add your website, connect your API key, and
              track blocked requests, suspicious activity, and traffic history
              from one clean dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <FooterGroup
              title="What You Get"
              items={[
                "Request logs",
                "Threat tracking",
                "Blocked IP insights",
                "API key protection",
              ]}
            />
            <FooterGroup
              title="Use Case"
              items={[
                "Protect one website",
                "See traffic patterns",
                "Track suspicious requests",
                "Manage your key",
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sentinel Guard</p>
          <p>Professional security monitoring for modern web applications.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, items }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
