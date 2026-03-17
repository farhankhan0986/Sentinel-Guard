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
    <div className="min-h-screen bg-[#020617] text-slate-200 px-6 py-12 relative overflow-hidden">

      {/* background glow */}
      <div className="absolute top-[-100px] left-1/3 w-[400px] h-[400px] bg-sky-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-100px] right-1/3 w-[400px] h-[400px] bg-indigo-500/20 blur-3xl rounded-full" />

      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center relative">

        <div className="grid w-full gap-10 rounded-[28px] border border-slate-800 max-w-[600px] bg-[#0b1220]/80 backdrop-blur-xl p-8 shadow-2xl lg:grid-cols-[1fr,0.9fr]">

          {/* LEFT */}
          <div className="space-y-6">

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-sm text-sky-400 font-medium">
                Secure Access
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Access your security dashboard
            </h1>

            <p className="text-slate-400 leading-7 max-w-md">
              Monitor traffic, detect malicious activity, and manage your protection layer —
              all from a single interface.
            </p>

            {/* subtle system info */}
            <div className="space-y-2 text-sm text-slate-500 pt-4">
              <p>• Real-time request monitoring</p>
              <p>• Threat detection & blocking</p>
              <p>• Secure API key management</p>
            </div>

          </div>

          {/* RIGHT FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-[24px] border border-slate-800 bg-[#020617]/70 p-6 backdrop-blur"
          >

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-400">Email</label>
              <input
                type="email"
                name="floating_email"
                value={form.floating_email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400">Password</label>
              <input
                type="password"
                name="floating_password"
                value={form.floating_password}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 transition"
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
              <a href="/admin/signup" className="text-sky-400 hover:underline">
                Sign up
              </a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}