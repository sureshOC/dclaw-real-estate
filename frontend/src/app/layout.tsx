import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw Real Estate",
  description: "DClaw vertical SaaS — property management platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{ backgroundColor: "var(--dk-bg-muted)", color: "var(--dk-fg-1)", minHeight: "100vh" }}
      >
        <NavBar />
        <div
          style={{
            maxWidth: "var(--dk-container-max)",
            margin: "0 auto",
            padding: "var(--dk-space-8) var(--dk-container-pad)",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
