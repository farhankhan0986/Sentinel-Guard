"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ floating_email: "", floating_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      router.refresh();
      router.push("/admin/dashboard");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      {/* CARD */}
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex">

        {/* LEFT */}
        <div className="hidden md:flex md:w-[42%] flex-col justify-between p-8 bg-sky-500">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm font-semibold text-white">Sentinel Guard</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white leading-snug">
              Protect your API.<br />Monitor every request.
            </h2>
            <p className="text-xs text-slate-800 leading-5">
              Rate limiting, firewall rules, and threat detection — handled automatically.
            </p>
          </div>

          <p className="text-xs text-slate-600">© 2025 Sentinel Guard</p>
        </div>

        {/* RIGHT */}
        <div className="flex-1 bg-white p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Sign in</h3>
            <p className="mt-0.5 text-sm text-slate-500">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            <Field
              label="Email"
              name="floating_email"
              type="email"
              value={form.floating_email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              name="floating_password"
              type="password"
              value={form.floating_password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-400 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-xs text-slate-500">
              No account?{" "}
              <a href="/admin/signup" className="font-medium text-slate-900 hover:underline">
                Create one
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
      />
    </div>
  );
}