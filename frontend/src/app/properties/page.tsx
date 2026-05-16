"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProperties, createProperty, updateProperty, deleteProperty,
  type Property, type PropertyType, type PropertyStatus,
} from "@/lib/api";

const PROP_TYPES: PropertyType[] = ["house", "apartment", "condo", "commercial", "land"];
const PROP_STATUSES: PropertyStatus[] = ["available", "rented", "sold", "pending"];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  available: { bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  rented:    { bg: "var(--dk-info-bg)",    color: "var(--dk-info)" },
  sold:      { bg: "var(--dk-gray-100)",   color: "var(--dk-fg-2)" },
  pending:   { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
};

const EMPTY_FORM = {
  title: "", address: "", city: "", state: "", zip_code: "",
  price: "", property_type: "house" as PropertyType, status: "available" as PropertyStatus,
  bedrooms: "", bathrooms: "", square_feet: "", description: "",
};

function Badge({ text, style }: { text: string; style: { bg: string; color: string } }) {
  return (
    <span style={{
      backgroundColor: style.bg, color: style.color,
      borderRadius: "var(--dk-radius-pill)", padding: "2px 10px",
      fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)",
      textTransform: "capitalize",
    }}>
      {text}
    </span>
  );
}

function PropertyForm({
  initial, onSave, onCancel, saving,
}: {
  initial: typeof EMPTY_FORM;
  onSave: (data: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
      <div style={{ gridColumn: "1 / -1" }}>{field("Title", "title", "text", true)}</div>
      {field("Address", "address", "text", true)}
      {field("City", "city", "text", true)}
      {field("State", "state")}
      {field("ZIP", "zip_code")}
      {field("Price ($)", "price", "number", true)}
      <div>
        <label style={labelStyle}>Type *</label>
        <select value={form.property_type} onChange={set("property_type")} style={inputStyle}>
          {PROP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Status *</label>
        <select value={form.status} onChange={set("status")} style={inputStyle}>
          {PROP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {field("Bedrooms", "bedrooms", "number")}
      {field("Bathrooms", "bathrooms", "number")}
      {field("Square Feet", "square_feet", "number")}
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={set("description")} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    const params: Record<string, string> = {};
    if (typeFilter) params.property_type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    getProperties(params).then(setProperties).catch(console.error);
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const propToForm = (p: Property): typeof EMPTY_FORM => ({
    title: p.title, address: p.address, city: p.city, state: p.state,
    zip_code: p.zip_code, price: String(p.price),
    property_type: p.property_type, status: p.status,
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
    square_feet: p.square_feet != null ? String(p.square_feet) : "",
    description: p.description ?? "",
  });

  const formToPayload = (f: typeof EMPTY_FORM) => ({
    title: f.title, address: f.address, city: f.city, state: f.state,
    zip_code: f.zip_code, price: Number(f.price),
    property_type: f.property_type, status: f.status,
    bedrooms: f.bedrooms ? Number(f.bedrooms) : undefined,
    bathrooms: f.bathrooms ? Number(f.bathrooms) : undefined,
    square_feet: f.square_feet ? Number(f.square_feet) : undefined,
    description: f.description || undefined,
  });

  const handleCreate = async (form: typeof EMPTY_FORM) => {
    setSaving(true); setError(null);
    try {
      await createProperty(formToPayload(form) as any);
      setShowAdd(false); load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form: typeof EMPTY_FORM) => {
    if (!editId) return;
    setSaving(true); setError(null);
    try {
      await updateProperty(editId, formToPayload(form));
      setEditId(null); load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setSaving(true); setError(null);
    try {
      await deleteProperty(id);
      setDeleteId(null); load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const selectStyle: React.CSSProperties = {
    padding: "var(--dk-space-2) var(--dk-space-3)", border: "1px solid var(--dk-border)",
    borderRadius: "var(--dk-radius-md)", backgroundColor: "var(--dk-bg)",
    color: "var(--dk-fg)", fontSize: "var(--dk-text-sm)",
  };

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-6)" }}>
        <h1 className="dk-h3">Properties</h1>
        <button
          onClick={() => { setShowAdd(true); setEditId(null); }}
          style={{ padding: "var(--dk-space-2) var(--dk-space-5)", borderRadius: "var(--dk-radius-md)", border: "none", backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", fontWeight: "var(--dk-weight-semibold)", cursor: "pointer", fontSize: "var(--dk-text-sm)" }}
        >
          + Add Property
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "var(--dk-danger-bg)", color: "var(--dk-danger)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-3) var(--dk-space-4)", marginBottom: "var(--dk-space-4)", fontSize: "var(--dk-text-sm)" }}>
          {error}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-6)" }}>
          <h2 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>New Property</h2>
          <PropertyForm initial={EMPTY_FORM} onSave={handleCreate} onCancel={() => setShowAdd(false)} saving={saving} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "var(--dk-space-3)", marginBottom: "var(--dk-space-6)", flexWrap: "wrap" }}>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="">All Types</option>
          {PROP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          {PROP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Property cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--dk-space-5)" }}>
        {properties.length === 0 && (
          <p className="dk-meta" style={{ color: "var(--dk-fg-muted)", gridColumn: "1/-1" }}>No properties found.</p>
        )}
        {properties.map((p) => {
          const statusStyle = STATUS_STYLE[p.status] ?? STATUS_STYLE.available;
          return (
            <div key={p.id} style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {editId === p.id ? (
                <div style={{ padding: "var(--dk-space-5)" }}>
                  <h3 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>Edit Property</h3>
                  <PropertyForm initial={propToForm(p)} onSave={handleUpdate} onCancel={() => setEditId(null)} saving={saving} />
                </div>
              ) : (
                <>
                  <div style={{ padding: "var(--dk-space-5)", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--dk-space-2)" }}>
                      <Link
                        href={`/properties/${p.id}`}
                        style={{ color: "var(--dk-fg)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-base)", textDecoration: "none" }}
                        className="dk-body"
                      >
                        {p.title}
                      </Link>
                      <Badge text={p.status} style={statusStyle} />
                    </div>
                    <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-3)" }}>
                      {p.address}, {p.city}
                    </p>
                    <p style={{ fontFamily: "var(--dk-font-display)", fontWeight: "var(--dk-weight-bold)", fontSize: "var(--dk-text-lg)", color: "var(--dk-fg)" }}>
                      ${p.price.toLocaleString()}
                    </p>
                    <div style={{ display: "flex", gap: "var(--dk-space-2)", marginTop: "var(--dk-space-2)", flexWrap: "wrap" }}>
                      <Badge text={p.property_type} style={{ bg: "var(--dk-bg-tint)", color: "var(--dk-brand)" }} />
                      {p.bedrooms && <span className="dk-caption" style={{ color: "var(--dk-fg-2)" }}>{p.bedrooms}bd</span>}
                      {p.bathrooms && <span className="dk-caption" style={{ color: "var(--dk-fg-2)" }}>{p.bathrooms}ba</span>}
                      {p.square_feet && <span className="dk-caption" style={{ color: "var(--dk-fg-2)" }}>{p.square_feet.toLocaleString()} sqft</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", borderTop: "1px solid var(--dk-border)" }}>
                    <button
                      onClick={() => { setEditId(p.id); setShowAdd(false); }}
                      style={{ flex: 1, padding: "var(--dk-space-3)", border: "none", backgroundColor: "transparent", color: "var(--dk-brand)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer", borderRight: "1px solid var(--dk-border)" }}
                    >
                      Edit
                    </button>
                    {deleteId === p.id ? (
                      <div style={{ flex: 2, display: "flex", alignItems: "center", padding: "0 var(--dk-space-3)", gap: "var(--dk-space-2)" }}>
                        <span className="dk-caption" style={{ color: "var(--dk-danger)", flex: 1 }}>Delete?</span>
                        <button onClick={() => handleDelete(p.id)} disabled={saving} style={{ padding: "var(--dk-space-1) var(--dk-space-3)", border: "none", borderRadius: "var(--dk-radius-sm)", backgroundColor: "var(--dk-danger)", color: "var(--dk-white)", cursor: "pointer", fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)" }}>Yes</button>
                        <button onClick={() => setDeleteId(null)} style={{ padding: "var(--dk-space-1) var(--dk-space-3)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-sm)", backgroundColor: "transparent", color: "var(--dk-fg-2)", cursor: "pointer", fontSize: "var(--dk-text-xs)" }}>No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(p.id)}
                        style={{ flex: 1, padding: "var(--dk-space-3)", border: "none", backgroundColor: "transparent", color: "var(--dk-danger)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
