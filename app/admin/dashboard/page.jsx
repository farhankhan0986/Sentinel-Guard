"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Ban,
  Globe,
  KeyRound,
  Radar,
  ShieldAlert,
  Play,
  Zap,
  RefreshCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const blockColors = ["#0f172a", "#dc2626", "#0f766e"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [spinLoad, setSpinLoad] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    blocked: 0,
    activeThreats: 0,
  });
  const [traffic, setTraffic] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [apiKeyMessage, setApiKeyMessage] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [trafficMessage, setTrafficMessage] = useState("");
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [attackLoading, setAttackLoading] = useState(false);
  const [sendingTraffic, setSendingTraffic] = useState(false);

  const fetchWithAuth = useCallback(async (url) => {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    // 👇 handle auth error separately
    if (res.status === 401) {
      return null;
    }

    if (!res.ok) {
      throw new Error("Request failed");
    }

    return res.json();
  }, []);

  const loadDashboard = useCallback(async () => {
    setSpinLoad(true);
    const start = Date.now();
    const [trafficRes, blocksRes, ipsRes, recentLogsRes, threatRes] =
      await Promise.all([
        fetchWithAuth("/api/analytics/traffic"),
        fetchWithAuth("/api/analytics/blocks"),
        fetchWithAuth("/api/analytics/top-ips"),
        fetchWithAuth("/api/admin/logs/recent"),
        fetchWithAuth("/api/analytics/threats"),
      ]);

    const trafficData = trafficRes.data || [];
    const blocksData = (blocksRes.data || []).map((entry) => ({
      ...entry,
      label: entry._id,
    }));
    const threatsData = threatRes.data?.[0] || {
      activeThreats: 0,
    };

    const total = blocksData.reduce((sum, entry) => sum + entry.count, 0);
    const blocked =
      blocksData.find((entry) => entry._id === "Blocked")?.count || 0;

    setTraffic(trafficData);
    setBlocks(blocksData);
    setTopIps(ipsRes.data || []);
    setRecentLogs(recentLogsRes.logs || []);
    setStats({
      total,
      blocked,
      allowed: total - blocked,
      activeThreats: threatsData.activeThreats || 0,
    });

    const elapsed = Date.now() - start;
    const delay = Math.max(0, 600 - elapsed);
    await new Promise((res) => setTimeout(res, delay));

    setSpinLoad(false);
  }, [fetchWithAuth]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meRes = await fetchWithAuth("/api/admin/me");

        if (!meRes) {
          router.replace("/admin/login");
          return;
        }
        setAdmin(meRes.admin);

        const tenantRes = await fetchWithAuth("/api/platform/tenants");
        setTenant(tenantRes.tenant);

        const storedKey = window.localStorage.getItem("sentinelApiKey") || "";
        setApiKeyInput(storedKey);

        await loadDashboard();
      } catch (error) {
        console.error(error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [fetchWithAuth, loadDashboard, router]);

  const rotateKey = async () => {
    setApiKeyMessage("");

    const res = await fetch("/api/platform/tenants/rotate-key", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      setApiKeyMessage(data.error || "Unable to create a new API key");
      return;
    }

    window.localStorage.setItem("sentinelApiKey", data.apiKey);
    setApiKeyInput(data.apiKey);
    setApiKeyMessage(`New API key: ${data.apiKey}`);
  };

  const sendProtectedRequest = async () => {
    if (!apiKeyInput.trim()) {
      setTrafficMessage("Add your API key first.");
      return null;
    }

    return fetch("/api/test", {
      headers: {
        "x-sentinel-api-key": apiKeyInput.trim(),
      },
    });
  };

  const runSingleTraffic = async () => {
    setTrafficLoading(true);
    setTrafficMessage("");
    setSendingTraffic(true);

    try {
      window.localStorage.setItem("sentinelApiKey", apiKeyInput.trim());
      const res = await sendProtectedRequest();
      if (!res) {
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setTrafficMessage(data.error || "Request failed.");
      } else {
        setTrafficMessage("Test request sent successfully.");
      }

      await loadDashboard();
    } catch {
      setTrafficMessage("Unable to send test request.");
    } finally {
      setTrafficLoading(false);
      setSendingTraffic(false);
    }
  };

  const runAttackTraffic = async () => {
    setTrafficLoading(true);
    setTrafficMessage("");
    setAttackLoading(true);

    try {
      window.localStorage.setItem("sentinelApiKey", apiKeyInput.trim());
      const responses = [];

      for (let i = 0; i < 12; i += 1) {
        const response = await sendProtectedRequest();
        if (response) {
          responses.push(response);
        }

        // Small delay keeps the demo readable and lets rate-limit responses appear clearly.
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const blockedCount = responses.filter(
        (res) => res?.status === 429,
      ).length;
      const forbiddenCount = responses.filter(
        (res) => res?.status === 403,
      ).length;

      setTrafficMessage(
        blockedCount > 0
          ? `Attack simulation finished. ${blockedCount} requests were rate-limited.`
          : forbiddenCount > 0
            ? `Attack simulation finished. ${forbiddenCount} requests were auto-blocked after suspicious activity.`
            : "Attack simulation finished. Refresh data loaded.",
      );

      await loadDashboard();
    } catch {
      setTrafficMessage("Unable to simulate attack traffic.");
    } finally {
      setTrafficLoading(false);
      setAttackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* HEADER */}
        <section className="w-full max-w-full overflow-x-hidden rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-3">
              <div className="h-8 w-full max-w-xs bg-slate-200 rounded-lg" />
              <div className="h-4 w-full max-w-md bg-slate-200 rounded" />
              <div className="h-4 w-full max-w-sm bg-slate-200 rounded" />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3 overflow-x-hidden">
                <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />

                <div className="space-y-2 w-full min-w-0">
                  <div className="h-4 w-full max-w-[160px] bg-slate-200 rounded" />
                  <div className="h-3 w-full max-w-[130px] bg-slate-200 rounded" />
                  <div className="h-3 w-full max-w-[100px] bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-8 w-20 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          {/* LINE CHART */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-200 rounded" />
            <div className="h-72 w-full bg-slate-200 rounded-xl" />
          </div>

          {/* PIE CHART */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-200 rounded" />
            <div className="h-64 w-full bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-center">
          {/* LEFT */}
          <div className="space-y-4">
            <div className="pill bg-sky-100 text-sky-700 w-fit">
              Dashboard Overview
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Website dashboard
            </h1>

            <p className="max-w-lg text-sm leading-7 text-slate-600">
              Monitor incoming requests, detect suspicious activity, and track
              blocked traffic in real-time.
            </p>
          </div>

          {/* RIGHT (UPGRADED CARD) */}
          <div className="relative rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            {/* subtle glow */}
            <div className="absolute inset-0 rounded-[24px] bg-sky-100/20 blur-xl opacity-40 pointer-events-none" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                <Globe className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {tenant?.name || admin?.name}
                </p>

                <p className="text-sm text-slate-500">
                  {tenant?.website || "Website not set"}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {tenant?.status || "active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          title="Total Requests"
          value={stats.total}
          icon={<Activity />}
          tone="neutral"
        />

        <Kpi
          title="Allowed Traffic"
          value={stats.allowed}
          icon={<ShieldAlert />}
          tone="safe"
        />

        <Kpi
          title="Blocked Requests"
          value={stats.blocked}
          icon={<Ban />}
          tone="danger"
        />

        <Kpi
          title="Active Threats"
          value={stats.activeThreats}
          icon={<Radar />}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        {/* LINE CHART */}
        <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Requests over time
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Live traffic flow hitting your system.
                </p>
              </div>

              {/* live indicator */}
              <span className="flex items-center gap-2 text-xs text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic}>
                  <XAxis dataKey="_id" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0ea5e9" // changed → security blue
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* PIE CHART */}
        <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Allowed vs Blocked
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Decision breakdown by security rules.
            </p>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={blocks}
                    dataKey="count"
                    nameKey="label"
                    outerRadius={92}
                    innerRadius={56}
                  >
                    {blocks.map((entry, index) => (
                      <Cell
                        key={entry._id || index}
                        fill={
                          index === 0
                            ? "#10b981" // allowed → green
                            : "#ef4444" // blocked → red
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,0.85fr]">
        <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Recent requests
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Live traffic logs captured by Sentinel Guard.
                </p>
              </div>

              {/* live badge */}
              <span className="flex items-center gap-2 text-xs text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-3">IP</th>
                    <th className="pb-3">Path</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Decision</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {recentLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="py-3 font-mono text-slate-700 whitespace-nowrap">
                        {log.ip}
                      </td>

                      <td className="py-3 text-slate-700 max-w-[180px] truncate">
                        {log.path}
                      </td>

                      <td className="py-3">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium">
                          {log.method}
                        </span>
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            log.status === "Blocked"
                              ? "bg-red-100 text-red-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              log.status === "Blocked"
                                ? "bg-red-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          {log.status}
                        </span>
                      </td>

                      <td className="py-3 text-slate-500 text-xs">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-950">
                Top blocked IPs
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Sources generating the most malicious traffic.
              </p>

              {topIps.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  No threats detected yet.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {topIps.map((ip, i) => (
                    <li
                      key={ip._id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
                    >
                      <span className="font-mono text-slate-600 text-sm">
                        {ip._id}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">blocked</span>
                        <span className="font-semibold text-red-600">
                          {ip.count}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Demo traffic tools
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Use your API key to generate test requests directly from the
                    dashboard.
                  </p>
                </div>
                <button
                  onClick={loadDashboard}
                  disabled={spinLoad}
                  className="inline-flex items-center gap-2 rounded-2xl cursor-pointer bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 transition"
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${spinLoad ? "animate-spin" : ""}`}
                  />
                  {spinLoad ? "Refreshing..." : "Refresh Data"}
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your API key here"
                  className="mt-2 w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={runSingleTraffic}
                  disabled={trafficLoading}
                  className="inline-flex items-center gap-2 rounded-2xl cursor-pointer bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {sendingTraffic ? "Sending..." : "Send Test Request"}
                </button>
                <button
                  onClick={runAttackTraffic}
                  disabled={trafficLoading || attackLoading}
                  className="inline-flex items-center gap-2 rounded-2xl cursor-pointer bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-500 transition"
                >
                  <Zap className="h-4 w-4" />
                  {attackLoading ? "Attacking..." : "Simulate Attack"}
                </button>
                <button
                  onClick={rotateKey}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100/20 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer transition"
                >
                  <KeyRound className="h-4 w-4" />
                  New Key
                </button>
              </div>

              <div className="rounded-2xl bg-slate-950 px-4 py-3 font-mono text-xs overflow-x-auto text-green-400 border border-slate-800">
                {trafficMessage ||
                  apiKeyMessage ||
                  "Use these buttons to generate demo traffic quickly."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value, icon, tone = "neutral" }) {
  const styles = {
    neutral: "bg-slate-100 text-slate-700",
    safe: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="group relative rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      {/* subtle glow */}
      <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-sky-100/40 to-indigo-100/40" />

      <div className="relative space-y-3">
        <div
          className={`h-11 w-11 flex items-center justify-center rounded-xl ${styles[tone]}`}
        >
          {icon}
        </div>

        <p className="text-sm text-slate-500">{title}</p>

        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-semibold text-slate-900">
            {value ?? 0}
          </h3>

          {/* mini status dot */}
          {tone !== "neutral" && (
            <span
              className={`h-2 w-2 rounded-full ${
                tone === "danger"
                  ? "bg-red-500"
                  : tone === "safe"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
