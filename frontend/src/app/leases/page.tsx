"use client";

import { useEffect, useState } from "react";
import { getExpiringLeases, renewLease, type ExpiringLease } from "@/lib/api";

function daysColor(days: number) {
  if (days < 30) return "var(--dk-danger-bg)";
  if (days < 60) return "var(--dk-warning-bg)";
  return "var(--dk-success-bg)";
}
function daysTextColor(days: number) {
  if (days < 30) return "var(--dk-danger)";
  if (days < 60) return "var(--dk-warning)";
  return "var(--dk-success)";
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<ExpiringLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(90);

  const [renewing, setRenewing] = useState<string | null>(null);
  const [renewForm, setRenewForm] = useState({ new_lease_end: "", new_rent_amount: "", notes: "" });
  const [renewError, setRenewError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getExpiringLeases(days)
      .then(setLeases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [days]);

  const handleRenew = async (tenantId: string) => {
    if (!renewForm.new_lease_end || !renewForm.new_rent_amount) {
      setRenewError("New end date and rent amount are required.");
      return;
    }
    try {
      await renewLease(tenantId, {
        new_lease_end: renewForm.new_lease_end,
        new_rent_amount: parseFloat(renewForm.new_rent_amount),
        notes: renewForm.notes || undefined,
      });
      setRenewing(null);
      setRenewForm({ new_lease_end: "", new_rent_amount: "", notes: "" });
      load();
    } catch (e: any) {
      setRenewError(e.message);
    }
  };

  return (
    <main>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--dk-space-6)" }}>
        <div>
          <p className="dk-eyebrow">Portfolio</p>
          <h1 className="dk-h3">Lease Lifecycle</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--dk-space-3)" }}>
          <span className="dk-meta">Expiring within</span>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: "var(--dk-space-2) var(--dk-space-4)",
                borderRadius: "var(--dk-radius-pill)",
                border: "1px solid var(--dk-border)",
                backgroundColor: days === d ? "var(--dk-brand)" : "var(--dk-bg)",
                color: days === d ? "var(--dk-white)" : "var(--dk-fg-2)",
                fontWeight: "var(--dk-weight-semibold)",
                fontSize: "var(--dk-text-sm)",
                cursor: "pointer",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="dk-meta">Loading…</p>}
      {error && <p style={{ color: "var(--dk-danger)" }} className="dk-meta">Error: {error}</p>}

      {!loading && leases.length === 0 && (
        <div
          style={{
            backgroundColor: "var(--dk-success-bg)",
            borderRadius: "var(--dk-radius-lg)",
            padding: "var(--dk-space-8)",
            textAlign: "center",
            color: "var(--dk-success)",
          }}
        >
          <p className="dk-body">No leases expiring within {days} days.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
        {leases.map((lease) => {
          const daysLeft = lease.days_remaining ?? 0;
          return (
            <div
              key={lease.tenant_id}
              style={{
                backgroundColor: "var(--dk-bg)",
                borderRadius: "var(--dk-radius-lg)",
                boxShadow: "var(--dk-shadow-sm)",
                padding: "var(--dk-space-5) var(--dk-space-6)",
                borderLeft: `4px solid ${daysTextColor(daysLeft)}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--dk-space-4)" }}>
                <div>
                  <p className="dk-body" style={{ fontWeight: "var(--dk-weight-semibold)" }}>{lease.name}</p>
                  <p className="dk-meta">{lease.email}</p>
                  {lease.rent_amount && (
                    <p className="dk-meta">Rent: ${lease.rent_amount.toLocaleString()}/mo</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--dk-space-4)" }}>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        backgroundColor: daysColor(daysLeft),
                        color: daysTextColor(daysLeft),
                        borderRadius: "var(--dk-radius-pill)",
                        padding: "var(--dk-space-1) var(--dk-space-4)",
                        fontWeight: "var(--dk-weight-bold)",
                        fontSize: "var(--dk-text-sm)",
                      }}
                    >
                      {daysLeft}d left
                    </span>
                    <p className="dk-caption" style={{ marginTop: "4px" }}>
                      Ends {lease.lease_end}
                    </p>
                  </div>
                  <button
                    onClick={() => { setRenewing(lease.tenant_id); setRenewError(null); }}
                    style={{
                      backgroundColor: "var(--dk-brand)",
                      color: "var(--dk-white)",
                      border: "none",
                      borderRadius: "var(--dk-radius-pill)",
                      padding: "var(--dk-space-2) var(--dk-space-5)",
                      fontWeight: "var(--dk-weight-semibold)",
                      fontSize: "var(--dk-text-sm)",
                      cursor: "pointer",
                    }}
                  >
                    Renew
                  </button>
                </div>
              </div>

              {renewing === lease.tenant_id && (
                <div
                  style={{
                    marginTop: "var(--dk-space-5)",
                    padding: "var(--dk-space-5)",
                    backgroundColor: "var(--dk-bg-muted)",
                    borderRadius: "var(--dk-radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--dk-space-3)",
                  }}
                >
                  <p className="dk-meta" style={{ fontWeight: "var(--dk-weight-semibold)" }}>Renew Lease</p>
                  {renewError && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}>{renewError}</p>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--dk-space-3)" }}>
                    <div>
                      <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>New End Date</label>
                      <input
                        type="date"
                        value={renewForm.new_lease_end}
                        onChange={(e) => setRenewForm((f) => ({ ...f, new_lease_end: e.target.value }))}
                        style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }}
                      />
                    </div>
                    <div>
                      <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>New Monthly Rent ($)</label>
                      <input
                        type="number"
                        placeholder={lease.rent_amount?.toString()}
                        value={renewForm.new_rent_amount}
                        onChange={(e) => setRenewForm((f) => ({ ...f, new_rent_amount: e.target.value }))}
                        style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={renewForm.notes}
                      onChange={(e) => setRenewForm((f) => ({ ...f, notes: e.target.value }))}
                      style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)", resize: "vertical" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "var(--dk-space-3)" }}>
                    <button
                      onClick={() => handleRenew(lease.tenant_id)}
                      style={{
                        backgroundColor: "var(--dk-brand)",
                        color: "var(--dk-white)",
                        border: "none",
                        borderRadius: "var(--dk-radius-pill)",
                        padding: "var(--dk-space-2) var(--dk-space-6)",
                        fontWeight: "var(--dk-weight-semibold)",
                        fontSize: "var(--dk-text-sm)",
                        cursor: "pointer",
                      }}
                    >
                      Confirm Renewal
                    </button>
                    <button
                      onClick={() => setRenewing(null)}
                      style={{
                        backgroundColor: "transparent",
                        color: "var(--dk-fg-2)",
                        border: "1px solid var(--dk-border)",
                        borderRadius: "var(--dk-radius-pill)",
                        padding: "var(--dk-space-2) var(--dk-space-5)",
                        fontSize: "var(--dk-text-sm)",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
