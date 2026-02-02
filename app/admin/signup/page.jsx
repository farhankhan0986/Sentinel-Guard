"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    floating_name: "",
    floating_email: "",
    floating_password: "",
    repeat_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.floating_password !== form.repeat_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floating_name: form.floating_name.trim(),
          floating_email: form.floating_email.trim(),
          floating_password: form.floating_password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      router.push("/admin/login");
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
            Create your <span className="text-accent">Admin</span> account
          </h1>
          <p className="text-sm text-muted">
            Start securing your APIs with Sentinel Guard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs text-muted">Name</label>
            <input
              type="text"
              name="floating_name"
              value={form.floating_name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

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
              minLength={8}
              value={form.floating_password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs text-muted">Confirm password</label>
            <input
              type="password"
              name="repeat_password"
              minLength={8}
              value={form.repeat_password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              required
              className="mt-1 accent-[var(--accent)]"
            />
            <span>
              I agree to the{" "}
              <a href="/terms" className="text-accent hover:underline">
                Terms & Conditions
              </a>
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          {/* Footer */}
          <p className="pt-2 text-center text-xs text-muted">
            Already have an account?{" "}
            <a href="/admin/login" className="text-accent hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
