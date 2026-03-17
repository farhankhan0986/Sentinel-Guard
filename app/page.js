"use client";

import Link from "next/link";
import { ShieldCheck, Activity, Ban, KeyRound, Globe, Radar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Protect your website traffic",
    desc: "Sentinel Guard checks incoming requests before they reach your application.",
  },
  {
    icon: <Ban className="h-5 w-5" />,
    title: "Block suspicious requests",
    desc: "Track abusive traffic and see which requests were blocked by your rules.",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "View activity clearly",
    desc: "Use a simple dashboard to monitor request trends, logs, and threat signals.",
  },
];

export default function Home() {
  return (
    <main className="text-slate-900">
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-7">
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              Simple, professional website security
            </span>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Watch your website traffic and stop suspicious requests early.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Sign up, add your website, get your API key, and monitor blocked
                traffic, request history, and suspicious activity from one clean
                dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/admin/signup"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Create Account
              </Link>
              <Link
                href="/admin/login"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Dashboard Preview</p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                    Website Security Overview
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewStat icon={<Globe className="h-5 w-5" />} label="Website" value="myapp.com" />
                <PreviewStat icon={<KeyRound className="h-5 w-5" />} label="API Key" value="Connected" />
                <PreviewStat icon={<Activity className="h-5 w-5" />} label="Requests" value="12,430" />
                <PreviewStat icon={<Radar className="h-5 w-5" />} label="Threats" value="14" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Everything is kept simple and easy to explain.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Sentinel Guard focuses on the basics that matter: identify your
              website, inspect traffic, block suspicious requests, and show the
              results in a clear dashboard.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="rounded-[24px] border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-7 text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
