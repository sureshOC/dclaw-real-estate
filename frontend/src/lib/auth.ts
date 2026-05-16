const TOKEN_KEY = "dclaw_token";
const USER_KEY = "dclaw_user";

export interface AuthUser {
  id: string;
  org_id: string;
  email: string;
  role: "owner" | "manager" | "tech" | "accountant";
  first_name: string;
  last_name: string;
  org_name: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  const { access_token } = await res.json();
  setToken(access_token);

  const meRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const user = await meRes.json();
  setUser(user);
  return user;
}

export async function register(
  org_name: string,
  first_name: string,
  last_name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ org_name, first_name, last_name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Registration failed");
  }
  const { access_token } = await res.json();
  setToken(access_token);

  const meRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const user = await meRes.json();
  setUser(user);
  return user;
}

export function logout(): void {
  clearAuth();
  window.location.href = "/login";
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
