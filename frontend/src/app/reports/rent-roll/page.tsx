"use client";

import { useEffect, useState } from "react";
import { getRentRoll, type RentRollRow } from "@/lib/api";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  paid:    { bg: "var(--dk-success-bg)", color: "var(--dk-success)", label: "Paid" },
  partial: { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)", label: "Partial" },
  late:    { bg: "var(--dk-danger-bg)",  color: "var(--dk-danger)",  label: "Late" },
  pending: { bg: "var(--dk-gray-100)",   color: "var(--dk-gray-500)", label: "Pending" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        borderRadius: "var(--dk-radius-pill)",
        padding: "2px 10px",
        fontWeight: "var(--dk-weight-semibold)",
        fontSize: "var(--dk-text-xs)",
        display: "inline-block",
      }}
    >
      {s.label}
    </span>
  );
}

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function exportCsv(rows: RentRollRow[], year: number) {
  const headers = ["Tenant", "Property", "Lease Start", "Lease End", "Monthly Rent", "Status", "YTD Collected", "YTD Expected", "Variance"];
  const lines = rows.map((r) =>
    [
      r.tenant_name,
      r.property_address ?? "",
      r.lease_start ?? "",
      r.lease_end ?? "",
      r.monthly_rent ?? "",
      r.payment_status,
      r.ytd_collected,
      r.ytd_expected,
      r.variance,
    ].join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rent-roll-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RentRollPage() {
  const [data, setData] = useState<{ year: number; generated_at: string; rows: RentRollRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRentRoll()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--dk-space-6)" }}>
        <div>
          <p className="dk-eyebrow">Reports</p>
          <h1 className="dk-h3">Rent Roll {data ? `— ${data.year}` : ""}</h1>
          {data && (
            <p className="dk-meta" style={{ marginTop: "var(--dk-space-1)" }}>
              Generated {new Date(data.generated_at).toLocaleDateString()}
            </p>
          )}
        </div>
        {data && (
          <button
            onClick={() => exportCsv(data.rows, data.year)}
            style={{
              backgroundColor: "var(--dk-brand)",
              color: "var(--dk-white)",
              border: "none",
              borderRadius: "var(--dk-radius-pill)",
              padding: "var(--dk-space-3) var(--dk-space-6)",
              fontWeight: "var(--dk-weight-semibold)",
              fontSize: "var(--dk-text-sm)",
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
        )}
      </div>

      {loading && <p className="dk-meta">Loading rent roll…</p>}
      {error && (
        <p style={{ color: "var(--dk-danger)" }} className="dk-meta">
          Error: {error}
        </p>
      )}

      {data && (
        <div
          style={{
            backgroundColor: "var(--dk-bg)",
            borderRadius: "var(--dk-radius-lg)",
            boxShadow: "var(--dk-shadow-sm)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, backgroundColor: "var(--dk-bg)", zIndex: 1 }}>
                  {["Property", "Tenant", "Monthly Rent", "Status", "YTD Collected", "YTD Expected", "Variance"].map((h) => (
                    <th
                      key={h}
                      className="dk-meta"
                      style={{
                        textAlign: "left",
                        padding: "var(--dk-space-4) var(--dk-space-5)",
                        borderBottom: "2px solid var(--dk-border)",
                        color: "var(--dk-fg-2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "var(--dk-space-8)", textAlign: "center" }} className="dk-meta">
                      No tenants found
                    </td>
                  </tr>
                )}
                {data.rows.map((row) => (
                  <tr
                    key={row.tenant_id}
                    style={{ borderBottom: "1px solid var(--dk-border)" }}
                  >
                    <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-meta">
                      {row.property_address ?? "—"}
                    </td>
                    <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-body">
                      {row.tenant_name}
                    </td>
                    <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-body">
                      {row.monthly_rent ? fmt(row.monthly_rent) : "—"}
                    </td>
                    <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }}>
                      <StatusBadge status={row.payment_status} />
                    </td>
                    <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-body">
                      {fmt(row.ytd_collected)}
                    </td>
                    <td style={{ padding: "var(--dk-space-4) var(--dk-space-5)" }} className="dk-body">
                      {fmt(row.ytd_expected)}
                    </td>
                    <td
                      style={{
                        padding: "var(--dk-space-4) var(--dk-space-5)",
                        color: row.variance >= 0 ? "var(--dk-success)" : "var(--dk-danger)",
                        fontWeight: "var(--dk-weight-semibold)",
                      }}
                      className="dk-body"
                    >
                      {row.variance >= 0 ? "+" : ""}
                      {fmt(row.variance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
