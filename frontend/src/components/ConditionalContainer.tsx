"use client";

import { usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/register", "/portal"];

export default function ConditionalContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isAuth) return <>{children}</>;

  return (
    <div
      style={{
        maxWidth: "var(--dk-container-max)",
        margin: "0 auto",
        padding: "var(--dk-space-8) var(--dk-container-pad)",
      }}
    >
      {children}
    </div>
  );
}
