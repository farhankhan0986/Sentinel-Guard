"use client";

import Link from "next/link";
import { ShieldCheck, Lock, Activity, Ban, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
/* ---------------- Home Page ---------------- */
export default function Home() {
  return (
    <div className="bg-background text-foreground">
      

      {/* ================= HERO ================= */}
      <section className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
              API Security,
              <br />
              Reimagined for Scale
            </h1>

            <p className="mt-8 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              <strong>Sentinel Guard</strong> is a modern, middleware-first API
              security platform designed to protect your infrastructure at the
              earliest possible point i.e — the request layer.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/admin/login"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                Open Admin Dashboard
              </Link>
              <a
                href="#features"
                className="rounded-lg border border-border px-6 py-3 text-sm hover:bg-accent/5"
              >
                Explore Platform Capabilities
              </a>
            </div>
          </div>

          {/* Snapshot Card */}
          <Card className="shadow-lg">
            <CardContent className="space-y-6">
              <h3 className="text-lg font-semibold">
                Real-time Traffic Snapshot
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <DemoStat icon={<Activity />} label="Total Requests" value="12,430" />
                <DemoStat icon={<Server />} label="Allowed" value="11,982" />
                <DemoStat icon={<Ban />} label="Blocked" value="448" />
              </div>

              <p className="text-sm text-muted-foreground">
                Representative metrics from Sentinel Guard analytics.
                Production environments display live, continuously updated data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-32 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">
            Built for Real-World API Threats
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mb-16">
            Modern APIs are exposed to constant automated attacks, abusive
            traffic, and unauthorized access attempts. Sentinel Guard provides
            a focused, performance-oriented security layer that operates where
            it matters most — at the request boundary.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature
              icon={<Lock />}
              title="Middleware-Level API Firewall"
              desc="Apply granular security rules directly within your request pipeline to block malicious IPs, routes, and methods before they reach your application logic."
            />
            <Feature
              icon={<Activity />}
              title="Intelligent Rate Limiting"
              desc="Detect and prevent API abuse using adaptive per-IP rate limits that protect your services without impacting legitimate users."
            />
            <Feature
              icon={<ShieldCheck />}
              title="Automated Threat Detection"
              desc="Continuously monitor traffic patterns to identify suspicious behavior and automatically neutralize threats in real time."
            />
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section id="security" className="py-32 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8">
            Why API-First Security Is Critical
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            APIs are now the primary interface between applications, services,
            and users — making them the most valuable and vulnerable attack
            surface in modern systems. Traditional perimeter-based security
            models were never designed to handle today’s API-driven architectures.
            <br /><br />
            Sentinel Guard introduces a lightweight but powerful protection layer
            that sits directly in front of your APIs, operating as a proactive
            defense mechanism similar to an API gateway or Web Application
            Firewall. By stopping malicious requests early, Sentinel Guard
            reduces operational risk, protects sensitive data, and ensures
            consistent service availability — even under sustained attack.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Small UI Helpers ---------------- */
function Feature({ icon, title, desc }) {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="space-y-4">
        <div className="text-2xl text-accent">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}

function DemoStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-xl text-accent">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
