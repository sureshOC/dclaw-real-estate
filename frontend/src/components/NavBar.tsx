"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/tenants", label: "Tenants" },
  { href: "/leases", label: "Leases" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/vendors", label: "Vendors" },
  { href: "/reports/rent-roll", label: "Rent Roll" },
  { href: "/reports/occupancy", label: "Occupancy" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        backgroundColor: "var(--dk-bg)",
        borderBottom: "1px solid var(--dk-border)",
        boxShadow: "var(--dk-shadow-xs)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--dk-container-max)",
          margin: "0 auto",
          padding: "0 var(--dk-container-pad)",
          display: "flex",
          alignItems: "center",
          gap: "var(--dk-space-1)",
          height: "56px",
          overflowX: "auto",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--dk-font-display)",
            fontWeight: "var(--dk-weight-bold)",
            color: "var(--dk-brand)",
            fontSize: "var(--dk-text-lg)",
            marginRight: "var(--dk-space-6)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          DClaw
        </Link>

        {NAV_LINKS.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="dk-meta"
              style={{
                padding: "var(--dk-space-2) var(--dk-space-3)",
                borderRadius: "var(--dk-radius-md)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                backgroundColor: active ? "var(--dk-brand-soft)" : "transparent",
                color: active ? "var(--dk-brand)" : "var(--dk-fg-2)",
                fontWeight: active
                  ? "var(--dk-weight-semibold)"
                  : "var(--dk-weight-medium)",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
