"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    org_name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form.org_name, form.first_name, form.last_name, form.email, form.password);
      document.cookie = `dclaw_token=${localStorage.getItem("dclaw_token")}; path=/; SameSite=Lax`;
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--dk-space-3) var(--dk-space-4)",
    border: "1px solid var(--dk-border)",
    borderRadius: "var(--dk-radius-md)",
    fontSize: "var(--dk-text-sm)",
    fontFamily: "var(--dk-font-body)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "var(--dk-space-1)",
    color: "var(--dk-fg-2)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--dk-bg-muted)",
        padding: "var(--dk-space-6)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--dk-bg)",
          borderRadius: "var(--dk-radius-lg)",
          boxShadow: "var(--dk-shadow-md)",
          padding: "var(--dk-space-10)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--dk-space-8)" }}>
          <p
            style={{
              fontFamily: "var(--dk-font-display)",
              fontWeight: "var(--dk-weight-bold)",
              color: "var(--dk-brand)",
              fontSize: "var(--dk-text-2xl)",
              marginBottom: "var(--dk-space-2)",
            }}
          >
            DClaw Real Estate
          </p>
          <p className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>
            Create your free account — no credit card required
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "var(--dk-danger-bg)",
              border: "1px solid var(--dk-danger)",
              borderRadius: "var(--dk-radius-md)",
              padding: "var(--dk-space-3) var(--dk-space-4)",
              marginBottom: "var(--dk-space-5)",
              color: "var(--dk-danger)",
            }}
            className="dk-meta"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-4)" }}>
          <div>
            <label className="dk-meta" style={labelStyle}>Company / Organization Name</label>
            <input type="text" value={form.org_name} onChange={set("org_name")} required placeholder="Acme Properties LLC" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--dk-space-3)" }}>
            <div>
              <label className="dk-meta" style={labelStyle}>First Name</label>
              <input type="text" value={form.first_name} onChange={set("first_name")} required placeholder="Jane" style={inputStyle} />
            </div>
            <div>
              <label className="dk-meta" style={labelStyle}>Last Name</label>
              <input type="text" value={form.last_name} onChange={set("last_name")} required placeholder="Smith" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="dk-meta" style={labelStyle}>Work Email</label>
            <input type="email" value={form.email} onChange={set("email")} required placeholder="jane@acmeproperties.com" style={inputStyle} />
          </div>

          <div>
            <label className="dk-meta" style={labelStyle}>Password</label>
            <input type="password" value={form.password} onChange={set("password")} required placeholder="Min 8 characters" minLength={8} style={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "var(--dk-brand)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--dk-radius-pill)",
              padding: "var(--dk-space-3) var(--dk-space-6)",
              fontSize: "var(--dk-text-sm)",
              fontFamily: "var(--dk-font-display)",
              fontWeight: "var(--dk-weight-semibold)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "var(--dk-space-2)",
            }}
          >
            {loading ? "Creating account..." : "Start Free Trial →"}
          </button>

          <p className="dk-caption" style={{ textAlign: "center", color: "var(--dk-fg-3)" }}>
            Free plan includes up to 3 units. No credit card required.
          </p>
        </form>

        <p className="dk-meta" style={{ textAlign: "center", marginTop: "var(--dk-space-6)", color: "var(--dk-fg-2)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--dk-brand)", textDecoration: "none", fontWeight: "var(--dk-weight-semibold)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
