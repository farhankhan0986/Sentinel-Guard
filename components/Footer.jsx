"use client";   

import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    // Don't show footer on admin pages
    if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/signup")) {
        return null;
    }
  return (
    <footer className="border-t border-border bg-card text-foreground/70">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {/* Top Section */}
        <div className="grid gap-12 md:grid-cols-2">
          {/* Brand + Description */}
          <div className="space-y-5 max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Sentinel Guard
            </h2>
            <p className="text-lg leading-relaxed text-muted">
              Sentinel Guard is a modern, middleware-first API security platform
              built to protect applications from abuse, automated attacks, and
              unauthorized access — before threats ever reach your backend.
            </p>
            <p className="text-sm text-muted">
              Designed for developers who care about security, performance, and
              real-world reliability.
            </p>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterGroup title="Product">
              <FooterLink>API Firewall</FooterLink>
              <FooterLink>Rate Limiting</FooterLink>
              <FooterLink>Attack Detection</FooterLink>
              <FooterLink>Security Analytics</FooterLink>
            </FooterGroup>

            <FooterGroup title="Security">
              <FooterLink>Threat Scoring</FooterLink>
              <FooterLink>IP Blocking</FooterLink>
              <FooterLink>Audit Logs</FooterLink>
              <FooterLink>Zero Trust Access</FooterLink>
            </FooterGroup>

            <FooterGroup title="Admin">
              <FooterLink href="/admin/login">Admin Login</FooterLink>
              <FooterLink>Dashboard</FooterLink>
              <FooterLink>Rules Engine</FooterLink>
            </FooterGroup>
          </div>
        </div>

        {/* Divider */}
        <div className="my-16 h-px bg-border" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Sentinel Guard. All rights reserved.
          </p>

          <p className="text-sm text-muted">
            Built for security-focused engineering teams
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Small Helper Components ---------- */

function FooterGroup({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href = "#", children }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
