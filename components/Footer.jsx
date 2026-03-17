"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup")
  ) {
    return null;
  }

  return (
    <footer className="relative border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 overflow-hidden">

      {/* subtle animated glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-20 left-1/3 w-72 h-72 bg-sky-300/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-indigo-300/30 blur-3xl rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr,1fr]">

          {/* LEFT */}
          <div className="space-y-6">

            <div className="pill bg-sky-100 text-sky-700 w-fit">
              Security Middleware
            </div>

            <h2 className="text-3xl font-semibold leading-tight text-slate-900">
              Real-time protection for modern web traffic
            </h2>

            <p className="text-sm text-slate-600 max-w-xl leading-7">
              Every request is inspected before reaching your backend. Detect anomalies,
              block malicious activity, and maintain full visibility over traffic.
            </p>

            {/* indicators */}
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="pill pill-safe">Monitoring Active</span>
              <span className="pill pill-safe">API Secured</span>
              <span className="pill pill-threat">Threats Blocked</span>
            </div>

          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-2 gap-8 text-sm">

            <FooterGroup
              title="Core"
              items={[
                "Request inspection",
                "Traffic logging",
                "Threat detection",
                "API protection",
              ]}
            />

            <FooterGroup
              title="Threats"
              items={[
                "SQL injection",
                "Brute force",
                "Bot traffic",
                "IP anomalies",
              ]}
            />

          </div>
        </div>

        {/* bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p className="font-medium text-slate-700">
            © {new Date().getFullYear()} Sentinel Guard
          </p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              System Active
            </span>

            <span>Security layer for web applications</span>
          </div>

        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, items }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-800">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm text-muted/80 hover:text-black transition"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}