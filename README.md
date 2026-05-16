# DClaw Real Estate — v2.0 (YC Edition)

> **AI-native property management SaaS** — multi-tenant, subscription billing, tenant portal, NL query, portfolio health score, lease abstraction, and auto-dispatch. Built for Y Combinator application.

---

## What This Is

A production-grade B2B SaaS for property managers and landlords. Collect rent, screen tenants, manage maintenance, and get AI-powered portfolio insights — all in one platform.

**Revenue model:** $49–$99/month per PM (per-unit pricing) + 0.5% of rent collected through platform ACH.  
**Moat:** Data flywheel — every lease, payment, and maintenance job makes AI screening, pricing, and dispatch smarter across all customers.

---

## Quick Start (Docker — recommended)

**Prerequisites:** Docker 24+ and Docker Compose v2.

```bash
# Clone and enter the repo
git clone <repo-url> && cd Project-realestate

# Configure environment (AI features work without keys — degrade gracefully)
cat > backend/.env <<EOF
ANTHROPIC_API_KEY=sk-ant-...        # AI features (health score, NL query, screening)
STRIPE_SECRET_KEY=sk_test_...       # Billing (mocked without it)
STRIPE_WEBHOOK_SECRET=whsec_...     # Stripe webhook validation
STRIPE_PRICE_STARTER=price_...      # Stripe price ID for $49/mo plan
STRIPE_PRICE_PRO=price_...          # Stripe price ID for $99/mo plan
SENDGRID_API_KEY=SG....             # Email notifications (optional)
SECRET_KEY=change-me-in-production  # JWT signing key — MUST change for production
EOF

# Build and start all services
docker compose up --build

# App is live:
#   Frontend   →  http://localhost:3006
#   Backend    →  http://localhost:8095
#   API docs   →  http://localhost:8095/docs
```

First-time flow: go to **http://localhost:3006/register** → create your org → you're in.

To stop: `docker compose down`  
To wipe the database: `docker compose down -v`

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ running locally

### 1. Backend

```bash
cd backend

python3 -m venv .venv && source .venv/bin/activate

pip install -r requirements.txt

cat > .env <<EOF
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_crm
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=dev-secret-key
UPLOAD_DIR=/tmp/dclaw_uploads
EOF

createdb dclaw_crm

# Tables auto-created on first run
uvicorn app.api.main:app --host 0.0.0.0 --port 8095 --reload
```

Backend: **http://localhost:8095** — API docs: **http://localhost:8095/docs**

### 2. Frontend

```bash
cd frontend

npm install

echo "NEXT_PUBLIC_API_URL=http://localhost:8095" > .env.local

npm run dev
```

Frontend: **http://localhost:3000**

### 3. Run tests

```bash
cd backend && source .venv/bin/activate
createdb dclaw_app_test
pytest -v
```

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_crm` | PostgreSQL |
| `SECRET_KEY` | `change-me-in-production` | JWT signing — **change this in production** |
| `ANTHROPIC_API_KEY` | *(empty)* | AI features — health score, NL query, screening, description, lease abstraction |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Claude model |
| `STRIPE_SECRET_KEY` | *(empty)* | Stripe billing — mocked gracefully without it |
| `STRIPE_WEBHOOK_SECRET` | *(empty)* | Stripe webhook signature validation |
| `STRIPE_PRICE_STARTER` | *(empty)* | Stripe price ID for Starter plan ($49/mo) |
| `STRIPE_PRICE_PRO` | *(empty)* | Stripe price ID for Pro plan ($99/mo) |
| `SENDGRID_API_KEY` | *(empty)* | Transactional email notifications |
| `FROM_EMAIL` | `noreply@dclaw.app` | Sender address for notifications |
| `FRONTEND_URL` | `http://localhost:3000` | Used in Stripe portal redirect |
| `UPLOAD_DIR` | `/tmp/dclaw_uploads` | Document vault storage |
| `LATE_FEE_GRACE_DAYS` | `5` | Days after due date before late fee |
| `LATE_FEE_FLAT` | `50.0` | Flat late fee amount ($) |
| `NEXT_PUBLIC_API_URL` | *(same-origin)* | Frontend → backend base URL |

---

## Application Pages

### Admin (requires login)

| URL | Feature |
|---|---|
| `/login` | Sign in to your org |
| `/register` | Create org + owner account (free, no card) |
| `/` | Dashboard — portfolio health score, stats, AI quick actions |
| `/properties` | Property list with type/status/price filters |
| `/properties/[id]` | Property detail: info, AI description, financials, market comps |
| `/properties/[id]/documents` | Document vault — upload, download, AI lease abstraction |
| `/tenants` | Tenant list with AI screening score badges |
| `/tenants/[id]` | Tenant detail: payment history, screening, activity log, lease history |
| `/leases` | Lease lifecycle — expiring leases, renewal dialog |
| `/maintenance` | Maintenance requests — priority/status filters, vendor assign |
| `/vendors` | Vendor directory — specialty, rating, open request count |
| `/reports/rent-roll` | Rent roll with CSV export |
| `/reports/occupancy` | Portfolio occupancy analytics |
| `/ai-query` | **NEW** Natural language query interface |
| `/import` | **NEW** Bulk CSV import wizard (properties + tenants) |
| `/billing` | **NEW** Subscription plans + Stripe portal |

### Tenant Portal (no admin access)

| URL | Feature |
|---|---|
| `/portal` | Tenant login (email + 6-char portal code) |
| `/portal` (authenticated) | Lease info, payment history, submit maintenance request |

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create org + owner user → JWT |
| POST | `/api/v1/auth/login` | Email + password → JWT |
| GET | `/api/v1/auth/me` | Current user + org info |

### Properties
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/v1/properties/` | List / create |
| GET/PUT/DELETE | `/api/v1/properties/{id}` | Get / update / delete |
| POST | `/api/v1/properties/{id}/generate-description` | AI listing copy |
| GET | `/api/v1/properties/{id}/comps` | Market comparables |
| GET | `/api/v1/financials/properties/{id}` | NOI, cap rate, P&L |

### Tenants
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/v1/tenants/` | List / create |
| GET/PUT/DELETE | `/api/v1/tenants/{id}` | Get / update / delete |
| POST | `/api/v1/tenants/{id}/screen` | AI screening score |
| GET/POST | `/api/v1/tenants/{id}/communications` | Activity log |

### Payments & Leases
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/v1/payments/` | Rent payments |
| POST | `/api/v1/payments/{id}/apply-late-fee` | Apply late fee |
| GET | `/api/v1/leases/expiring?days=30` | Expiring leases |
| POST | `/api/v1/leases/{tenant_id}/renew` | Renew lease |

### Maintenance & Vendors
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/v1/maintenance/` | Requests list / create |
| POST | `/api/v1/maintenance/{id}/assign` | Assign vendor |
| POST | `/api/v1/maintenance/{id}/resolve` | Resolve + rate vendor |
| GET | `/api/v1/maintenance/{id}/suggest-vendor` | AI vendor suggestion |
| GET/POST | `/api/v1/vendors/` | Vendor directory |

### AI
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/ai/health-score` | Portfolio health score (0–100, grade A–F, AI summary) |
| POST | `/api/v1/ai/query` | Natural language query → DB results |
| POST | `/api/v1/ai/dispatch` | Auto-dispatch vendor to maintenance request |
| POST | `/api/v1/documents/{id}/abstract-lease` | PDF → structured lease fields via Claude |

### Billing
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/billing/status` | Current plan, unit limit, price |
| POST | `/api/v1/billing/subscribe` | Upgrade plan (starter/pro) |
| POST | `/api/v1/billing/portal` | Stripe Customer Portal URL |
| POST | `/api/v1/billing/webhook` | Stripe event handler |

### Tenant Portal
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/portal/auth` | Tenant login → portal JWT |
| GET | `/api/v1/portal/dashboard` | Tenant's lease, payments, requests |
| POST | `/api/v1/portal/maintenance` | Submit maintenance request |

### Import & Reports
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/import/properties` | CSV import — flexible header detection |
| POST | `/api/v1/import/tenants` | CSV import with duplicate detection |
| GET | `/api/v1/reports/rent-roll` | Rent roll report |
| GET | `/api/v1/reports/occupancy` | Portfolio occupancy analytics |
| GET | `/api/v1/financials/portfolio` | Aggregate NOI / cap rate |

Full interactive docs: **http://localhost:8095/docs**

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 14 Frontend (port 3006)                        │
│  Auth context · DKube design system · Poppins font      │
└──────────────────────┬──────────────────────────────────┘
                       │ REST + Bearer JWT
┌──────────────────────▼──────────────────────────────────┐
│  FastAPI Backend (port 8095)                            │
│  JWT auth · org_id multi-tenancy · RBAC roles           │
│                                                         │
│  Routes: auth · properties · tenants · maintenance      │
│          payments · leases · vendors · documents        │
│          financials · reports · billing · portal        │
│          import · ai_tools                              │
│                                                         │
│  Services: health_score · nl_query · lease_abstraction  │
│            auto_dispatch · stripe_service · screening   │
│            ai_description · notifications               │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   PostgreSQL     Anthropic API    Stripe API
   (all models    (Claude 4.6 —   (billing +
    org-scoped)    AI features)    ACH collect)
```

### Multi-tenancy
Every `Property`, `Tenant`, `MaintenanceRequest`, `RentPayment` row carries an `org_id` FK. All queries are scoped to the org extracted from the JWT. New orgs are isolated by default — no data leaks between customers.

### User Roles
| Role | Access |
|---|---|
| `owner` | Full access + billing management |
| `manager` | All property/tenant/maintenance operations |
| `tech` | Maintenance read/update only |
| `accountant` | Financial reports read-only |

---

## Subscription Plans

| Plan | Price | Units | Key Features |
|---|---|---|---|
| Free | $0/mo | 3 units | Core CRUD, basic reporting |
| Starter | $49/mo | 20 units | AI screening, rent collection, CSV import, email notifications |
| Pro | $99/mo | 100 units | Everything + AI query, health score, lease abstraction, vendor marketplace |
| Enterprise | Custom | Unlimited | Custom contract, dedicated support, SSO |

**Transaction revenue:** 0.5% of rent collected through platform ACH. On a 50-unit portfolio at avg $2,000/mo = $500/mo transaction revenue on top of subscription.

---

## Roadmap (Moat Builders)

| Feature | Why It Wins |
|---|---|
| Vendor Marketplace | Two-sided network; vendors pay for featured placement |
| Predictive Rent Optimization | Cross-org pricing data flywheel → ML rent recommendations |
| Anonymous Portfolio Benchmarking | "Your NOI is 14% below similar Austin properties" |
| Owner Portal | PMs work for owners — Agora (YC W22) built their moat here |
| Fair Housing AI Scanner | Legal compliance check on every listing description |
| Predictive Maintenance | Failure probability per system → prevent $5K emergency repairs |
| Tenant Rental Reputation | Cross-property verified payment history — credit bureau play |
| E-Signature Lease Workflow | End-to-end digital lease signing |

---

## Technical Notes

### Agent / CI Rules
- **DO NOT** install shadcn CLI — pre-built UI components are in `frontend/src/components/ui/`
- **DO NOT** change `pytest-asyncio==0.24.0` pin — v1.3.0 breaks fixture scoping
- **DO NOT** change Postgres test port (`localhost:5432`) — CI depends on it
- **DO NOT** delete `.github/workflows/ci.yml`

### Port Registry

| App | Backend | Frontend | Database |
|---|---|---|---|
| dclaw-crm (this app) | **8095** | **3006** | `dclaw_crm` |
| dclaw-chat | 8090 | 3000 | `dclaw_chat` |
| dclaw-med | 8092 | 3004 | `dclaw_med` |
| dclaw-learn | 8093 | 3003 | `dclaw_learn` |
| dclaw-code | 8094 | 3005 | `dclaw_code` |
| dclaw-finance | 8096 | 3007 | `dclaw_finance` |
| dclaw-hr | 8097 | 3008 | `dclaw_hr` |
| dclaw-legal | 8099 | 3013 | `dclaw_legal` |

---

## Contributors

- [@sureshOC](https://github.com/sureshOC)
