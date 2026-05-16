"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { getTenants, getProperties, type Tenant, type Property } from "@/lib/api";

const TIER_COLOR: Record<string, string> = {
  low: "var(--dk-success)",
  medium: "var(--dk-warning)",
  high: "var(--dk-danger)",
};

function ScoreBadge({ score, tier }: { score?: number; tier?: string }) {
  if (score == null) return <span style={{ color: "var(--dk-fg-muted)" }} className="dk-caption">—</span>;
  const color = TIER_COLOR[tier ?? "medium"] ?? "var(--dk-fg-2)";
  return (
    <span
      style={{
        color,
        fontWeight: "var(--dk-weight-bold)",
        fontSize: "var(--dk-text-sm)",
      }}
    >
      {score}
    </span>
  );
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getTenants(), getProperties()])
      .then(([t, p]) => { setTenants(t); setProperties(p); })
      .catch((e) => setError(e.message));
  }, []);

  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  return (
    <main>
      <h1 className="dk-h3" style={{ marginBottom: "var(--dk-space-6)" }}>Tenants</h1>

      {error && <p style={{ color: "var(--dk-danger)" }} className="dk-meta">Error: {error}</p>}

      <div
        style={{
          backgroundColor: "var(--dk-bg)",
          borderRadius: "var(--dk-radius-lg)",
          boxShadow: "var(--dk-shadow-sm)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Lease End</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center", padding: "var(--dk-space-8)" }} className="dk-meta">
                  No tenants found
                </TableCell>
              </TableRow>
            )}
            {tenants.map((t) => {
              const prop = t.property_id ? propertyMap.get(t.property_id) : null;
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/tenants/${t.id}`}
                      style={{ color: "var(--dk-brand)", fontWeight: "var(--dk-weight-semibold)", textDecoration: "none" }}
                    >
                      {t.first_name} {t.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="dk-meta">{t.email}</TableCell>
                  <TableCell className="dk-meta">{prop ? prop.title : "—"}</TableCell>
                  <TableCell className="dk-meta">{t.lease_end || "—"}</TableCell>
                  <TableCell className="dk-meta">
                    {t.rent_amount ? `$${t.rent_amount.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={t.screening_score} tier={t.screening_tier} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
