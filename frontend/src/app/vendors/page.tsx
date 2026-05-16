"use client";

import { useEffect, useState } from "react";
import { getVendors, createVendor, deleteVendor, type Vendor, type VendorSpecialty } from "@/lib/api";

const SPECIALTY_COLORS: Record<string, string> = {
  plumbing:    "var(--dk-info)",
  electrical:  "var(--dk-warning)",
  hvac:        "var(--dk-brand)",
  general:     "var(--dk-fg-2)",
  landscaping: "var(--dk-success)",
  roofing:     "var(--dk-danger)",
};

function SpecialtyBadge({ s }: { s: string }) {
  return (
    <span
      style={{
        backgroundColor: "var(--dk-bg-muted)",
        color: SPECIALTY_COLORS[s] ?? "var(--dk-fg-2)",
        borderRadius: "var(--dk-radius-pill)",
        padding: "2px 10px",
        fontSize: "var(--dk-text-xs)",
        fontWeight: "var(--dk-weight-semibold)",
        textTransform: "capitalize",
      }}
    >
      {s}
    </span>
  );
}

function Stars({ rating }: { rating?: number }) {
  if (!rating) return <span className="dk-caption" style={{ color: "var(--dk-fg-muted)" }}>No rating</span>;
  return (
    <span style={{ color: "var(--dk-warning)", fontSize: "var(--dk-text-sm)" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <span className="dk-caption" style={{ marginLeft: "4px", color: "var(--dk-fg-2)" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

const EMPTY_FORM = { name: "", specialty: "general" as VendorSpecialty, phone: "", email: "", notes: "" };

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getVendors()
      .then(setVendors)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) { setFormError("Name is required."); return; }
    try {
      await createVendor(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    await deleteVendor(id);
    load();
  };

  return (
    <main>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--dk-space-6)" }}>
        <div>
          <p className="dk-eyebrow">Directory</p>
          <h1 className="dk-h3">Vendors</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-3) var(--dk-space-6)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}
        >
          + Add Vendor
        </button>
      </div>

      {error && <p style={{ color: "var(--dk-danger)" }} className="dk-meta">{error}</p>}

      {showForm && (
        <div
          style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-6)", display: "flex", flexDirection: "column", gap: "var(--dk-space-4)" }}
        >
          <h2 className="dk-h5">New Vendor</h2>
          {formError && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}>{formError}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--dk-space-4)" }}>
            {[
              { label: "Name *", key: "name", type: "text" },
              { label: "Phone", key: "phone", type: "text" },
              { label: "Email", key: "email", type: "email" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--dk-space-4)" }}>
            <div>
              <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Specialty</label>
              <select value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value as VendorSpecialty }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }}>
                {["plumbing", "electrical", "hvac", "general", "landscaping", "roofing"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="dk-meta" style={{ display: "block", marginBottom: "4px" }}>Notes</label>
              <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ width: "100%", padding: "var(--dk-space-2) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--dk-space-3)" }}>
            <button onClick={handleCreate} style={{ backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-6)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}>Create</button>
            <button onClick={() => setShowForm(false)} style={{ backgroundColor: "transparent", color: "var(--dk-fg-2)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-5)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="dk-meta">Loading…</p>}

      <div
        style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", overflow: "hidden" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Specialty", "Phone", "Email", "Rating", ""].map((h) => (
                <th key={h} className="dk-meta" style={{ textAlign: "left", padding: "var(--dk-space-4) var(--dk-space-5)", borderBottom: "2px solid var(--dk-border)", color: "var(--dk-fg-2)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "var(--dk-space-8)", textAlign: "center" }} className="dk-meta">No vendors yet</td></tr>
            )}
            {vendors.map((v) => (
              <tr key={v.id} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)", fontWeight: "var(--dk-weight-semibold)" }} className="dk-body">{v.name}</td>
                <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }}><SpecialtyBadge s={v.specialty} /></td>
                <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-meta">{v.phone || "—"}</td>
                <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-meta">{v.email || "—"}</td>
                <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }}><Stars rating={v.rating} /></td>
                <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                  <button onClick={() => handleDelete(v.id)} style={{ color: "var(--dk-danger)", background: "none", border: "none", cursor: "pointer", fontSize: "var(--dk-text-sm)" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
