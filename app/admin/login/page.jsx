"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    floating_email: "",
    floating_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.refresh();
      router.push("/admin/dashboard");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back to{" "}
            <span className="text-accent">Sentinel Guard</span>
          </h1>
          <p className="text-sm text-muted">
            Log in to your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs text-muted">Email address</label>
            <input
              type="email"
              name="floating_email"
              value={form.floating_email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-muted">Password</label>
            <input
              type="password"
              name="floating_password"
              value={form.floating_password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              className="accent-[var(--accent)] cursor-pointer"
            />
            <span>Remember me</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>

          {/* Footer */}
          <p className="pt-2 text-center text-xs text-muted">
            Don’t have an account?{" "}
            <Link href="/admin/signup" className="text-accent hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
