"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Ban, Server, ShieldAlert } from "lucide-react";
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

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 🔐 Auth check (JWT via httpOnly cookie)
        const meRes = await fetch("/api/admin/me", {
          credentials: "include",
        });

        if (!meRes.ok) {
          router.push("/admin/login");
          return;
        }

        // Helper for authenticated fetch
        const fetchWithAuth = async (url) => {
          const res = await fetch(url, {
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          });

          if (!res.ok) return null;
          return res.json();
        };

        // 📊 Fetch dashboard data
        const [trafficRes, blocksRes, ipsRes, recentLogsRes] =
          await Promise.all([
            fetchWithAuth("/api/analytics/traffic"),
            fetchWithAuth("/api/analytics/blocks"),
            fetchWithAuth("/api/analytics/top-ips"),
            fetchWithAuth("/api/admin/logs/recent"),
          ]);

        const trafficData = trafficRes?.data || [];

        const blocksData = (blocksRes?.data || []).map((b) => ({
          ...b,
          label: b._id, // already "Allowed" or "Blocked"
        }));

        const ipsData = ipsRes?.data || [];

        setTraffic(trafficData);
        setBlocks(blocksData);
        setTopIps(ipsData);
        setRecentLogs(recentLogsRes?.logs || []);
        const total = Array.isArray(blocksData)
          ? blocksData.reduce((sum, b) => sum + b.count, 0)
          : 0;

        const blocked =
  blocksData.find((b) => b._id === "Blocked")?.count || 0;


        setStats({
          total,
          blocked,
          allowed: total - blocked,
          activeThreats: ipsData.length,
        });
      } catch (err) {
        console.error(err);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 space-y-8 mt-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sentinel Guard
        </h1>
        <p className="text-sm text-muted-foreground">
          Security analytics overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Kpi title="Total Requests" value={stats.total} icon={<Activity />} />
        <Kpi title="Allowed" value={stats.allowed} icon={<Server />} />
        <Kpi title="Blocked" value={stats.blocked} icon={<Ban />} />
        <Kpi
          title="Active Threats"
          value={stats.activeThreats}
          icon={<ShieldAlert />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardContent className="p-6 h-72">
            <h3 className="text-sm font-medium mb-4">Requests over time</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={traffic}>
                <XAxis dataKey="_id" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6 h-72">
            <h3 className="text-sm font-medium mb-4">Traffic distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={blocks}
                  dataKey="count"
                  nameKey="label"
                  outerRadius={90}
                  innerRadius={55}
                >
                  {blocks.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Requests</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {recentLogs.map((log) => (
                <tr key={log._id} className="border-t">
                  <td className="px-4 py-2 font-mono">{log.ip}</td>
                  <td className="px-4 py-2">{log.path}</td>
                  <td className="px-4 py-2">{log.method}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        log.status === "Blocked"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  <td className="px-4 py-2 text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top IPs */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium mb-4">Top abusive IPs</h3>

          {topIps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No abusive IPs detected
            </p>
          ) : (
            <ul className="divide-y">
              {topIps.map((ip) => (
                <li key={ip._id} className="flex justify-between py-2 text-sm">
                  <span className="font-mono text-muted-foreground">
                    {ip._id}
                  </span>
                  <span className="font-medium">{ip.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ title, value, icon }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
