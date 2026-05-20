"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface BillingStatus {
  plan_tier: string;
  unit_limit: number;
  monthly_price: number;
  stripe_customer_id: string | null;
}

const PLANS = [
  { name: "free", label: "Free", price: 0, units: 3, features: ["Up to 3 units", "Core CRUD", "Basic reporting"] },
  { name: "starter", label: "Starter", price: 49, units: 20, features: ["Up to 20 units", "AI screening", "Rent collection", "Email notifications", "CSV import"] },
  { name: "pro", label: "Pro", price: 99, units: 100, features: ["Up to 100 units", "Everything in Starter", "Portfolio health score", "AI query interface", "AI lease abstraction", "Vendor marketplace", "Priority support"] },
];

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/billing/status`, { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setStatus)
      .catch(() => setError("Failed to load billing status"))
      .finally(() => setLoading(false));
  }, []);

  async function subscribe(plan: string) {
    if (plan === "free") return;
    setUpgrading(plan);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/billing/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSuccess(`Upgraded to ${data.plan} plan — $${data.monthly_price}/month`);
      setStatus((s) => s ? { ...s, plan_tier: plan } : s);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <main>
      <h1 className="dk-h3" style={{ marginBottom: "var(--dk-space-2)" }}>Billing & Plans</h1>
      <p className="dk-body" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-8)" }}>
        {status ? `Current plan: ${status.plan_tier.toUpperCase()} — ${status.unit_limit} unit limit` : "Loading..."}
      </p>

      {error && (
        <div style={{ backgroundColor: "var(--dk-danger-bg)", border: "1px solid var(--dk-danger)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4)", marginBottom: "var(--dk-space-6)", color: "var(--dk-danger)" }} className="dk-meta">
          {error}
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: "var(--dk-success-bg)", border: "1px solid var(--dk-success)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4)", marginBottom: "var(--dk-space-6)", color: "var(--dk-success)" }} className="dk-meta">
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--dk-space-6)" }}>
        {PLANS.map((plan) => {
          const isCurrent = status?.plan_tier === plan.name;
          return (
            <div
              key={plan.name}
              style={{
                backgroundColor: "var(--dk-bg)",
                borderRadius: "var(--dk-radius-lg)",
                boxShadow: isCurrent ? "0 0 0 2px var(--dk-brand)" : "var(--dk-shadow-sm)",
                padding: "var(--dk-space-8)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--dk-space-4)",
              }}
            >
              {isCurrent && (
                <span className="dk-caption" style={{ color: "var(--dk-brand)", fontWeight: "var(--dk-weight-semibold)" }}>
                  ✓ Current Plan
                </span>
              )}
              <div>
                <h2 className="dk-h4">{plan.label}</h2>
                <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-3xl)", fontWeight: "var(--dk-weight-bold)", color: "var(--dk-fg)" }}>
                  {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                </p>
                <p className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>{plan.units} unit limit</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--dk-space-2)" }}>
                {plan.features.map((f) => (
                  <li key={f} className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>✓ {f}</li>
                ))}
              </ul>
              {!isCurrent && plan.name !== "free" && (
                <button
                  onClick={() => subscribe(plan.name)}
                  disabled={upgrading === plan.name}
                  style={{
                    backgroundColor: "var(--dk-brand)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--dk-radius-pill)",
                    padding: "var(--dk-space-3) var(--dk-space-5)",
                    fontFamily: "var(--dk-font-display)",
                    fontWeight: "var(--dk-weight-semibold)",
                    fontSize: "var(--dk-text-sm)",
                    cursor: upgrading === plan.name ? "not-allowed" : "pointer",
                    opacity: upgrading === plan.name ? 0.7 : 1,
                    marginTop: "auto",
                  }}
                >
                  {upgrading === plan.name ? "Upgrading..." : `Upgrade to ${plan.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "var(--dk-space-8)", backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", padding: "var(--dk-space-6)", boxShadow: "var(--dk-shadow-sm)" }}>
        <h3 className="dk-h4" style={{ marginBottom: "var(--dk-space-3)" }}>Revenue Model</h3>
        <p className="dk-body" style={{ color: "var(--dk-fg-2)" }}>
          In addition to monthly subscription fees, DClaw earns <strong>0.5% of rent collected</strong> through the platform ACH integration.
          On a 50-unit portfolio averaging $2,000/month rent, that is $500/month in transaction revenue per customer — on top of the $99 subscription.
        </p>
      </div>
    </main>
  );
}
