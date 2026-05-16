"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface PortalDashboard {
  tenant: {
    name: string;
    email: string;
    lease_start: string | null;
    lease_end: string | null;
    rent_amount: number | null;
  };
  open_requests: number;
  recent_payments: { amount: number; status: string; due_date: string }[];
  documents: { id: string; name: string; category: string }[];
}

function portalToken(): string | null {
  return localStorage.getItem("portal_token");
}

export default function PortalPage() {
  const [view, setView] = useState<"login" | "dashboard">("login");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null);
  const [maintenanceTitle, setMaintenanceTitle] = useState("");
  const [maintenanceDesc, setMaintenanceDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (portalToken()) setView("dashboard");
  }, []);

  useEffect(() => {
    if (view === "dashboard") {
      fetch(`${API_BASE}/api/v1/portal/dashboard`, {
        headers: { Authorization: `Bearer ${portalToken()}` },
      })
        .then((r) => r.json())
        .then(setDashboard)
        .catch(() => {
          localStorage.removeItem("portal_token");
          setView("login");
        });
    }
  }, [view]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/portal/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, portal_code: code }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(err.detail);
      }
      const data = await res.json();
      localStorage.setItem("portal_token", data.access_token);
      setView("dashboard");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  async function submitMaintenance(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/v1/portal/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${portalToken()}` },
      body: JSON.stringify({ title: maintenanceTitle, description: maintenanceDesc }),
    });
    if (res.ok) {
      setSubmitted(true);
      setMaintenanceTitle("");
      setMaintenanceDesc("");
    }
  }

  const STATUS_COLOR: Record<string, string> = {
    paid: "var(--dk-success)",
    pending: "var(--dk-warning)",
    late: "var(--dk-danger)",
    partial: "var(--dk-info)",
  };

  if (view === "login") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--dk-bg-muted)" }}>
        <div style={{ width: "100%", maxWidth: "380px", backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-md)", padding: "var(--dk-space-10)" }}>
          <h1 className="dk-h4" style={{ textAlign: "center", marginBottom: "var(--dk-space-2)" }}>Tenant Portal</h1>
          <p className="dk-meta" style={{ textAlign: "center", color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-6)" }}>
            Enter your email and the 6-digit code your property manager sent you.
          </p>
          {loginError && (
            <div style={{ backgroundColor: "var(--dk-danger-bg)", border: "1px solid var(--dk-danger)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-3)", marginBottom: "var(--dk-space-4)", color: "var(--dk-danger)" }} className="dk-meta">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-4)" }}>
            <div>
              <label className="dk-meta" style={{ display: "block", marginBottom: "var(--dk-space-1)", color: "var(--dk-fg-2)" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "var(--dk-space-3) var(--dk-space-4)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-md)", fontSize: "var(--dk-text-sm)", fontFamily: "var(--dk-font-body)", boxSizing: "border-box" }} />
            </div>
            <div>
              <label className="dk-meta" style={{ display: "block", marginBottom: "var(--dk-space-1)", color: "var(--dk-fg-2)" }}>Portal Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required maxLength={6} placeholder="ABC123" style={{ width: "100%", padding: "var(--dk-space-3) var(--dk-space-4)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-md)", fontSize: "var(--dk-text-sm)", fontFamily: "var(--dk-font-body)", letterSpacing: "0.2em", textTransform: "uppercase", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loginLoading} style={{ backgroundColor: "var(--dk-brand)", color: "#fff", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-3)", fontFamily: "var(--dk-font-display)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer", opacity: loginLoading ? 0.7 : 1 }}>
              {loginLoading ? "Signing in..." : "Access Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div style={{ textAlign: "center", padding: "var(--dk-space-12)" }} className="dk-body">Loading your portal...</div>;
  }

  const d = dashboard;

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "var(--dk-space-8) var(--dk-space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-8)" }}>
        <div>
          <h1 className="dk-h3" style={{ marginBottom: "var(--dk-space-1)" }}>Welcome, {d.tenant.name}</h1>
          <p className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>{d.tenant.email}</p>
        </div>
        <button onClick={() => { localStorage.removeItem("portal_token"); setView("login"); }} className="dk-meta" style={{ background: "none", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-4)", cursor: "pointer", color: "var(--dk-fg-2)" }}>
          Sign Out
        </button>
      </div>

      {/* Lease Info */}
      <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-4)" }}>
        <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-4)" }}>My Lease</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--dk-space-4)" }}>
          <div>
            <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-1)" }}>Monthly Rent</p>
            <p className="dk-body" style={{ fontWeight: "var(--dk-weight-semibold)" }}>{d.tenant.rent_amount ? `$${d.tenant.rent_amount.toLocaleString()}` : "—"}</p>
          </div>
          <div>
            <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-1)" }}>Lease Start</p>
            <p className="dk-body">{d.tenant.lease_start || "—"}</p>
          </div>
          <div>
            <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-1)" }}>Lease End</p>
            <p className="dk-body">{d.tenant.lease_end || "—"}</p>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-4)" }}>
        <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-4)" }}>Recent Payments</p>
        {d.recent_payments.length === 0 ? (
          <p className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>No payment history yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
            {d.recent_payments.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p className="dk-meta">{p.due_date}</p>
                <p className="dk-meta" style={{ fontWeight: "var(--dk-weight-semibold)" }}>${p.amount.toLocaleString()}</p>
                <span style={{ backgroundColor: "transparent", border: `1px solid ${STATUS_COLOR[p.status] || "var(--dk-border)"}`, color: STATUS_COLOR[p.status] || "var(--dk-fg-2)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-1) var(--dk-space-3)" }} className="dk-caption">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Maintenance */}
      <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-4)" }}>
        <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-4)" }}>Submit a Maintenance Request</p>
        <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-4)" }}>
          {d.open_requests} open request{d.open_requests !== 1 ? "s" : ""} currently active.
        </p>
        {submitted && <p className="dk-meta" style={{ color: "var(--dk-success)", marginBottom: "var(--dk-space-3)" }}>✓ Request submitted successfully!</p>}
        <form onSubmit={submitMaintenance} style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
          <input type="text" value={maintenanceTitle} onChange={(e) => setMaintenanceTitle(e.target.value)} required placeholder="Brief title (e.g. Leaking faucet in kitchen)" style={{ padding: "var(--dk-space-3) var(--dk-space-4)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-md)", fontSize: "var(--dk-text-sm)", fontFamily: "var(--dk-font-body)" }} />
          <textarea value={maintenanceDesc} onChange={(e) => setMaintenanceDesc(e.target.value)} required placeholder="Describe the issue in detail..." rows={3} style={{ padding: "var(--dk-space-3) var(--dk-space-4)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-md)", fontSize: "var(--dk-text-sm)", fontFamily: "var(--dk-font-body)", resize: "vertical" }} />
          <button type="submit" style={{ backgroundColor: "var(--dk-brand)", color: "#fff", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-3) var(--dk-space-5)", fontFamily: "var(--dk-font-display)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer", alignSelf: "flex-start" }}>
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
