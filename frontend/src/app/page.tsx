"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats, type DashboardStats } from "@/lib/api";

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_properties: 0,
    occupied: 0,
    vacant: 0,
    open_maintenance: 0,
    expiring_leases_30d: 0,
    rent_due: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message));
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
    </main>
  );
}
