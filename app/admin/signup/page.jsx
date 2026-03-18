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
  <div className="min-h-screen bg-[#eef2f7] text-slate-800 px-6 py-12 relative overflow-hidden">

    {/* soft glow */}
    <div className="absolute top-[-100px] left-1/3 w-[400px] h-[400px] bg-sky-200/40 blur-3xl rounded-full" />
    <div className="absolute bottom-[-100px] right-1/3 w-[400px] h-[400px] bg-indigo-200/40 blur-3xl rounded-full" />

    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center relative">

      <div className="w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">

        {/* HEADER */}
        <div className="space-y-4 text-center">

          <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>

          <p className="text-sm text-slate-500">
            Set up your website and start monitoring traffic instantly.
          </p>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-600">
              {message}
            </div>
          )}

          <Input label="Name" name="name" value={form.name} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
          <Input label="Website" name="website" value={form.website} onChange={handleChange} placeholder="https://yourwebsite.com" />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-medium text-white hover:bg-sky-500 transition disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/admin/login" className="text-sky-600 hover:underline">
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
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 transition"
      />
    </div>
  );
}