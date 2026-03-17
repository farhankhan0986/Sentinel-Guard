"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

      if (!res.ok) {
        setError(data.error || "Unable to create account");
        return;
      }

      window.localStorage.setItem("sentinelApiKey", data.apiKey);

      setMessage("Account created. API key generated successfully.");

      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 px-6 py-12 relative overflow-hidden">

      {/* glow background */}
      <div className="absolute top-[-100px] left-1/3 w-[400px] h-[400px] bg-sky-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-100px] right-1/3 w-[400px] h-[400px] bg-indigo-500/20 blur-3xl rounded-full" />

      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center relative">

        <div className="grid w-full gap-10 rounded-[28px] border border-slate-800 lg:max-w-[600px] bg-[#0b1220]/80 backdrop-blur-xl p-8 shadow-2xl lg:grid-cols-[1fr,0.95fr]">

          {/* LEFT */}
          <div className="space-y-6">

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-sm text-sky-400 font-medium">
                Secure Setup
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Create your security layer
            </h1>

            <p className="text-slate-400 leading-7 max-w-md">
              Register your website, generate your API key, and start monitoring
              and blocking malicious traffic instantly.
            </p>

            {/* steps */}
            <div className="space-y-2 text-sm text-slate-500 pt-4">
              <p>• Register your website</p>
              <p>• Get your API key</p>
              <p>• Start monitoring traffic</p>
            </div>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-[24px] border border-slate-800 bg-[#020617]/70 p-6 backdrop-blur"
          >

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400">
                {message}
              </div>
            )}

            <Input label="Name" name="name" value={form.name} onChange={handleChange} />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />

            <Input
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-medium text-white hover:bg-sky-500 transition disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <a href="/admin/login" className="text-sky-400 hover:underline">
                Login
              </a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 transition"
      />
    </div>
  );
}