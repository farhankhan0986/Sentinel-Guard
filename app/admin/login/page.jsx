"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

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
  <div className="min-h-screen bg-[#eef2f7] text-slate-800 px-6 py-12 relative overflow-hidden">

    {/* soft background glow */}
    <div className="absolute top-[-100px] left-1/3 w-[400px] h-[400px] bg-sky-200/40 blur-3xl rounded-full" />
    <div className="absolute bottom-[-100px] right-1/3 w-[400px] h-[400px] bg-indigo-200/40 blur-3xl rounded-full" />

    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center relative">

      {/* SINGLE CARD (not split anymore) */}
      <div className="w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">

        {/* HEADER */}
        <div className="space-y-3 text-center">

          <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Login to your dashboard
          </h1>

          <p className="text-sm text-slate-500">
            Monitor traffic, detect threats, and manage your protection layer.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              name="floating_email"
              value={form.floating_email}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              name="floating_password"
              value={form.floating_password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-medium text-white hover:bg-sky-500 transition disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <a href="/admin/signup" className="text-sky-600 hover:underline">
              Sign up
            </a>
          </p>

        </form>
      </div>
    </div>
  </div>
);
}