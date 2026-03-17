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

  const fetchWithAuth = useCallback(async (url) => {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    return res.json();
  }, []);

  const loadDashboard = useCallback(async () => {
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
  }, [fetchWithAuth]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meRes = await fetchWithAuth("/api/admin/me");
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
    }
  };

  const runAttackTraffic = async () => {
    setTrafficLoading(true);
    setTrafficMessage("");

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

      const blockedCount = responses.filter((res) => res?.status === 429).length;
      const forbiddenCount = responses.filter((res) => res?.status === 403).length;

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
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-12 text-sm text-slate-500">Loading dashboard...</div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Website dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              View request activity, blocked traffic, and suspicious behavior for
              your website in one place.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {tenant?.name || admin?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {tenant?.website || "Website not set"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                  Status: {tenant?.status || "active"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Total Requests" value={stats.total} icon={<Activity />} />
        <Kpi title="Allowed" value={stats.allowed} icon={<ShieldAlert />} />
        <Kpi title="Blocked" value={stats.blocked} icon={<Ban />} />
        <Kpi title="Active Threats" value={stats.activeThreats} icon={<Radar />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Requests over time
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Traffic coming to your website over time.
            </p>

            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic}>
                  <XAxis dataKey="_id" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Allowed vs blocked
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Simple view of traffic decisions made by Sentinel Guard.
            </p>

            <div className="mt-5 h-72">
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
                        fill={blockColors[index % blockColors.length]}
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
        <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Recent requests
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest request logs captured for your website.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-175 text-sm">
                <thead className="text-left text-slate-500 uppercase">
                  <tr>
                    <th className="pb-3 whitespace-nowrap font-medium">IP</th>
                    <th className="pb-3 font-medium">Path</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log._id} className="border-t border-slate-100">
                      <td className="py-3 font-mono whitespace-nowrap text-slate-700">{log.ip}</td>
                      <td className="py-3 text-slate-700">{log.path}</td>
                      <td className="py-3 text-slate-700">{log.method}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            log.status === "Blocked"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-950">
                Top blocked IPs
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                IP addresses with the most blocked requests.
              </p>

              {topIps.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  No blocked IPs yet.
                </p>
              ) : (
                <ul className="mt-5 divide-y divide-slate-100">
                  {topIps.map((ip) => (
                    <li key={ip._id} className="flex justify-between py-3 text-sm">
                      <span className="font-mono text-slate-600">{ip._id}</span>
                      <span className="font-semibold text-slate-900">{ip.count}</span>
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
                    Use your API key to generate test requests directly from the dashboard.
                  </p>
                </div>
                <button
                  onClick={loadDashboard}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">API Key</label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your API key here"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={runSingleTraffic}
                  disabled={trafficLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  Send Test Request
                </button>
                <button
                  onClick={runAttackTraffic}
                  disabled={trafficLoading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  Simulate Attack
                </button>
                <button
                  onClick={rotateKey}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <KeyRound className="h-4 w-4" />
                  New Key
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 px-4 py-3 font-mono text-xs text-slate-100">
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

function Kpi({ title, value, icon }) {
  return (
    <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
