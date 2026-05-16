"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getProperty, getTenants, getMaintenanceRequests, generatePropertyDescription,
  getPropertyFinancials, getPropertyComps,
  type Property, type Tenant, type MaintenanceRequest, type PropertyFinancials,
} from "@/lib/api";

const PRIORITY_COLOR: Record<string, string> = {
  emergency: "var(--dk-danger)",
  high:      "var(--dk-danger)",
  medium:    "var(--dk-warning)",
  low:       "var(--dk-fg-2)",
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  available: { bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  rented:    { bg: "var(--dk-info-bg)",    color: "var(--dk-info)" },
  sold:      { bg: "var(--dk-gray-100)",   color: "var(--dk-fg-2)" },
  pending:   { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
};

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{ backgroundColor: bg, color, borderRadius: "var(--dk-radius-pill)", padding: "2px 10px", fontSize: "var(--dk-text-xs)", fontWeight: "var(--dk-weight-semibold)", textTransform: "capitalize" }}>
      {text}
    </span>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [financials, setFinancials] = useState<PropertyFinancials | null>(null);
  const [comps, setComps] = useState<{ comps: any[]; market_avg_price?: number; market_diff_pct?: number } | null>(null);
  const [tab, setTab] = useState<"info" | "financials" | "comps">("info");
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);

  const loadProperty = () => getProperty(id).then(setProperty).catch(console.error);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProperty(id),
      getTenants({ property_id: id }),
      getMaintenanceRequests({ property_id: id }),
    ]).then(([p, t, m]) => { setProperty(p); setTenants(t); setMaintenance(m); });
  }, [id]);

  useEffect(() => {
    if (tab === "financials" && !financials) {
      getPropertyFinancials(id).then(setFinancials).catch(console.error);
    }
    if (tab === "comps" && !comps) {
      getPropertyComps(id).then(setComps).catch(console.error);
    }
  }, [tab]);

  const handleGenerateDesc = async () => {
    setGeneratingDesc(true);
    setDescError(null);
    try {
      await generatePropertyDescription(id);
      await loadProperty();
    } catch (e: any) {
      setDescError(e.message);
    } finally {
      setGeneratingDesc(false);
    }
  };

  if (!property) return <p className="dk-meta" style={{ padding: "var(--dk-space-8)" }}>Loading…</p>;

  const statusStyle = STATUS_BADGE[property.status] ?? STATUS_BADGE.available;

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
      {/* Header card */}
      <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--dk-space-4)" }}>
          <div>
            <p className="dk-eyebrow">Property</p>
            <h1 className="dk-h3">{property.title}</h1>
            <p className="dk-meta" style={{ marginTop: "var(--dk-space-1)" }}>
              {property.address}, {property.city}, {property.state} {property.zip_code}
            </p>
            <div style={{ display: "flex", gap: "var(--dk-space-3)", marginTop: "var(--dk-space-3)", flexWrap: "wrap", alignItems: "center" }}>
              <Badge text={property.property_type} bg="var(--dk-bg-tint)" color="var(--dk-brand)" />
              <Badge text={property.status} bg={statusStyle.bg} color={statusStyle.color} />
              {property.bedrooms && <span className="dk-meta">{property.bedrooms} bed</span>}
              {property.bathrooms && <span className="dk-meta">{property.bathrooms} bath</span>}
              {property.square_feet && <span className="dk-meta">{property.square_feet.toLocaleString()} sqft</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-2xl)", fontWeight: "var(--dk-weight-bold)", color: "var(--dk-fg)" }}>
              ${property.price.toLocaleString()}
            </p>
            <Link
              href={`/properties/${id}/documents`}
              style={{ display: "inline-block", marginTop: "var(--dk-space-3)", color: "var(--dk-brand)", fontSize: "var(--dk-text-sm)", fontWeight: "var(--dk-weight-semibold)", textDecoration: "none" }}
            >
              📎 Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "var(--dk-space-2)", marginBottom: "var(--dk-space-5)" }}>
        {tabBtn("info", "Info")}
        {tabBtn("financials", "Financials")}
        {tabBtn("comps", "Market Comps")}
      </div>

      {/* Info tab */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--dk-space-6)" }}>
          {/* Description */}
          <div style={{ gridColumn: "1 / -1", backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-4)" }}>
              <h2 className="dk-h5">Description</h2>
              <button
                onClick={handleGenerateDesc}
                disabled={generatingDesc}
                style={{ backgroundColor: "var(--dk-brand-soft)", color: "var(--dk-brand)", border: "none", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-2) var(--dk-space-4)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)", cursor: generatingDesc ? "not-allowed" : "pointer", opacity: generatingDesc ? 0.6 : 1 }}
              >
                {generatingDesc ? "Generating…" : "✨ Generate with AI"}
              </button>
            </div>
            {descError && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)", marginBottom: "var(--dk-space-3)" }}>{descError}</p>}
            {property.ai_description && (
              <div style={{ backgroundColor: "var(--dk-bg-tint)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4)", marginBottom: "var(--dk-space-4)" }}>
                <p className="dk-caption" style={{ color: "var(--dk-brand)", marginBottom: "var(--dk-space-2)" }}>AI GENERATED</p>
                <p className="dk-body">{property.ai_description}</p>
              </div>
            )}
            {property.description ? (
              <p className="dk-body" style={{ color: "var(--dk-fg-1)" }}>{property.description}</p>
            ) : (
              <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No description. Click "Generate with AI" to create one.</p>
            )}
          </div>

          {/* Tenants */}
          <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
            <h2 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>Tenants</h2>
            {tenants.length === 0 ? (
              <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No tenants</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
                {tenants.map((t) => (
                  <div key={t.id} style={{ paddingBottom: "var(--dk-space-3)", borderBottom: "1px solid var(--dk-border)" }}>
                    <Link href={`/tenants/${t.id}`} style={{ color: "var(--dk-brand)", fontWeight: "var(--dk-weight-semibold)", textDecoration: "none" }} className="dk-body">
                      {t.first_name} {t.last_name}
                    </Link>
                    <p className="dk-meta">{t.email}</p>
                    {t.rent_amount && <p className="dk-meta">${t.rent_amount.toLocaleString()}/mo</p>}
                    {t.lease_end && <p className="dk-caption">Lease ends {t.lease_end}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance */}
          <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
            <h2 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>Maintenance History</h2>
            {maintenance.length === 0 ? (
              <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No maintenance requests</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
                {maintenance.map((m) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "var(--dk-space-3)", borderBottom: "1px solid var(--dk-border)" }}>
                    <div>
                      <p className="dk-body" style={{ fontWeight: "var(--dk-weight-semibold)" }}>{m.title}</p>
                      <p className="dk-meta" style={{ textTransform: "capitalize" }}>{m.status.replace("_", " ")}</p>
                    </div>
                    <span style={{ color: PRIORITY_COLOR[m.priority], fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-xs)", textTransform: "uppercase" }}>{m.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financials tab */}
      {tab === "financials" && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
          {!financials ? (
            <p className="dk-meta">Loading financials…</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--dk-space-4)", marginBottom: "var(--dk-space-6)" }}>
                {[
                  { label: "Gross Rent Income", value: `$${financials.gross_rent_income.toLocaleString()}`, color: "var(--dk-success)" },
                  { label: "Total Expenses", value: `$${financials.total_expenses.toLocaleString()}`, color: "var(--dk-danger)" },
                  { label: "NOI", value: `$${financials.noi.toLocaleString()}`, color: financials.noi >= 0 ? "var(--dk-success)" : "var(--dk-danger)" },
                  { label: "Cap Rate", value: `${financials.cap_rate}%`, color: "var(--dk-brand)" },
                  { label: "Occupancy", value: `${financials.occupancy_rate}%` },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4)" }}>
                    <p className="dk-caption" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-2)" }}>{label}</p>
                    <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-xl)", fontWeight: "var(--dk-weight-bold)", color: color ?? "var(--dk-fg)" }}>{value}</p>
                  </div>
                ))}
              </div>

              {Object.keys(financials.expenses_by_category).length > 0 && (
                <div>
                  <h3 className="dk-h5" style={{ marginBottom: "var(--dk-space-4)" }}>Expenses by Category</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-2)" }}>
                    {Object.entries(financials.expenses_by_category).map(([cat, amt]) => (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--dk-space-3) var(--dk-space-4)", backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-sm)" }}>
                        <span className="dk-meta" style={{ textTransform: "capitalize" }}>{cat}</span>
                        <span className="dk-body" style={{ fontWeight: "var(--dk-weight-semibold)" }}>${amt.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Comps tab */}
      {tab === "comps" && (
        <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
          {!comps ? (
            <p className="dk-meta">Loading comps…</p>
          ) : (
            <>
              {comps.market_avg_price != null && (
                <div style={{ display: "flex", gap: "var(--dk-space-5)", marginBottom: "var(--dk-space-6)", flexWrap: "wrap" }}>
                  <div style={{ backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                    <p className="dk-caption">Your Price</p>
                    <p className="dk-h5">${property.price.toLocaleString()}</p>
                  </div>
                  <div style={{ backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                    <p className="dk-caption">Market Average</p>
                    <p className="dk-h5">${comps.market_avg_price.toLocaleString()}</p>
                  </div>
                  {comps.market_diff_pct != null && (
                    <div style={{ backgroundColor: Math.abs(comps.market_diff_pct) < 5 ? "var(--dk-success-bg)" : "var(--dk-warning-bg)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                      <p className="dk-caption">vs. Market</p>
                      <p className="dk-h5" style={{ color: comps.market_diff_pct > 0 ? "var(--dk-danger)" : "var(--dk-success)" }}>
                        {comps.market_diff_pct > 0 ? "+" : ""}{comps.market_diff_pct}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {comps.comps.length === 0 ? (
                <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No comparable properties found in {property.city} with similar size.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Address", "Beds/Baths", "Sqft", "Price", "$/sqft", "Status"].map((h) => (
                        <th key={h} className="dk-meta" style={{ textAlign: "left", padding: "var(--dk-space-3) var(--dk-space-4)", borderBottom: "2px solid var(--dk-border)", color: "var(--dk-fg-2)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comps.comps.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                        <td style={{ padding: "var(--dk-space-3) var(--dk-space-4)" }} className="dk-meta">{c.address}</td>
                        <td style={{ padding: "var(--dk-space-3) var(--dk-space-4)" }} className="dk-meta">{c.bedrooms ?? "—"}/{c.bathrooms ?? "—"}</td>
                        <td style={{ padding: "var(--dk-space-3) var(--dk-space-4)" }} className="dk-meta">{c.square_feet?.toLocaleString() ?? "—"}</td>
                        <td style={{ padding: "var(--dk-space-3) var(--dk-space-4)", fontWeight: "var(--dk-weight-semibold)" }} className="dk-body">${c.price.toLocaleString()}</td>
                        <td style={{ padding: "var(--dk-space-3) var(--dk-space-4)" }} className="dk-meta">{c.price_per_sqft ? `$${c.price_per_sqft}` : "—"}</td>
                        <td style={{ padding: "var(--dk-space-3) var(--dk-space-4)", textTransform: "capitalize" }} className="dk-meta">{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
