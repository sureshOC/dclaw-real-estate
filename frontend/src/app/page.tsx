"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats, getHealthScore, type DashboardStats, type HealthScore } from "@/lib/api";

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div
      style={{
        backgroundColor: "var(--dk-bg)",
        borderRadius: "var(--dk-radius-lg)",
        boxShadow: "var(--dk-shadow-sm)",
        padding: "var(--dk-space-6)",
      }}
    >
      <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-2)" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--dk-font-display)",
          fontSize: "var(--dk-text-3xl)",
          fontWeight: "var(--dk-weight-bold)",
          color: "var(--dk-fg)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="dk-caption" style={{ marginTop: "var(--dk-space-2)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

const GRADE_COLOR: Record<string, string> = {
  A: "var(--dk-success)", B: "var(--dk-info)", C: "var(--dk-warning)",
  D: "var(--dk-warning)", F: "var(--dk-danger)",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_properties: 0,
    occupied: 0,
    vacant: 0,
    open_maintenance: 0,
    expiring_leases_30d: 0,
    rent_due: 0,
  });
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setError(e.message));
    getHealthScore().then(setHealth).catch(() => null);
  }, []);

  return (
    <main>
      <h1 className="dk-h3" style={{ marginBottom: "var(--dk-space-6)" }}>
        Dashboard
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: "var(--dk-danger-bg)",
            border: "1px solid var(--dk-danger)",
            borderRadius: "var(--dk-radius-md)",
            padding: "var(--dk-space-4)",
            marginBottom: "var(--dk-space-6)",
            color: "var(--dk-danger)",
          }}
          className="dk-meta"
        >
          Failed to load stats: {error}
        </div>
      )}

      {stats.expiring_leases_30d > 0 && (
        <Link
          href="/leases"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--dk-space-3)",
            backgroundColor: "var(--dk-warning-bg)",
            border: "1px solid var(--dk-warning)",
            borderRadius: "var(--dk-radius-md)",
            padding: "var(--dk-space-4) var(--dk-space-5)",
            marginBottom: "var(--dk-space-6)",
            textDecoration: "none",
            color: "var(--dk-warning)",
          }}
        >
          <span style={{ fontSize: "var(--dk-text-lg)" }}>⚠</span>
          <span className="dk-meta" style={{ color: "var(--dk-warning)" }}>
            {stats.expiring_leases_30d} lease{stats.expiring_leases_30d !== 1 ? "s" : ""} expiring within 30 days — click to review
          </span>
        </Link>
      )}

      {/* Portfolio Health Score */}
      {health && (
        <div
          style={{
            backgroundColor: "var(--dk-bg)",
            borderRadius: "var(--dk-radius-lg)",
            boxShadow: "var(--dk-shadow-sm)",
            padding: "var(--dk-space-6)",
            marginBottom: "var(--dk-space-6)",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "var(--dk-space-6)",
            alignItems: "start",
          }}
        >
          {/* Score gauge */}
          <div style={{ textAlign: "center", minWidth: "120px" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: `8px solid ${GRADE_COLOR[health.grade] || "var(--dk-brand)"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--dk-space-2)",
              }}
            >
              <span style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-2xl)", fontWeight: "var(--dk-weight-bold)", color: "var(--dk-fg)", lineHeight: 1 }}>
                {health.score}
              </span>
              <span className="dk-caption" style={{ color: "var(--dk-fg-2)" }}>/ 100</span>
            </div>
            <span style={{ fontFamily: "var(--dk-font-display)", fontWeight: "var(--dk-weight-bold)", fontSize: "var(--dk-text-xl)", color: GRADE_COLOR[health.grade] }}>
              Grade {health.grade}
            </span>
            <p className="dk-caption" style={{ color: "var(--dk-fg-2)", marginTop: "var(--dk-space-1)" }}>Portfolio Health</p>
          </div>

          <div>
            <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-2)" }}>AI Summary</p>
            <p className="dk-body" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-4)" }}>{health.ai_summary}</p>

            {/* Score breakdown bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-2)" }}>
              {health.breakdown.map((b) => (
                <div key={b.component}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--dk-space-1)" }}>
                    <span className="dk-caption" style={{ color: "var(--dk-fg-2)" }}>{b.component}</span>
                    <span className="dk-caption" style={{ color: "var(--dk-fg)" }}>{b.score}/100</span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "var(--dk-bg-muted)", borderRadius: "3px" }}>
                    <div style={{ height: "100%", width: `${b.score}%`, backgroundColor: b.score >= 75 ? "var(--dk-success)" : b.score >= 50 ? "var(--dk-warning)" : "var(--dk-danger)", borderRadius: "3px", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            {health.top_risks.length > 0 && (
              <div style={{ marginTop: "var(--dk-space-4)" }}>
                <p className="dk-caption" style={{ color: "var(--dk-warning)", marginBottom: "var(--dk-space-2)" }}>⚠ Top Risks</p>
                <ul style={{ margin: 0, padding: "0 0 0 var(--dk-space-4)", display: "flex", flexDirection: "column", gap: "var(--dk-space-1)" }}>
                  {health.top_risks.map((r) => (
                    <li key={r} className="dk-caption" style={{ color: "var(--dk-fg-2)" }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--dk-space-4)",
        }}
      >
        <StatCard label="Total Properties" value={stats.total_properties} />
        <StatCard label="Occupied" value={stats.occupied} />
        <StatCard label="Vacant" value={stats.vacant} />
        <StatCard label="Open Maintenance" value={stats.open_maintenance} />
        <StatCard
          label="Leases Expiring (30d)"
          value={stats.expiring_leases_30d}
          sub={stats.expiring_leases_30d > 0 ? "Action required" : "All good"}
        />
        <StatCard
          label="Rent Due / Late"
          value={stats.rent_due}
          sub="Pending or late payments"
        />
      </div>

      <div style={{ marginTop: "var(--dk-space-6)", display: "flex", gap: "var(--dk-space-3)", flexWrap: "wrap" }}>
        <Link href="/ai-query" style={{ backgroundColor: "var(--dk-brand)", color: "#fff", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-3) var(--dk-space-5)", textDecoration: "none", fontFamily: "var(--dk-font-display)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)" }}>
          AI Query Interface →
        </Link>
        <Link href="/import" style={{ backgroundColor: "var(--dk-bg)", color: "var(--dk-brand)", border: "1px solid var(--dk-brand)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-3) var(--dk-space-5)", textDecoration: "none", fontFamily: "var(--dk-font-display)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)" }}>
          Import Portfolio
        </Link>
        <Link href="/billing" style={{ backgroundColor: "var(--dk-bg)", color: "var(--dk-fg-2)", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-3) var(--dk-space-5)", textDecoration: "none", fontFamily: "var(--dk-font-display)", fontWeight: "var(--dk-weight-semibold)", fontSize: "var(--dk-text-sm)" }}>
          View Plans
        </Link>
      </div>
    </main>
  );
}
