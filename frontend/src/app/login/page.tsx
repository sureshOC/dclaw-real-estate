"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // Also set cookie for middleware
      document.cookie = `dclaw_token=${localStorage.getItem("dclaw_token")}; path=/; SameSite=Lax`;
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--dk-bg-muted)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
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
            Sign in to your property management platform
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
            <label className="dk-meta" style={{ display: "block", marginBottom: "var(--dk-space-1)", color: "var(--dk-fg-2)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "var(--dk-space-3) var(--dk-space-4)",
                border: "1px solid var(--dk-border)",
                borderRadius: "var(--dk-radius-md)",
                fontSize: "var(--dk-text-sm)",
                fontFamily: "var(--dk-font-sans)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label className="dk-meta" style={{ display: "block", marginBottom: "var(--dk-space-1)", color: "var(--dk-fg-2)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "var(--dk-space-3) var(--dk-space-4)",
                border: "1px solid var(--dk-border)",
                borderRadius: "var(--dk-radius-md)",
                fontSize: "var(--dk-text-sm)",
                fontFamily: "var(--dk-font-sans)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="dk-meta" style={{ textAlign: "center", marginTop: "var(--dk-space-6)", color: "var(--dk-fg-2)" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "var(--dk-brand)", textDecoration: "none", fontWeight: "var(--dk-weight-semibold)" }}>
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
