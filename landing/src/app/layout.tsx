import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw Real Estate — AI-Native Property Management",
  description:
    "The AI-native property management platform. Collect rent, screen tenants, manage maintenance, and get AI-powered portfolio insights — all in one place. Built for modern property managers.",
  keywords: "property management software, landlord software, rent collection, tenant screening, AI property management",
  openGraph: {
    title: "DClaw Real Estate — AI-Native Property Management",
    description: "Collect rent, screen tenants, and manage maintenance with AI. Built for property managers who want to grow.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
