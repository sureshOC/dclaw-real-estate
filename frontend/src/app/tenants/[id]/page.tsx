"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getTenant, getPayments, createPayment, applyLateFee, updatePayment,
  screenTenant, getTenantCommunications, createCommunication, getLeaseHistory,
  renewLease,
  type Tenant, type RentPayment, type CommunicationLog, type LeaseEvent,
} from "@/lib/api";

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  low:    { bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  medium: { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  high:   { bg: "var(--dk-danger-bg)",  color: "var(--dk-danger)" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  paid:    { bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  partial: { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  late:    { bg: "var(--dk-danger-bg)",  color: "var(--dk-danger)" },
  pending: { bg: "var(--dk-gray-100)",   color: "var(--dk-gray-500)" },
};

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{ backgroundColor: bg, color, borderRadius: "var(--dk-radius-pill)", padding: "2px 10px", fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)" }}>
      {text}
    </span>
  );
}

const COMM_ICONS: Record<string, string> = { call: "📞", email: "✉️", notice: "📄", note: "📝", visit: "🚪" };

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [comms, setComms] = useState<CommunicationLog[]>([]);
  const [history, setHistory] = useState<LeaseEvent[]>([]);
  const [tab, setTab] = useState<"payments" | "screening" | "comms" | "lease">("payments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screening, setScreening] = useState(false);
  const [screenResult, setScreenResult] = useState<{ score: number; tier: string; flags: string[]; recommendation: string } | null>(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", paid_date: "", method: "bank_transfer", notes: "" });
  const [payError, setPayError] = useState<string | null>(null);

  const [showCommForm, setShowCommForm] = useState(false);
  const [commForm, setCommForm] = useState({ type: "note", direction: "outbound", summary: "", created_by: "" });
  const [commError, setCommError] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [t, p, c, h] = await Promise.all([
        getTenant(id),
        getPayments({ tenant_id: id }),
        getTenantCommunications(id),
        getLeaseHistory(id),
      ]);
      setTenant(t);
      setPayments(p);
      setComms(c);
      setHistory(h);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  const runScreen = async () => {
    setScreening(true);
    try {
      const result = await screenTenant(id);
      setScreenResult(result);
      const t = await getTenant(id);
      setTenant(t);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setScreening(false);
    }
  };

  const recordPayment = async () => {
    if (!tenant?.property_id || !payForm.amount || !payForm.paid_date) {
      setPayError("Amount, date, and a linked property are required.");
      return;
    }
    try {
      await createPayment({
        tenant_id: id,
        property_id: tenant.property_id,
        amount: tenant.rent_amount || parseFloat(payForm.amount),
        paid_amount: parseFloat(payForm.amount),
        due_date: payForm.paid_date,
        paid_date: payForm.paid_date,
        status: "paid",
        method: payForm.method as any,
        notes: payForm.notes || undefined,
      });
      setShowPaymentForm(false);
      setPayForm({ amount: "", paid_date: "", method: "bank_transfer", notes: "" });
      const p = await getPayments({ tenant_id: id });
      setPayments(p);
    } catch (e: any) {
      setPayError(e.message);
    }
  };

  const logComm = async () => {
    if (!commForm.summary) { setCommError("Summary is required."); return; }
    try {
      await createCommunication(id, commForm as any);
      setShowCommForm(false);
      setCommForm({ type: "note", direction: "outbound", summary: "", created_by: "" });
      const c = await getTenantCommunications(id);
      setComms(c);
    } catch (e: any) {
      setCommError(e.message);
    }
  };

  if (loading) return <p className="dk-meta">Loading…</p>;
  if (error) return <p style={{ color: "var(--dk-danger)" }} className="dk-meta">Error: {error}</p>;
  if (!tenant) return null;

  const tabBtn = (t: string, label: string) => (
    <button
      onClick={() => setTab(t as any)}
      style={{
        padding: "var(--dk-space-2) var(--dk-space-5)",
        borderRadius: "var(--dk-radius-pill)",
        border: "none",
        backgroundColor: tab === t ? "var(--dk-brand)" : "transparent",
        color: tab === t ? "var(--dk-white)" : "var(--dk-fg-2)",
        fontWeight: "var(--dk-weight-semibold)",
        fontSize: "var(--dk-text-sm)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <main>
      {/* Header */}
      <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-6)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--dk-space-4)" }}>
          <div>
            <p className="dk-eyebrow">Tenant</p>
            <h1 className="dk-h3">{tenant.first_name} {tenant.last_name}</h1>
            <p className="dk-meta">{tenant.email}{tenant.phone ? ` · ${tenant.phone}` : ""}</p>
            <div style={{ display: "flex", gap: "var(--dk-space-3)", marginTop: "var(--dk-space-3)", flexWrap: "wrap" }}>
              {tenant.lease_start && <span className="dk-caption">Lease: {tenant.lease_start} → {tenant.lease_end}</span>}
              {tenant.rent_amount && <span className="dk-caption">Rent: ${tenant.rent_amount.toLocaleString()}/mo</span>}
              {tenant.screening_tier && (
                <Badge
                  text={`${tenant.screening_tier.toUpperCase()} RISK · ${tenant.screening_score}/100`}
                  bg={TIER_STYLE[tenant.screening_tier]?.bg ?? "var(--dk-gray-100)"}
                  color={TIER_STYLE[tenant.screening_tier]?.color ?? "var(--dk-fg-2)"}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "var(--dk-space-2)", marginBottom: "var(--dk-space-5)" }}>
        {tabBtn("payments", "Payments")}
        {tabBtn("screening", "Screening")}
        {tabBtn("comms", "Activity")}
        {tabBtn("lease", "Lease History")}
      </div>

      {/* Payments tab */}
      {tab === "payments" && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-4)" }}>
            <h2 className="dk-h5">Payment History</h2>
            <button
              onClick={() => setShowPaymentForm(true)}
              style={{ backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-5)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}
            >
              + Record Payment
            </button>
          </div>

          {showPaymentForm && (
            <div style={{ backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-5)", marginBottom: "var(--dk-space-5)", display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
              {payError && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}>{payError}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--dk-space-3)" }}>
                <div>
                  <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Amount ($)</label>
                  <input type="number" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} placeholder={tenant.rent_amount?.toString()} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }} />
                </div>
                <div>
                  <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Date Paid</label>
                  <input type="date" value={payForm.paid_date} onChange={(e) => setPayForm((f) => ({ ...f, paid_date: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }} />
                </div>
                <div>
                  <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Method</label>
                  <select value={payForm.method} onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Notes</label>
                <input value={payForm.notes} onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }} />
              </div>
              <div style={{ display: "flex", gap: "var(--dk-space-3)" }}>
                <button onClick={recordPayment} style={{ backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-6)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}>Save</button>
                <button onClick={() => setShowPaymentForm(false)} style={{ backgroundColor: "transparent", color: "var(--dk-fg-2)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-5)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {payments.length === 0 ? (
            <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No payment records yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
              {payments.map((p) => {
                const s = STATUS_STYLE[p.status] ?? STATUS_STYLE.pending;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--dk-space-4) var(--dk-space-5)", backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-md)" }}>
                    <div>
                      <p className="dk-body" style={{ fontWeight: "var(--dk-weight-semibold)" }}>
                        ${(p.paid_amount ?? p.amount).toLocaleString()}
                        {p.late_fee ? <span style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}> + ${p.late_fee} late fee</span> : null}
                      </p>
                      <p className="dk-meta">{p.paid_date || p.due_date} · {p.method?.replace("_", " ") || "—"}</p>
                      {p.notes && <p className="dk-caption">{p.notes}</p>}
                    </div>
                    <Badge text={p.status.charAt(0).toUpperCase() + p.status.slice(1)} bg={s.bg} color={s.color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Screening tab */}
      {tab === "screening" && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-5)" }}>
            <h2 className="dk-h5">AI Tenant Screening</h2>
            <button
              onClick={runScreen}
              disabled={screening}
              style={{ backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-5)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: screening ? "not-allowed" : "pointer", opacity: screening ? 0.6 : 1 }}
            >
              {screening ? "Screening…" : tenant.screened_at ? "Re-Screen" : "Run Screening"}
            </button>
          </div>

          {(screenResult || tenant.screening_score != null) && (() => {
            const score = screenResult?.score ?? tenant.screening_score ?? 0;
            const tier = screenResult?.tier ?? tenant.screening_tier ?? "medium";
            const flags = screenResult?.flags ?? [];
            const rec = screenResult?.recommendation ?? tenant.screening_notes ?? "";
            const ts = TIER_STYLE[tier] ?? TIER_STYLE.medium;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--dk-space-5)" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-5xl)", fontWeight: "var(--dk-weight-bold)", color: ts.color, lineHeight: 1 }}>{score}</p>
                    <p className="dk-caption">/ 100</p>
                  </div>
                  <div>
                    <Badge text={`${tier.toUpperCase()} RISK`} bg={ts.bg} color={ts.color} />
                    {flags.length > 0 && (
                      <ul style={{ marginTop: "var(--dk-space-3)", paddingLeft: "var(--dk-space-4)" }}>
                        {flags.map((f) => <li key={f} className="dk-meta" style={{ color: "var(--dk-danger)" }}>⚠ {f}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
                {rec && (
                  <div style={{ backgroundColor: "var(--dk-bg-tint)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                    <p className="dk-meta" style={{ fontWeight: "var(--dk-weight-semibold)", marginBottom: "var(--dk-space-2)" }}>AI Recommendation</p>
                    <p className="dk-body">{rec}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {!screenResult && tenant.screening_score == null && (
            <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No screening data yet. Click "Run Screening" to generate a report.</p>
          )}
        </div>
      )}

      {/* Communications tab */}
      {tab === "comms" && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-4)" }}>
            <h2 className="dk-h5">Activity Log</h2>
            <button onClick={() => setShowCommForm(true)} style={{ backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-5)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}>+ Log Interaction</button>
          </div>

          {showCommForm && (
            <div style={{ backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-5)", marginBottom: "var(--dk-space-5)", display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
              {commError && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}>{commError}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--dk-space-3)" }}>
                <div>
                  <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Type</label>
                  <select value={commForm.type} onChange={(e) => setCommForm((f) => ({ ...f, type: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }}>
                    {["call", "email", "notice", "note", "visit"].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Direction</label>
                  <select value={commForm.direction} onChange={(e) => setCommForm((f) => ({ ...f, direction: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }}>
                    <option value="outbound">Outbound</option>
                    <option value="inbound">Inbound</option>
                  </select>
                </div>
                <div>
                  <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Your name</label>
                  <input value={commForm.created_by} onChange={(e) => setCommForm((f) => ({ ...f, created_by: e.target.value }))} placeholder="Optional" style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }} />
                </div>
              </div>
              <div>
                <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Summary</label>
                <textarea rows={3} value={commForm.summary} onChange={(e) => setCommForm((f) => ({ ...f, summary: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)", resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: "var(--dk-space-3)" }}>
                <button onClick={logComm} style={{ backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-6)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}>Save</button>
                <button onClick={() => setShowCommForm(false)} style={{ backgroundColor: "transparent", color: "var(--dk-fg-2)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-5)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {comms.length === 0 ? (
            <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No activity logged yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
              {comms.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: "var(--dk-space-4)", paddingBottom: "var(--dk-space-3)", borderBottom: "1px solid var(--dk-border)" }}>
                  <span style={{ fontSize: "20px", lineHeight: 1, marginTop: "2px" }}>{COMM_ICONS[c.type] ?? "💬"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--dk-space-3)", flexWrap: "wrap" }}>
                      <p className="dk-meta" style={{ fontWeight: "var(--dk-weight-semibold)" }}>{c.type.charAt(0).toUpperCase() + c.type.slice(1)}</p>
                      <span style={{ backgroundColor: c.direction === "inbound" ? "var(--dk-info-bg)" : "var(--dk-bg-tint)", color: c.direction === "inbound" ? "var(--dk-info)" : "var(--dk-brand)", borderRadius: "var(--dk-radius-pill)", padding: "1px 8px", fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)" }}>{c.direction}</span>
                      <span className="dk-caption">{new Date(c.created_at).toLocaleString()}</span>
                      {c.created_by && <span className="dk-caption">by {c.created_by}</span>}
                    </div>
                    <p className="dk-body" style={{ marginTop: "var(--dk-space-1)" }}>{c.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lease history tab */}
      {tab === "lease" && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
          <h2 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>Lease History</h2>
          {history.length === 0 ? (
            <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No lease events recorded.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
              {history.map((e) => (
                <div key={e.id} style={{ display: "flex", gap: "var(--dk-space-4)", paddingBottom: "var(--dk-space-3)", borderBottom: "1px solid var(--dk-border)" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "var(--dk-brand)", marginTop: "4px", flexShrink: 0 }} />
                  <div>
                    <div style={{ display: "flex", gap: "var(--dk-space-3)", alignItems: "center" }}>
                      <p className="dk-meta" style={{ fontWeight: "var(--dk-weight-semibold)", textTransform: "capitalize" }}>{e.event_type}</p>
                      <span className="dk-caption">{e.effective_date}</span>
                      {e.rent_amount && <span className="dk-caption">${e.rent_amount.toLocaleString()}/mo</span>}
                    </div>
                    {e.notes && <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginTop: "2px" }}>{e.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
