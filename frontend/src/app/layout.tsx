import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw Real Estate",
  description: "DClaw vertical SaaS application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <nav className="border-b px-6 py-4 flex gap-6 bg-slate-50">
          <Link href="/" className="font-semibold text-slate-900">
            Dashboard
          </Link>
          <Link href="/properties" className="text-slate-600 hover:text-slate-900">
            Properties
          </Link>
          <Link href="/tenants" className="text-slate-600 hover:text-slate-900">
            Tenants
          </Link>
          <Link href="/maintenance" className="text-slate-600 hover:text-slate-900">
            Maintenance
          </Link>
        </nav>
        <div className="p-8">{children}</div>
      </body>
    </html>
  );
}
