"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTenants, createTenant, updateTenant, deleteTenant,
  getProperties, type Tenant, type Property,
} from "@/lib/api";

const TIER_COLOR: Record<string, string> = {
  low: "var(--dk-success)", medium: "var(--dk-warning)", high: "var(--dk-danger)",
};

const EMPTY_FORM = {
  first_name: "", last_name: "", email: "", phone: "",
  property_id: "", lease_start: "", lease_end: "",
  rent_amount: "", income: "", prior_eviction: "false",
};

function ScoreBadge({ score, tier }: { score?: number; tier?: string }) {
  if (score == null) return <span style={{ color: "var(--dk-fg-muted)" }} className="dk-caption">—</span>;
  return (
    <span style={{ color: TIER_COLOR[tier ?? "medium"] ?? "var(--dk-fg-2)", fontWeight: "var(--dk-weight-bold)", fontSize: "var(--dk-text-sm)" }}>
      {score}
    </span>
  );
}

function TenantForm({
  initial, properties, onSave, onCancel, saving,
}: {
  initial: typeof EMPTY_FORM;
  properties: Property[];
  onSave: (d: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)",
    border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-md)",
    backgroundColor: "var(--dk-bg-muted)", color: "var(--dk-fg)",
    fontSize: "var(--dk-text-sm)", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)",
    color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-1)", textTransform: "uppercase",
  };
  const field = (label: string, key: keyof typeof EMPTY_FORM, type = "text", required = false) => (
    <div>
      <label style={labelStyle}>{label}{required && " *"}</label>
      <input type={type} value={form[key]} onChange={set(key)} required={required} style={inputStyle} />
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--dk-space-4)" }}>
      {field("First Name", "first_name", "text", true)}
      {field("Last Name", "last_name", "text", true)}
      {field("Email", "email", "email", true)}
      {field("Phone", "phone")}
      <div>
        <label style={labelStyle}>Property</label>
        <select value={form.property_id} onChange={set("property_id")} style={inputStyle}>
          <option value="">— None —</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      {field("Rent Amount ($)", "rent_amount", "number")}
      {field("Lease Start", "lease_start", "date")}
      {field("Lease End", "lease_end", "date")}
      {field("Monthly Income ($)", "income", "number")}
      <div>
        <label style={labelStyle}>Prior Eviction</label>
        <select value={form.prior_eviction} onChange={set("prior_eviction")} style={inputStyle}>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: "var(--dk-space-3)", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{ padding: "var(--dk-space-2) var(--dk-space-5)", borderRadius: "var(--dk-radius-md)", border: "1px solid var(--dk-border)", backgroundColor: "transparent", color: "var(--dk-fg-2)", cursor: "pointer", fontWeight: "var(--dk-weight-semibold)" }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={{ padding: "var(--dk-space-2) var(--dk-space-5)", borderRadius: "var(--dk-radius-md)", border: "none", backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", cursor: saving ? "not-allowed" : "pointer", fontWeight: "var(--dk-weight-semibold)", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    Promise.all([getTenants(), getProperties()])
      .then(([t, p]) => { setTenants(t); setProperties(p); })
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const tenantToForm = (t: Tenant): typeof EMPTY_FORM => ({
    first_name: t.first_name, last_name: t.last_name, email: t.email,
    phone: t.phone ?? "", property_id: t.property_id ?? "",
    lease_start: t.lease_start ?? "", lease_end: t.lease_end ?? "",
    rent_amount: t.rent_amount != null ? String(t.rent_amount) : "",
    income: t.income != null ? String(t.income) : "",
    prior_eviction: t.prior_eviction ? "true" : "false",
  });

  const formToPayload = (f: typeof EMPTY_FORM) => ({
    first_name: f.first_name, last_name: f.last_name, email: f.email,
    phone: f.phone || undefined, property_id: f.property_id || undefined,
    lease_start: f.lease_start || undefined, lease_end: f.lease_end || undefined,
    rent_amount: f.rent_amount ? Number(f.rent_amount) : undefined,
    income: f.income ? Number(f.income) : undefined,
    prior_eviction: f.prior_eviction === "true",
  });

  const handleCreate = async (form: typeof EMPTY_FORM) => {
    setSaving(true); setError(null);
    try { await createTenant(formToPayload(form) as any); setShowAdd(false); load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form: typeof EMPTY_FORM) => {
    if (!editId) return;
    setSaving(true); setError(null);
    try { await updateTenant(editId, formToPayload(form)); setEditId(null); load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setSaving(true); setError(null);
    try { await deleteTenant(id); setDeleteId(null); load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const thStyle: React.CSSProperties = {
    padding: "var(--dk-space-3) var(--dk-space-4)", textAlign: "left",
    fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)",
    color: "var(--dk-fg-2)", textTransform: "uppercase", borderBottom: "2px solid var(--dk-border)",
  };
  const tdStyle: React.CSSProperties = {
    padding: "var(--dk-space-3) var(--dk-space-4)", borderBottom: "1px solid var(--dk-border)",
    fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)",
  };

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-6)" }}>
        <h1 className="dk-h3">Tenants</h1>
        <button
          onClick={() => { setShowAdd(true); setEditId(null); }}
          style={{ padding: "var(--dk-space-2) var(--dk-space-5)", borderRadius: "var(--dk-radius-md)", border: "none", backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", fontWeight: "var(--dk-weight-semibold)", cursor: "pointer", fontSize: "var(--dk-text-sm)" }}
        >
          + Add Tenant
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "var(--dk-danger-bg)", color: "var(--dk-danger)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-3) var(--dk-space-4)", marginBottom: "var(--dk-space-4)", fontSize: "var(--dk-text-sm)" }}>
          {error}
        </div>
      )}

      {showAdd && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-6)" }}>
          <h2 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>New Tenant</h2>
          <TenantForm initial={EMPTY_FORM} properties={properties} onSave={handleCreate} onCancel={() => setShowAdd(false)} saving={saving} />
        </div>
      )}

      <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Email", "Property", "Lease End", "Rent", "Score", "Actions"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 && (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: "var(--dk-space-8)", color: "var(--dk-fg-muted)" }}>No tenants found</td></tr>
            )}
            {tenants.map((t) => {
              const prop = t.property_id ? propertyMap.get(t.property_id) : null;
              if (editId === t.id) {
                return (
                  <tr key={t.id}>
                    <td colSpan={7} style={{ padding: "var(--dk-space-5)", backgroundColor: "var(--dk-bg-muted)" }}>
                      <TenantForm initial={tenantToForm(t)} properties={properties} onSave={handleUpdate} onCancel={() => setEditId(null)} saving={saving} />
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={t.id}>
                  <td style={tdStyle}>
                    <Link href={`/tenants/${t.id}`} style={{ color: "var(--dk-brand)", fontWeight: "var(--dk-weight-semibold)", textDecoration: "none" }}>
                      {t.first_name} {t.last_name}
                    </Link>
                  </td>
                  <td style={tdStyle}>{t.email}</td>
                  <td style={tdStyle}>{prop ? prop.title : "—"}</td>
                  <td style={tdStyle}>{t.lease_end || "—"}</td>
                  <td style={tdStyle}>{t.rent_amount ? `$${t.rent_amount.toLocaleString()}` : "—"}</td>
                  <td style={tdStyle}><ScoreBadge score={t.screening_score} tier={t.screening_tier} /></td>
                  <td style={tdStyle}>
                    {deleteId === t.id ? (
                      <span style={{ display: "flex", gap: "var(--dk-space-2)", alignItems: "center" }}>
                        <span className="dk-caption" style={{ color: "var(--dk-danger)" }}>Delete?</span>
                        <button onClick={() => handleDelete(t.id)} disabled={saving} style={{ padding: "2px 8px", border: "none", borderRadius: "var(--dk-radius-sm)", backgroundColor: "var(--dk-danger)", color: "var(--dk-white)", cursor: "pointer", fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)" }}>Yes</button>
                        <button onClick={() => setDeleteId(null)} style={{ padding: "2px 8px", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-sm)", backgroundColor: "transparent", color: "var(--dk-fg-2)", cursor: "pointer", fontSize: "var(--dk-text-xs)" }}>No</button>
                      </span>
                    ) : (
                      <span style={{ display: "flex", gap: "var(--dk-space-3)" }}>
                        <button onClick={() => { setEditId(t.id); setShowAdd(false); }} style={{ border: "none", backgroundColor: "transparent", color: "var(--dk-brand)", cursor: "pointer", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", padding: 0 }}>Edit</button>
                        <button onClick={() => setDeleteId(t.id)} style={{ border: "none", backgroundColor: "transparent", color: "var(--dk-danger)", cursor: "pointer", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", padding: 0 }}>Delete</button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
