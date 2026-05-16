"use client";

import { useEffect, useState } from "react";
import { getOccupancyReport, type OccupancyReport } from "@/lib/api";

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
      <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-2)" }}>{label}</p>
      <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-3xl)", fontWeight: "var(--dk-weight-bold)", color: color ?? "var(--dk-fg)", lineHeight: 1 }}>{value}</p>
      {sub && <p className="dk-caption" style={{ marginTop: "var(--dk-space-2)" }}>{sub}</p>}
    </div>
  );
}

export default function OccupancyPage() {
  const [report, setReport] = useState<OccupancyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOccupancyReport()
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <div style={{ marginBottom: "var(--dk-space-6)" }}>
        <p className="dk-eyebrow">Reports</p>
        <h1 className="dk-h3">Portfolio Occupancy</h1>
      </div>

      {loading && <p className="dk-meta">Loading…</p>}
      {error && <p style={{ color: "var(--dk-danger)" }} className="dk-meta">{error}</p>}

      {report && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--dk-space-4)", marginBottom: "var(--dk-space-8)" }}>
            <KpiCard
              label="Portfolio Occupancy"
              value={`${report.portfolio_occupancy_rate}%`}
              color={report.portfolio_occupancy_rate >= 80 ? "var(--dk-success)" : "var(--dk-warning)"}
              sub={`${report.period_start} – ${report.period_end}`}
            />
            <KpiCard
              label="Total Vacancy Cost"
              value={`$${report.total_vacancy_cost.toLocaleString()}`}
              color="var(--dk-danger)"
              sub="Estimated lost revenue"
            />
            <KpiCard
              label="Properties Tracked"
              value={report.properties.length}
            />
          </div>

          <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Property", "Status", "Last Move-out", "Vacancy Days", "Vacancy Cost", "Current Tenant"].map((h) => (
                      <th key={h} className="dk-meta" style={{ textAlign: "left", padding: "var(--dk-space-4) var(--dk-space-5)", borderBottom: "2px solid var(--dk-border)", color: "var(--dk-fg-2)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.properties.map((p) => (
                    <tr key={p.property_id} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                      <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                        <p className="dk-body" style={{ fontWeight: "var(--dk-weight-semibold)" }}>{p.property_title}</p>
                        <p className="dk-caption">{p.property_address}</p>
                      </td>
                      <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                        <span style={{
                          backgroundColor: p.status === "occupied" ? "var(--dk-success-bg)" : "var(--dk-danger-bg)",
                          color: p.status === "occupied" ? "var(--dk-success)" : "var(--dk-danger)",
                          borderRadius: "var(--dk-radius-pill)",
                          padding: "2px 10px",
                          fontSize: "var(--dk-text-xs)",
                          fontWeight: "var(--dk-weight-semibold)",
                          textTransform: "capitalize",
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-meta">{p.last_moveout ?? "—"}</td>
                      <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)", color: p.vacancy_days > 30 ? "var(--dk-danger)" : "var(--dk-fg-2)" }} className="dk-meta">{p.vacancy_days > 0 ? `${p.vacancy_days}d` : "—"}</td>
                      <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)", color: p.vacancy_cost > 0 ? "var(--dk-danger)" : "var(--dk-fg-2)" }} className="dk-body">
                        {p.vacancy_cost > 0 ? `$${p.vacancy_cost.toLocaleString()}` : "—"}
                      </td>
                      <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-meta">{p.current_tenant ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
