const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function _authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("dclaw_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ..._authHeader(), ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  return response.json();
}

// ── Core types ─────────────────────────────────────────────────────────────

export type PropertyType = "house" | "apartment" | "condo" | "commercial" | "land";
export type PropertyStatus = "available" | "rented" | "sold" | "pending";
export type Priority = "low" | "medium" | "high" | "emergency";
export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "closed";
export type PaymentStatus = "pending" | "paid" | "partial" | "late";
export type PaymentMethod = "bank_transfer" | "check" | "cash" | "other";
export type LeaseEventType = "created" | "renewed" | "terminated" | "extended";
export type ExpenseCategory = "mortgage" | "tax" | "insurance" | "maintenance" | "utilities" | "management" | "other";
export type VendorSpecialty = "plumbing" | "electrical" | "hvac" | "general" | "landscaping" | "roofing";
export type DocumentCategory = "lease" | "inspection" | "insurance" | "photo" | "other";
export type CommunicationType = "call" | "email" | "notice" | "note" | "visit";
export type CommunicationDirection = "inbound" | "outbound";

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
  ai_description?: string;
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
  income?: number;
  prior_eviction?: boolean;
  screening_score?: number;
  screening_tier?: string;
  screening_notes?: string;
  screened_at?: string;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id?: string;
  title: string;
  description: string;
  priority: Priority;
  status: MaintenanceStatus;
  vendor_id?: string;
  assigned_at?: string;
  resolved_at?: string;
  vendor_rating?: number;
}

export interface RentPayment {
  id: string;
  tenant_id: string;
  property_id: string;
  amount: number;
  paid_amount?: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  late_fee?: number;
  notes?: string;
  created_at: string;
}

export interface LeaseEvent {
  id: string;
  tenant_id: string;
  event_type: LeaseEventType;
  effective_date: string;
  rent_amount?: number;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  property_id: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description?: string;
  recurring: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  specialty: VendorSpecialty;
  phone?: string;
  email?: string;
  rating?: number;
  notes?: string;
}

export interface Document {
  id: string;
  property_id: string;
  tenant_id?: string;
  name: string;
  file_key: string;
  file_size?: number;
  mime_type?: string;
  category: DocumentCategory;
  uploaded_at: string;
}

export interface CommunicationLog {
  id: string;
  tenant_id: string;
  property_id?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  summary: string;
  created_by?: string;
  created_at: string;
}

export interface DashboardStats {
  total_properties: number;
  occupied: number;
  vacant: number;
  open_maintenance: number;
  expiring_leases_30d: number;
  rent_due: number;
}

export interface RentRollRow {
  tenant_id: string;
  tenant_name: string;
  property_address?: string;
  lease_start?: string;
  lease_end?: string;
  monthly_rent?: number;
  payment_status: string;
  ytd_collected: number;
  ytd_expected: number;
  variance: number;
}

export interface ExpiringLease {
  tenant_id: string;
  name: string;
  email: string;
  property_id?: string;
  lease_end?: string;
  days_remaining?: number;
  rent_amount?: number;
}

export interface PropertyFinancials {
  property_id: string;
  year: number;
  gross_rent_income: number;
  expenses_by_category: Record<string, number>;
  total_expenses: number;
  noi: number;
  cap_rate: number;
  occupancy_rate: number;
  property_value: number;
}

export interface OccupancyReport {
  period_start: string;
  period_end: string;
  portfolio_occupancy_rate: number;
  total_vacancy_cost: number;
  properties: {
    property_id: string;
    property_title: string;
    property_address: string;
    status: string;
    last_moveout?: string;
    vacancy_days: number;
    vacancy_cost: number;
    current_tenant?: string;
  }[];
}

// ── Health ──────────────────────────────────────────────────────────────────
export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  return fetchJson<DashboardStats>("/api/v1/dashboard/stats");
}

// ── Properties ──────────────────────────────────────────────────────────────
export async function getProperties(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<Property[]>(`/api/v1/properties/${query}`);
}
export async function getProperty(id: string) {
  return fetchJson<Property>(`/api/v1/properties/${id}`);
}
export async function createProperty(data: Omit<Property, "id">) {
  return fetchJson<Property>("/api/v1/properties/", { method: "POST", body: JSON.stringify(data) });
}
export async function updateProperty(id: string, data: Partial<Omit<Property, "id">>) {
  return fetchJson<Property>(`/api/v1/properties/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deleteProperty(id: string) {
  return fetch(`${API_BASE}/api/v1/properties/${id}`, { method: "DELETE" });
}
export async function generatePropertyDescription(id: string) {
  return fetchJson<{ ai_description: string }>(`/api/v1/properties/${id}/generate-description`, { method: "POST" });
}
export async function getPropertyComps(id: string) {
  return fetchJson<{ comps: Property[]; market_avg_price?: number; market_diff_pct?: number }>(`/api/v1/properties/${id}/comps`);
}

// ── Tenants ─────────────────────────────────────────────────────────────────
export async function getTenants(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<Tenant[]>(`/api/v1/tenants/${query}`);
}
export async function getTenant(id: string) {
  return fetchJson<Tenant>(`/api/v1/tenants/${id}`);
}
export async function createTenant(data: Omit<Tenant, "id">) {
  return fetchJson<Tenant>("/api/v1/tenants/", { method: "POST", body: JSON.stringify(data) });
}
export async function updateTenant(id: string, data: Partial<Omit<Tenant, "id">>) {
  return fetchJson<Tenant>(`/api/v1/tenants/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deleteTenant(id: string) {
  return fetch(`${API_BASE}/api/v1/tenants/${id}`, { method: "DELETE" });
}
export async function screenTenant(id: string) {
  return fetchJson<{ score: number; tier: string; flags: string[]; recommendation: string }>(
    `/api/v1/tenants/${id}/screen`, { method: "POST" }
  );
}
export async function getTenantCommunications(id: string) {
  return fetchJson<CommunicationLog[]>(`/api/v1/tenants/${id}/communications`);
}
export async function createCommunication(tenantId: string, data: Omit<CommunicationLog, "id" | "tenant_id" | "property_id" | "created_at">) {
  return fetchJson<CommunicationLog>(`/api/v1/tenants/${tenantId}/communications`, {
    method: "POST", body: JSON.stringify(data),
  });
}

// ── Maintenance ─────────────────────────────────────────────────────────────
export async function getMaintenanceRequests(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<MaintenanceRequest[]>(`/api/v1/maintenance/${query}`);
}
export async function getMaintenanceRequest(id: string) {
  return fetchJson<MaintenanceRequest>(`/api/v1/maintenance/${id}`);
}
export async function createMaintenanceRequest(data: Omit<MaintenanceRequest, "id">) {
  return fetchJson<MaintenanceRequest>("/api/v1/maintenance/", { method: "POST", body: JSON.stringify(data) });
}
export async function updateMaintenanceRequest(id: string, data: Partial<Omit<MaintenanceRequest, "id">>) {
  return fetchJson<MaintenanceRequest>(`/api/v1/maintenance/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deleteMaintenanceRequest(id: string) {
  return fetch(`${API_BASE}/api/v1/maintenance/${id}`, { method: "DELETE" });
}
export async function assignVendor(requestId: string, vendorId: string) {
  return fetchJson<MaintenanceRequest>(`/api/v1/maintenance/${requestId}/assign?vendor_id=${vendorId}`, { method: "POST" });
}
export async function resolveRequest(requestId: string, vendorRating?: number) {
  const qs = vendorRating ? `?vendor_rating=${vendorRating}` : "";
  return fetchJson<MaintenanceRequest>(`/api/v1/maintenance/${requestId}/resolve${qs}`, { method: "POST" });
}
export async function suggestVendor(requestId: string) {
  return fetchJson<{ detected_specialty: string; suggestions: { vendor_id: string; name: string; specialty: string; rating?: number; rationale: string }[] }>(
    `/api/v1/maintenance/${requestId}/suggest-vendor`
  );
}

// ── Payments ────────────────────────────────────────────────────────────────
export async function getPayments(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<RentPayment[]>(`/api/v1/payments/${query}`);
}
export async function createPayment(data: Omit<RentPayment, "id" | "created_at">) {
  return fetchJson<RentPayment>("/api/v1/payments/", { method: "POST", body: JSON.stringify(data) });
}
export async function updatePayment(id: string, data: Partial<RentPayment>) {
  return fetchJson<RentPayment>(`/api/v1/payments/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function applyLateFee(id: string) {
  return fetchJson<RentPayment>(`/api/v1/payments/${id}/apply-late-fee`, { method: "POST" });
}

// ── Leases ──────────────────────────────────────────────────────────────────
export async function getExpiringLeases(days = 30) {
  return fetchJson<ExpiringLease[]>(`/api/v1/leases/expiring?days=${days}`);
}
export async function renewLease(tenantId: string, data: { new_lease_end: string; new_rent_amount: number; notes?: string }) {
  return fetchJson<LeaseEvent>(`/api/v1/leases/${tenantId}/renew`, { method: "POST", body: JSON.stringify(data) });
}
export async function getLeaseHistory(tenantId: string) {
  return fetchJson<LeaseEvent[]>(`/api/v1/leases/${tenantId}/history`);
}

// ── Vendors ─────────────────────────────────────────────────────────────────
export async function getVendors(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<Vendor[]>(`/api/v1/vendors/${query}`);
}
export async function createVendor(data: Omit<Vendor, "id">) {
  return fetchJson<Vendor>("/api/v1/vendors/", { method: "POST", body: JSON.stringify(data) });
}
export async function updateVendor(id: string, data: Partial<Omit<Vendor, "id">>) {
  return fetchJson<Vendor>(`/api/v1/vendors/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deleteVendor(id: string) {
  return fetch(`${API_BASE}/api/v1/vendors/${id}`, { method: "DELETE" });
}

// ── Documents ────────────────────────────────────────────────────────────────
export async function getDocuments(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<Document[]>(`/api/v1/documents/${query}`);
}
export async function uploadDocument(formData: FormData) {
  const url = `${API_BASE}/api/v1/documents/upload`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
  return res.json() as Promise<Document>;
}
export async function deleteDocument(id: string) {
  return fetch(`${API_BASE}/api/v1/documents/${id}`, { method: "DELETE" });
}
export function getDocumentDownloadUrl(id: string) {
  return `${API_BASE}/api/v1/documents/${id}/download`;
}

// ── Financials ───────────────────────────────────────────────────────────────
export async function getPropertyFinancials(propertyId: string, year?: number) {
  const qs = year ? `?year=${year}` : "";
  return fetchJson<PropertyFinancials>(`/api/v1/financials/properties/${propertyId}${qs}`);
}
export async function getPortfolioFinancials(year?: number) {
  const qs = year ? `?year=${year}` : "";
  return fetchJson<{ year: number; gross_rent_income: number; total_expenses: number; noi: number; cap_rate: number }>(`/api/v1/financials/portfolio${qs}`);
}
export async function getExpenses(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchJson<Expense[]>(`/api/v1/financials/expenses${query}`);
}
export async function createExpense(data: Omit<Expense, "id" | "created_at">) {
  return fetchJson<Expense>("/api/v1/financials/expenses", { method: "POST", body: JSON.stringify(data) });
}
export async function deleteExpense(id: string) {
  return fetch(`${API_BASE}/api/v1/financials/expenses/${id}`, { method: "DELETE" });
}

// ── Reports ──────────────────────────────────────────────────────────────────
export async function getRentRoll() {
  return fetchJson<{ year: number; generated_at: string; rows: RentRollRow[] }>("/api/v1/reports/rent-roll");
}
export async function getOccupancyReport(params?: { start?: string; end?: string }) {
  const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  return fetchJson<OccupancyReport>(`/api/v1/reports/occupancy${query}`);
}

// ── AI ───────────────────────────────────────────────────────────────────────
export interface HealthScore {
  score: number;
  grade: string;
  breakdown: { component: string; score: number; weight: number; insight: string }[];
  ai_summary: string;
  top_risks: string[];
  total_properties: number;
  occupied: number;
  computed_at: string;
}
export async function getHealthScore() {
  return fetchJson<HealthScore>("/api/v1/ai/health-score");
}
export async function runNLQuery(question: string) {
  return fetchJson<{ query_interpreted: string; results: unknown[]; result_count: number; suggested_followups: string[] }>(
    "/api/v1/ai/query",
    { method: "POST", body: JSON.stringify({ question }) }
  );
}
export async function abstractLease(docId: string) {
  return fetchJson<Record<string, unknown>>(`/api/v1/documents/${docId}/abstract-lease`, { method: "POST" });
}
export async function autoDispatch(requestId: string) {
  return fetchJson<{ dispatched: boolean; vendor_name?: string; rationale?: string }>(
    "/api/v1/ai/dispatch",
    { method: "POST", body: JSON.stringify({ request_id: requestId }) }
  );
}

// ── Billing ──────────────────────────────────────────────────────────────────
export async function getBillingStatus() {
  return fetchJson<{ plan_tier: string; unit_limit: number; monthly_price: number }>("/api/v1/billing/status");
}
export async function subscribePlan(plan: string) {
  return fetchJson<{ status: string; plan: string }>("/api/v1/billing/subscribe", { method: "POST", body: JSON.stringify({ plan }) });
}
