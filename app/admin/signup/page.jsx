"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", website: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Unable to create account"); return; }
      window.localStorage.setItem("sentinelApiKey", data.apiKey);
      setMessage("Account created. Redirecting…");
      setTimeout(() => router.push("/admin/login"), 2000);
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
        <div className="hidden md:flex md:w-[42%] flex-col justify-between bg-sky-500 p-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm font-semibold text-white">Sentinel Guard</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white leading-snug">
              Start protecting<br />your API today.
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
            <h3 className="text-lg font-semibold text-slate-900">Create account</h3>
            <p className="mt-0.5 text-sm text-slate-500">Set up your workspace to start monitoring.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-xs text-emerald-600">
                {message}
              </div>
            )}

            <Field label="Full name"   name="name"     type="text"     value={form.name}     onChange={handleChange} placeholder="Jane Smith" />
            <Field label="Email"       name="email"    type="email"    value={form.email}    onChange={handleChange} placeholder="you@example.com" />
            <Field label="Password"    name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
            <Field label="Website URL" name="website"  type="text"     value={form.website}  onChange={handleChange} placeholder="https://yourwebsite.com" />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-400 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{" "}
              <a href="/admin/login" className="font-medium text-slate-900 hover:underline">
                Sign in
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