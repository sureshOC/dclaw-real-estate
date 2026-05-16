"use client";

import { useEffect, useState } from "react";
import {
  getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest,
  getProperties, getTenants,
  type MaintenanceRequest, type Priority, type MaintenanceStatus, type Property, type Tenant,
} from "@/lib/api";

const PRIORITIES: Priority[] = ["low", "medium", "high", "emergency"];
const STATUSES: MaintenanceStatus[] = ["open", "in_progress", "resolved", "closed"];

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  low:       { bg: "var(--dk-bg-tint)",    color: "var(--dk-fg-2)" },
  medium:    { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  high:      { bg: "var(--dk-danger-bg)",  color: "var(--dk-danger)" },
  emergency: { bg: "var(--dk-danger-bg)",  color: "var(--dk-danger)" },
};
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  open:        { bg: "var(--dk-info-bg)",    color: "var(--dk-info)" },
  in_progress: { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  resolved:    { bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  closed:      { bg: "var(--dk-bg-tint)",    color: "var(--dk-fg-2)" },
};

function Chip({ text, style }: { text: string; style: { bg: string; color: string } }) {
  return (
    <span style={{
      backgroundColor: style.bg, color: style.color,
      borderRadius: "var(--dk-radius-pill)", padding: "2px 10px",
      fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)",
      textTransform: "capitalize", whiteSpace: "nowrap",
    }}>
      {text.replace("_", " ")}
    </span>
  );
}

const EMPTY_FORM = {
  property_id: "", tenant_id: "", title: "", description: "",
  priority: "medium" as Priority, status: "open" as MaintenanceStatus,
};

function MaintenanceForm({
  initial, properties, tenants, onSave, onCancel, saving,
}: {
  initial: typeof EMPTY_FORM;
  properties: Property[];
  tenants: Tenant[];
  onSave: (d: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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

  const propTenants = form.property_id
    ? tenants.filter((t) => t.property_id === form.property_id)
    : tenants;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--dk-space-4)" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Title *</label>
        <input value={form.title} onChange={set("title")} required style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Property *</label>
        <select value={form.property_id} onChange={set("property_id")} required style={inputStyle}>
          <option value="">— Select —</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Tenant</label>
        <select value={form.tenant_id} onChange={set("tenant_id")} style={inputStyle}>
          <option value="">— None —</option>
          {propTenants.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Priority</label>
        <select value={form.priority} onChange={set("priority")} style={inputStyle}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Status</label>
        <select value={form.status} onChange={set("status")} style={inputStyle}>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Description *</label>
        <textarea value={form.description} onChange={set("description")} required rows={3} style={{ ...inputStyle, resize: "vertical" }} />
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

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    Promise.all([getMaintenanceRequests(params), getProperties(), getTenants()])
      .then(([r, p, t]) => { setRequests(r); setProperties(p); setTenants(t); })
      .catch((e) => setError(e.message));
  };
  useEffect(() => { load(); }, [statusFilter, priorityFilter]);

  const propertyMap = new Map(properties.map((p) => [p.id, p]));
  const tenantMap = new Map(tenants.map((t) => [t.id, t]));

  const reqToForm = (r: MaintenanceRequest): typeof EMPTY_FORM => ({
    property_id: r.property_id, tenant_id: r.tenant_id ?? "",
    title: r.title, description: r.description,
    priority: r.priority, status: r.status,
  });

  const formToPayload = (f: typeof EMPTY_FORM) => ({
    property_id: f.property_id, tenant_id: f.tenant_id || undefined,
    title: f.title, description: f.description,
    priority: f.priority, status: f.status,
  });

  const handleCreate = async (form: typeof EMPTY_FORM) => {
    setSaving(true); setError(null);
    try { await createMaintenanceRequest(formToPayload(form) as any); setShowAdd(false); load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form: typeof EMPTY_FORM) => {
    if (!editId) return;
    setSaving(true); setError(null);
    try { await updateMaintenanceRequest(editId, formToPayload(form)); setEditId(null); load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setSaving(true); setError(null);
    try { await deleteMaintenanceRequest(id); setDeleteId(null); load(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const selectStyle: React.CSSProperties = {
    padding: "var(--dk-space-2) var(--dk-space-3)", border: "1px solid var(--dk-border)",
    borderRadius: "var(--dk-radius-md)", backgroundColor: "var(--dk-bg)",
    color: "var(--dk-fg)", fontSize: "var(--dk-text-sm)",
  };
  const thStyle: React.CSSProperties = {
    padding: "var(--dk-space-3) var(--dk-space-4)", textAlign: "left",
    fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)",
    color: "var(--dk-fg-2)", textTransform: "uppercase", borderBottom: "2px solid var(--dk-border)",
  };
  const tdStyle: React.CSSProperties = {
    padding: "var(--dk-space-3) var(--dk-space-4)", borderBottom: "1px solid var(--dk-border)",
    fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)", verticalAlign: "top",
  };

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-6)" }}>
        <h1 className="dk-h3">Maintenance Requests</h1>
        <button
          onClick={() => { setShowAdd(true); setEditId(null); }}
          style={{ padding: "var(--dk-space-2) var(--dk-space-5)", borderRadius: "var(--dk-radius-md)", border: "none", backgroundColor: "var(--dk-brand)", color: "var(--dk-white)", fontWeight: "var(--dk-weight-semibold)", cursor: "pointer", fontSize: "var(--dk-text-sm)" }}
        >
          + New Request
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "var(--dk-danger-bg)", color: "var(--dk-danger)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-3) var(--dk-space-4)", marginBottom: "var(--dk-space-4)", fontSize: "var(--dk-text-sm)" }}>
          {error}
        </div>
      )}

      {showAdd && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-6)" }}>
          <h2 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>New Maintenance Request</h2>
          <MaintenanceForm initial={EMPTY_FORM} properties={properties} tenants={tenants} onSave={handleCreate} onCancel={() => setShowAdd(false)} saving={saving} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "var(--dk-space-3)", marginBottom: "var(--dk-space-5)", flexWrap: "wrap" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={selectStyle}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Title", "Property", "Tenant", "Priority", "Status", "Actions"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: "var(--dk-space-8)", color: "var(--dk-fg-muted)" }}>No requests found</td></tr>
            )}
            {requests.map((r) => {
              const prop = propertyMap.get(r.property_id);
              const tenant = r.tenant_id ? tenantMap.get(r.tenant_id) : null;
              if (editId === r.id) {
                return (
                  <tr key={r.id}>
                    <td colSpan={6} style={{ padding: "var(--dk-space-5)", backgroundColor: "var(--dk-bg-muted)" }}>
                      <MaintenanceForm initial={reqToForm(r)} properties={properties} tenants={tenants} onSave={handleUpdate} onCancel={() => setEditId(null)} saving={saving} />
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={r.id}>
                  <td style={tdStyle}>
                    <p style={{ fontWeight: "var(--dk-weight-semibold)" }}>{r.title}</p>
                    {r.description && <p className="dk-caption" style={{ color: "var(--dk-fg-2)", marginTop: "2px" }}>{r.description.slice(0, 60)}{r.description.length > 60 ? "…" : ""}</p>}
                  </td>
                  <td style={tdStyle}>{prop ? prop.title : "—"}</td>
                  <td style={tdStyle}>{tenant ? `${tenant.first_name} ${tenant.last_name}` : "—"}</td>
                  <td style={tdStyle}><Chip text={r.priority} style={PRIORITY_STYLE[r.priority] ?? PRIORITY_STYLE.medium} /></td>
                  <td style={tdStyle}><Chip text={r.status} style={STATUS_STYLE[r.status] ?? STATUS_STYLE.open} /></td>
                  <td style={tdStyle}>
                    {deleteId === r.id ? (
                      <span style={{ display: "flex", gap: "var(--dk-space-2)", alignItems: "center" }}>
                        <span className="dk-caption" style={{ color: "var(--dk-danger)" }}>Delete?</span>
                        <button onClick={() => handleDelete(r.id)} disabled={saving} style={{ padding: "2px 8px", border: "none", borderRadius: "var(--dk-radius-sm)", backgroundColor: "var(--dk-danger)", color: "var(--dk-white)", cursor: "pointer", fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)" }}>Yes</button>
                        <button onClick={() => setDeleteId(null)} style={{ padding: "2px 8px", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-sm)", backgroundColor: "transparent", color: "var(--dk-fg-2)", cursor: "pointer", fontSize: "var(--dk-text-xs)" }}>No</button>
                      </span>
                    ) : (
                      <span style={{ display: "flex", gap: "var(--dk-space-3)" }}>
                        <button onClick={() => { setEditId(r.id); setShowAdd(false); }} style={{ border: "none", backgroundColor: "transparent", color: "var(--dk-brand)", cursor: "pointer", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", padding: 0 }}>Edit</button>
                        <button onClick={() => setDeleteId(r.id)} style={{ border: "none", backgroundColor: "transparent", color: "var(--dk-danger)", cursor: "pointer", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", padding: 0 }}>Delete</button>
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
