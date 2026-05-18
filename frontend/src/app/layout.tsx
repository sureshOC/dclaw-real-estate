import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import ConditionalContainer from "@/components/ConditionalContainer";
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
        <ConditionalContainer>{children}</ConditionalContainer>
      </body>
    </html>
  );
}
