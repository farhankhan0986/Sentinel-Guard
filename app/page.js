/* ===== HOME PAGE ===== */

"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  Ban,
  KeyRound,
  Globe,
  Radar,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

const threats = [
  "SQL Injection Attempts",
  "Bot Traffic Flood",
  "Brute Force Logins",
  "Suspicious IP Activity",
];

export default function Home() {
  return (
    <main className="text-slate-900">
      {/* HERO */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 blur-3xl bg-gradient-to-r from-sky-400 to-indigo-500" />

        <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <span className="pill bg-sky-100 text-sky-700">
              Security Middleware • Real-time Protection
            </span>

            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight">
              Detect, analyze and block malicious traffic before it hits your
              backend.
            </h1>

            <p className="text-lg text-slate-600 max-w-xl">
              Sentinel Guard acts as a protective layer for your APIs —
              filtering harmful requests, tracking behavior patterns, and giving
              you full visibility.
            </p>

            <div className="flex gap-4">
              <Link
                href="/admin/signup"
                className="px-6 py-3 rounded-full bg-sky-600 text-white hover:bg-sky-500 duration-500 transition-all hover:scale-102"
              >
                Get Started
              </Link>
              <Link
                href="/admin/login"
                className="px-6 py-3 rounded-full bg-white/30 hover:bg-white/50 duration-500 transition-all hover:scale-102"
              >
                Login
              </Link>
            </div>

            {/* Threat ticker */}
            <div className="flex flex-wrap gap-3 pt-4">
              {threats.map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="pill bg-red-50 text-red-600"
                >
                  <AlertTriangle className="h-4 w-4" /> {t}
                </motion.div>
              ))}
            </div>
          </div>

          {/* DASHBOARD MOCK */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] p-6 glass-panel security-glow"
          >
            <div className="space-y-5 rounded-[24px] bg-white/80 p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">Live Monitoring</p>
                  <h3 className="text-2xl font-semibold">Traffic Overview</h3>
                </div>
                <span className="pill bg-green-100 text-green-700">
                  Protected
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Stat icon={<Globe />} label="Domain" value="api.myapp.com" />
                <Stat icon={<KeyRound />} label="Auth" value="Verified" />
                <Stat icon={<Activity />} label="Requests" value="18,920" />
                <Stat icon={<Radar />} label="Threats Blocked" value="32" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative px-6 pb-28 mt-10">
        {/* subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="max-w-3xl mb-14 space-y-4">
            <div className="pill bg-sky-100 text-sky-700 w-fit">
              Security Capabilities
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Built for real-world attack scenarios
            </h2>

            <p className="text-slate-600 leading-7">
              Sentinel Guard is designed to inspect, detect, and respond to
              malicious traffic patterns — not just display logs, but actively
              protect your backend systems.
            </p>
          </div>

          {/* CARDS */}
          <div className="grid md:grid-cols-3 gap-6">
            
            <Feature
              icon={<ShieldCheck />}
              title="Request Inspection"
              desc="Deep inspection of headers, payloads, and behavioral patterns across incoming requests."
            />

            <Feature
              icon={<Ban />}
              title="Threat Blocking"
              desc="Automatically block malicious traffic using rule-based filtering and detection logic."
            />

            <Feature
              icon={<Activity />}
              title="Live Monitoring"
              desc="Observe traffic spikes, anomalies, and request flow in real-time dashboards."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="group relative rounded-[22px]  border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition">
      {/* hover glow */}
      <div className="absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 group-active:bg-sky-100/50 group-active:opacity-100 group-hover:bg-sky-100/50 transition bg-gradient-to-r from-sky-100/40 to-indigo-100/40" />

      <div className="relative space-y-4 flex flex-col justify-center items-center h-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 bg-sky-100 text-sky-700 group-active:scale-110 group-hover:scale-110 duration-500 transition-all">
          {icon}
        </div>

        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>

        <p className="text-sm leading-7 text-slate-600 text-center">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white">
      <div className="flex gap-3 items-center">
        <div className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
