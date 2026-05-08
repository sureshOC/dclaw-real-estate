const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  return response.json();
}

export type PropertyType = "house" | "apartment" | "condo" | "commercial" | "land";
export type PropertyStatus = "available" | "rented" | "sold" | "pending";

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  property_type: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  status: PropertyStatus;
  description?: string;
}

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  property_id?: string;
  lease_start?: string;
  lease_end?: string;
  rent_amount?: number;
}

export type Priority = "low" | "medium" | "high" | "emergency";
export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "closed";

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id?: string;
  title: string;
  description: string;
  priority: Priority;
  status: MaintenanceStatus;
}

export interface DashboardStats {
  total_properties: number;
  occupied: number;
  vacant: number;
  open_maintenance: number;
}

// Health
export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// Properties
export async function getProperties(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<Property[]>(`/api/v1/properties/${query}`);
}

export async function getProperty(id: string) {
  return fetchJson<Property>(`/api/v1/properties/${id}`);
}

export async function createProperty(data: Omit<Property, "id">) {
  return fetchJson<Property>("/api/v1/properties/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProperty(id: string, data: Partial<Omit<Property, "id">>) {
  return fetchJson<Property>(`/api/v1/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(id: string) {
  return fetch(`/api/v1/properties/${id}`, { method: "DELETE" });
}

// Tenants
export async function getTenants(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<Tenant[]>(`/api/v1/tenants/${query}`);
}

export async function getTenant(id: string) {
  return fetchJson<Tenant>(`/api/v1/tenants/${id}`);
}

export async function createTenant(data: Omit<Tenant, "id">) {
  return fetchJson<Tenant>("/api/v1/tenants/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTenant(id: string, data: Partial<Omit<Tenant, "id">>) {
  return fetchJson<Tenant>(`/api/v1/tenants/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTenant(id: string) {
  return fetch(`/api/v1/tenants/${id}`, { method: "DELETE" });
}

// Maintenance
export async function getMaintenanceRequests(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<MaintenanceRequest[]>(`/api/v1/maintenance/${query}`);
}

export async function getMaintenanceRequest(id: string) {
  return fetchJson<MaintenanceRequest>(`/api/v1/maintenance/${id}`);
}

export async function createMaintenanceRequest(data: Omit<MaintenanceRequest, "id">) {
  return fetchJson<MaintenanceRequest>("/api/v1/maintenance/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMaintenanceRequest(id: string, data: Partial<Omit<MaintenanceRequest, "id">>) {
  return fetchJson<MaintenanceRequest>(`/api/v1/maintenance/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMaintenanceRequest(id: string) {
  return fetch(`/api/v1/maintenance/${id}`, { method: "DELETE" });
}

// Dashboard
export async function getDashboardStats() {
  return fetchJson<DashboardStats>("/api/v1/dashboard/stats");
}
