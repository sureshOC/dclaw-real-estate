# DClaw Real Estate — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [ ] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed (required for Next.js TypeScript builds)
- [ ] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [ ] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [ ] `globals.css` uses DKube design tokens (Poppins, purple brand, light mode only)

---

## v1.0 Feature Inventory (Current)

- [ ] Property CRUD (title, address, city, state, zip, price, type, bedrooms, bathrooms, sqft, status, description)
- [ ] Tenant CRUD (name, email, phone, property_id FK, lease dates, rent_amount)
- [ ] Maintenance Request CRUD (property_id, tenant_id, title, description, priority, status)
- [ ] Dashboard — summary cards (total properties, occupied, vacant, open maintenance)
- [ ] Properties page — card grid, type/status/price filters, Add Property form
- [ ] Property Detail — info, tenant info, maintenance history
- [ ] Tenants page — table view with lease dates and rent
- [ ] Maintenance page — table view, priority color-coding, status filter
- [ ] Real backend CRUD (PostgreSQL — no mocks)
- [ ] Docker + Helm deployment
- [ ] Alembic migrations
- [ ] Backend tests (pytest-asyncio)

---

## v1.2 Roadmap

> Analysis basis: YC-backed proptech companies (Belong W19, Doorstead W19, Matera W19, Agora W22, Loft S18, Stessa, Entera) + 2025-2026 property management SaaS trends. Features ordered by operator pain point severity and YC product-market fit signals.

---

### P0 — Must Have

#### 1. Rent Roll Dashboard
**Description:** Portfolio-level financial summary — the single most-requested report by landlords and property managers. Every professional PM tool gates on this. Belongs pattern + Stessa core.
- **Backend:**
  - `GET /api/v1/reports/rent-roll` — returns per-property rows: address, tenant name, lease start/end, monthly rent, payment status (current month), YTD collected, YTD expected, variance
  - New `RentPayment` model: `id, tenant_id, property_id, amount, due_date, paid_date, status (pending/paid/partial/late), late_fee`
  - Migration: `alembic revision --autogenerate -m "add_rent_payment"`
  - Repository: `app/repositories/rent_payment.py`
  - Tests: cover rent roll aggregation logic
- **Frontend:**
  - `/reports/rent-roll` page — sticky header table: property | tenant | monthly rent | status badge | YTD collected | YTD expected | variance
  - Status badges: `paid` (dk-success), `partial` (dk-warning), `late` (dk-danger), `pending` (dk-gray-400)
  - Export to CSV button (browser-side)
- **Files:** `backend/app/models/rent_payment.py`, `backend/app/api/v1/reports.py`, `frontend/src/app/reports/rent-roll/page.tsx`

#### 2. Rent Payment Tracker
**Description:** Mark rent as paid/partial/late per tenant per month. Track payment history timeline. Calculate and apply late fees. Core cash-flow visibility — #1 landlord pain point.
- **Backend:**
  - `POST /api/v1/payments` — create payment record
  - `GET /api/v1/payments?tenant_id=&month=` — list payments with filters
  - `PUT /api/v1/payments/{id}` — update status, paid_amount, paid_date
  - `POST /api/v1/payments/{id}/apply-late-fee` — compute and attach late fee (configurable grace period, flat fee or % of rent)
  - Repository: full CRUD in `app/repositories/rent_payment.py`
  - Tests: payment creation, late fee logic, partial payment scenarios
- **Frontend:**
  - Tenant detail page: payment history timeline (month → status → amount paid → due → late fee)
  - "Record Payment" dialog: amount, date, method (bank transfer / check / cash / other), notes
  - Dashboard: "Rent Due This Month" card with count of pending/late
- **Files:** `backend/app/api/v1/payments.py`, `frontend/src/app/tenants/[id]/page.tsx`

#### 3. Lease Lifecycle Manager
**Description:** Track lease status with automated expiry alerts (30/60/90-day warnings). Flag leases expiring soon. Renewal workflow. Doorstead and Belong both built this as their second feature after listings. Prevents revenue leakage from overlooked renewals.
- **Backend:**
  - `GET /api/v1/leases/expiring?days=30` — tenants whose `lease_end` is within N days
  - `POST /api/v1/leases/{tenant_id}/renew` — extend lease: new `lease_end`, new `rent_amount`, log change in `LeaseEvent`
  - New `LeaseEvent` model: `id, tenant_id, event_type (created/renewed/terminated/extended), effective_date, rent_amount, notes`
  - Migration for `LeaseEvent`
  - Background scheduler hook (APScheduler or FastAPI lifespan task): daily check, set `Tenant.lease_status` computed field
  - Tests: expiry logic, renewal workflow
- **Frontend:**
  - Dashboard alert banner: "3 leases expiring in 30 days" with link
  - Leases page (`/leases`): table sorted by `lease_end` ASC, color-coded rows (red < 30 days, yellow 30–60, green > 60)
  - "Renew Lease" dialog: new end date, new rent, notes → POST to renew endpoint
  - Lease history accordion on tenant detail page
- **Files:** `backend/app/models/lease_event.py`, `backend/app/api/v1/leases.py`, `frontend/src/app/leases/page.tsx`

#### 4. AI Tenant Screening Score
**Description:** AI-powered tenant scoring on application intake. Income-to-rent ratio check, rental history flags, risk tier. Belong and Doorstead built proprietary scoring as their moat. YC prizes defensible data loops.
- **Backend:**
  - `POST /api/v1/tenants/{id}/screen` — runs scoring logic, returns `score (0–100)`, `tier (low/medium/high risk)`, `flags[]`, `recommendation`
  - Scoring logic (service layer `app/services/tenant_screening.py`):
    - Income-to-rent ratio (income / rent_amount, threshold: ≥ 3x = green)
    - Lease history gap detection (gaps > 30 days = flag)
    - Prior eviction flag (boolean input)
    - Debt-to-income ratio if provided
  - Claude API call (streaming disabled for latency): prompt-engineer a structured screening report from tenant attributes
  - Response cached on `Tenant` model: `screening_score int`, `screening_tier str`, `screening_notes text`, `screened_at datetime`
  - Tests: scoring thresholds, Claude mock response parsing
- **Frontend:**
  - Tenant list: screening score badge column (color-coded 0–100)
  - Tenant detail: "Run Screening" button → loading state → score card with tier badge, flags list, AI recommendation
  - Add Tenant form: optional income field, prior eviction checkbox
- **Files:** `backend/app/services/tenant_screening.py`, `backend/app/api/v1/tenants.py`, `frontend/src/app/tenants/[id]/page.tsx`

---

### P1 — Should Have

#### 5. Financial Analytics — NOI & Cap Rate
**Description:** Per-property profit & loss: rental income vs. operating expenses, Net Operating Income (NOI), cap rate. Stessa's entire moat. Investors and banks require this for portfolio financing decisions.
- **Backend:**
  - New `Expense` model: `id, property_id, category (mortgage/tax/insurance/maintenance/utilities/management/other), amount, date, description, recurring bool`
  - `GET /api/v1/properties/{id}/financials?year=` — returns: gross_rent_income, total_expenses (by category), NOI (income − opex), cap_rate (NOI / property_value × 100), occupancy_rate
  - `GET /api/v1/reports/portfolio-financials` — aggregated across all properties
  - Migration for `Expense`
  - Repository + tests
- **Frontend:**
  - Property detail: "Financials" tab — income vs. expenses stacked bar chart (recharts), NOI card, cap rate card
  - `/reports/financials` page — portfolio-level P&L table + summary cards
  - Add/Edit Expense dialog on property detail
- **Files:** `backend/app/models/expense.py`, `backend/app/api/v1/financials.py`, `frontend/src/app/properties/[id]/financials/page.tsx`

#### 6. Maintenance Vendor Management
**Description:** Vendor directory with specialty tagging. Assign maintenance requests to vendors. Track resolution time and vendor rating. AI dispatch: auto-suggest best vendor by request category. Aldara (YC) built their entire product around this workflow.
- **Backend:**
  - New `Vendor` model: `id, name, specialty (plumbing/electrical/hvac/general/landscaping/roofing), phone, email, rating float, notes`
  - `MaintenanceRequest` gets `vendor_id FK`, `assigned_at datetime`, `resolved_at datetime`
  - `POST /api/v1/maintenance/{id}/assign` — assign vendor, set `assigned_at`
  - `POST /api/v1/maintenance/{id}/resolve` — mark resolved, set `resolved_at`, optionally rate vendor (1–5)
  - `GET /api/v1/vendors` / `POST /api/v1/vendors` / `PUT /api/v1/vendors/{id}` — vendor CRUD
  - `GET /api/v1/maintenance/{id}/suggest-vendor` — AI suggestion: match request category to vendor specialty + rating
  - Migration, repository, tests
- **Frontend:**
  - `/vendors` page — vendor table: name, specialty badge, rating stars, open requests count
  - Maintenance request detail: "Assign Vendor" dropdown (filtered by specialty), assignment history
  - "Suggest Vendor" button → AI picks top match with rationale
  - Vendor detail: performance metrics (avg resolution time, open count, avg rating)
- **Files:** `backend/app/models/vendor.py`, `backend/app/api/v1/vendors.py`, `frontend/src/app/vendors/page.tsx`

#### 7. AI Property Description Generator
**Description:** Generate compelling, SEO-friendly listing descriptions from property attributes using Claude API. Zillow and Opendoor both use AI copy. Agents spend 20+ minutes per listing on manual copy — this collapses that to seconds.
- **Backend:**
  - `POST /api/v1/properties/{id}/generate-description` — reads property attributes, calls Claude API with structured prompt, returns generated description
  - Prompt template: address, type, beds/baths, sqft, price, neighborhood, unique features → marketing-quality paragraph (2–3 sentences, professional tone)
  - Stores generated description back on `Property.description` (or a new `ai_description` field)
  - Tests: mock Claude response, verify field update
- **Frontend:**
  - Property edit form / property detail: "Generate with AI" button next to description field
  - Loading spinner → streamed text appears in description textarea
  - "Accept" / "Regenerate" / "Edit" actions
- **Files:** `backend/app/services/ai_description.py`, `backend/app/api/v1/properties.py`

#### 8. Document Vault
**Description:** Upload and store lease PDFs, inspection reports, insurance docs, addenda per property. Every professional PM tool has document storage. Critical for compliance and audit trails. Agora (YC W22) uses this as investor-facing document delivery.
- **Backend:**
  - New `Document` model: `id, property_id, tenant_id (optional), name, file_key, file_size, mime_type, category (lease/inspection/insurance/photo/other), uploaded_at`
  - `POST /api/v1/documents/upload` — multipart file upload, store to local `UPLOAD_DIR` (configurable via env), return `file_key`
  - `GET /api/v1/documents?property_id=&tenant_id=` — list documents
  - `GET /api/v1/documents/{id}/download` — stream file back with correct Content-Disposition
  - `DELETE /api/v1/documents/{id}` — remove record + file
  - Migration, repository, tests
- **Frontend:**
  - Property detail: "Documents" tab — file list with icon, name, size, category badge, upload date
  - Drag-and-drop upload zone (HTML5 FileReader + fetch multipart)
  - Tenant detail: lease documents section
  - Download button per document
- **Files:** `backend/app/models/document.py`, `backend/app/api/v1/documents.py`, `frontend/src/app/properties/[id]/documents/page.tsx`

#### 9. Portfolio Occupancy Analytics
**Description:** Vacancy rate, average vacancy duration, cost-of-vacancy per property and portfolio-wide. YC metrics obsession: quantify every leakage point. Investors need this for acquisition decisions.
- **Backend:**
  - `GET /api/v1/reports/occupancy?start=&end=` — returns per-property and portfolio: occupancy_rate %, avg_vacancy_days, vacancy_cost (days × daily_rent), current_status
  - Logic: scan `Tenant` lease date gaps + `Property.status` history to compute vacancy windows
  - New `PropertyStatusEvent` model (optional but recommended): log every status change with timestamp for accurate vacancy tracking
  - Tests: occupancy rate calculation, vacancy cost math
- **Frontend:**
  - `/reports/occupancy` page — summary KPI cards at top (portfolio occupancy %, total vacancy cost MTD)
  - Per-property table: property | status | last tenant move-out | vacancy days | vacancy cost | current tenant
  - Line chart: occupancy rate over time (recharts)
- **Files:** `backend/app/api/v1/reports.py`, `frontend/src/app/reports/occupancy/page.tsx`

#### 10. Tenant Communication Log
**Description:** Timestamped log of calls, emails, notices, and notes per tenant. Reduces he-said/she-said disputes. Standard feature in Buildium, AppFolio, and every PM tool landlords compare you to.
- **Backend:**
  - New `CommunicationLog` model: `id, tenant_id, property_id, type (call/email/notice/note/visit), direction (inbound/outbound), summary, created_by, created_at`
  - `GET /api/v1/tenants/{id}/communications` — list in reverse chronological order
  - `POST /api/v1/tenants/{id}/communications` — create entry
  - Repository + tests
- **Frontend:**
  - Tenant detail: "Activity" tab — vertical timeline (newest on top): icon per type, summary, timestamp, direction badge
  - "Log Interaction" button → dialog: type selector, direction, summary textarea, date (defaults to now)
- **Files:** `backend/app/models/communication_log.py`, `backend/app/api/v1/tenants.py`, `frontend/src/app/tenants/[id]/page.tsx`

---

### P2 — Could Have

#### 11. AI Lease Abstraction
**Description:** Upload a lease PDF, AI extracts key terms into structured fields: parties, rent, deposit, start/end, renewal clause, pet policy, late fee terms. Top 2025–2026 proptech trend — every major PM tool is racing to ship this.
- **Backend:**
  - `POST /api/v1/documents/{id}/abstract-lease` — reads uploaded PDF text (via `pypdf`), sends to Claude API with structured extraction prompt
  - Returns JSON: `{ tenant_name, landlord_name, rent_amount, deposit, lease_start, lease_end, notice_days, pet_policy, late_fee_clause, renewal_terms, key_clauses[] }`
  - Option to auto-populate `Tenant` fields from extracted data (with user confirmation)
  - Tests: mock PDF text, assert extraction fields populated
- **Frontend:**
  - Document vault: "Abstract Lease" button on PDF documents (category: lease)
  - Results panel: structured field display with edit capability before saving
  - "Apply to Tenant" button to pre-fill tenant form

#### 12. AI Maintenance Auto-Dispatch
**Description:** When a maintenance request is created, AI automatically selects the best available vendor based on request category, specialty match, and vendor rating — then sends notification. End-to-end automation without PM involvement. Aldara and Belong's core workflow.
- **Backend:**
  - `POST /api/v1/maintenance` — on create, trigger `auto_dispatch_service.suggest_and_assign(request_id)` if `auto_dispatch: bool` is enabled in settings
  - `DispatchLog` model: `request_id, vendor_id, dispatched_at, dispatch_method (auto/manual), rationale`
  - Settings: `GET/PUT /api/v1/settings` — toggle `auto_dispatch_enabled`, `dispatch_notify_vendor bool`
  - Tests: dispatch logic, vendor selection ranking

#### 13. Bulk CSV Import
**Description:** Import existing portfolios (properties + tenants) from CSV spreadsheets. Critical for onboarding enterprise landlords who manage in Excel. Reduces time-to-value from days to minutes.
- **Backend:**
  - `POST /api/v1/import/properties` — CSV upload, validate rows, upsert via repository, return import report (created/updated/failed counts + error rows)
  - `POST /api/v1/import/tenants` — same pattern for tenants, with property matching by address
  - Column mapping: flexible header detection (case-insensitive)
  - Tests: valid CSV, missing fields, duplicate detection
- **Frontend:**
  - `/import` page — step wizard: 1. Upload CSV 2. Preview + column mapping 3. Confirm + import 4. Results report
  - Download sample CSV templates

#### 14. Tenant Self-Service Portal
**Description:** Separate tenant-facing view (no admin access): pay rent (mark payment intent), submit maintenance request, view lease documents. Resident experience layer — what Belong, Doorstead, and every YC proptech company builds first for consumer NPS.
- **Backend:**
  - `POST /api/v1/tenant-portal/auth` — tenant login by email + lease code (no full auth system needed at this stage)
  - `GET /api/v1/tenant-portal/dashboard` — tenant's own: lease info, payment status, open maintenance requests
  - `POST /api/v1/tenant-portal/maintenance` — submit new request (limited fields)
  - `GET /api/v1/tenant-portal/documents` — tenant's own documents only
  - Tests: portal auth, data isolation (tenant can't see other tenants)
- **Frontend:**
  - `/portal` route — separate layout (no admin sidebar), mobile-first design
  - Screens: My Lease, Pay Rent (record intent + confirmation), Submit Issue, My Documents

#### 15. Market Comparables (Comps)
**Description:** Show similar properties' current rent/sale price within the same city. Helps landlords set competitive rents. Future-ready: plug into real market data APIs (ATTOM, RentRange, Zillow API) when scaling.
- **Backend:**
  - `GET /api/v1/properties/{id}/comps` — query Properties table for same city + property_type within ±20% sqft range, return sorted by price
  - Phase 2: integrate external market API (ATTOM Data or RentRange) behind feature flag
  - Tests: comp query logic, edge cases (no comps found)
- **Frontend:**
  - Property detail: "Market Comps" tab — comparison table: address | beds/baths | sqft | price | price/sqft | status
  - "Your price vs. market avg" callout card (above/below market %)

---

## Implementation Priority

1. **Rent Payment Tracker** (P0.2) — unblocks Rent Roll; immediate landlord value
2. **Rent Roll Dashboard** (P0.1) — core financial reporting; depends on payments
3. **Lease Lifecycle Manager** (P0.3) — revenue retention; standalone feature
4. **Financial Analytics — NOI** (P1.5) — investor-grade; depends on Expense model
5. **Portfolio Occupancy Analytics** (P1.9) — pairs with financials
6. **Maintenance Vendor Management** (P1.6) — extends existing maintenance model
7. **AI Tenant Screening Score** (P0.4) — AI moat; add after tenant model stable
8. **AI Property Description Generator** (P1.7) — quick AI win; standalone
9. **Document Vault** (P1.8) — file infra; unblocks AI Lease Abstraction
10. **Tenant Communication Log** (P1.10) — completes tenant detail page
11. **AI Lease Abstraction** (P2.11) — depends on Document Vault
12. **AI Maintenance Auto-Dispatch** (P2.12) — depends on Vendor Management
13. **Bulk CSV Import** (P2.13) — onboarding tool; ship when GTM-ready
14. **Tenant Self-Service Portal** (P2.14) — consumer layer; large scope
15. **Market Comparables** (P2.15) — nice-to-have; external API dependency

---

## Design Constraints (All Frontend Work)

Strictly use the DKube design system from `colors_and_type.css` and `globals.css`:

- **Font:** Poppins only (300–800 weights) — no system fonts in UI copy
- **Brand color:** `--dk-brand` (`#7660A8`) for all primary buttons, links, active states
- **Page background:** `--dk-bg-muted` (`#F8F8FA`) — not pure white
- **Cards:** `--dk-bg` (`#FFFFFF`) with `--dk-shadow-sm`, `--dk-radius-lg` (16px)
- **Status colors:** use semantic tokens only — `--dk-success`, `--dk-warning`, `--dk-danger`, `--dk-info`
- **Light mode only** — no dark mode variants, no `dark:` Tailwind classes
- **Type classes:** use `.dk-h3`, `.dk-h4`, `.dk-body`, `.dk-meta`, `.dk-eyebrow` — do not hardcode font sizes
- **Spacing:** use `--dk-space-*` scale (4px base) — prefer Tailwind utility classes that map to it
- **Buttons:** `--dk-radius-pill` (999px) for primary CTAs, `--dk-radius-md` for secondary actions
