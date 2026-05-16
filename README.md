# DClaw Real Estate — v1.2

> Property management SaaS: rent tracking, lease lifecycle, AI screening, vendor management, financial analytics.

---

## Quick Start (Docker — recommended)

**Prerequisites:** Docker 24+ and Docker Compose v2.

```bash
# Clone and enter the repo
git clone <repo-url> && cd Project-realestate

# (Optional) Set your Anthropic API key for AI features
echo "ANTHROPIC_API_KEY=sk-ant-..." > backend/.env

# Build and start all services
docker compose up --build

# App is live:
#   Frontend  →  http://localhost:3006
#   Backend   →  http://localhost:8095
#   API docs  →  http://localhost:8095/docs
```

To stop: `docker compose down`  
To wipe the database: `docker compose down -v`

---

## Local Development (without Docker)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ running locally

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cat > .env <<EOF
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_crm
ANTHROPIC_API_KEY=sk-ant-...     # optional — AI features degrade gracefully without it
UPLOAD_DIR=/tmp/dclaw_uploads
EOF

# Create the database
createdb dclaw_crm               # or use psql: CREATE DATABASE dclaw_crm;

# Start the server (auto-creates tables on first run)
uvicorn app.api.main:app --host 0.0.0.0 --port 8095 --reload
```

Backend is ready at **http://localhost:8095** — interactive API docs at **http://localhost:8095/docs**.

### 2. Frontend

```bash
cd frontend

# Install dependencies (includes recharts added in v1.2)
npm install

# Point at the local backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8095" > .env.local

# Start dev server
npm run dev
```

Frontend is ready at **http://localhost:3000** (dev) or **http://localhost:3006** (Docker).

### 3. Run tests

```bash
cd backend
source .venv/bin/activate

# Create the test database first
createdb dclaw_app_test

# Run all tests
pytest -v
```

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_crm` | PostgreSQL connection |
| `ANTHROPIC_API_KEY` | *(empty)* | Claude API — AI screening, description generation. App works without it. |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Claude model for AI features |
| `UPLOAD_DIR` | `/tmp/dclaw_uploads` | Document vault storage path |
| `LATE_FEE_GRACE_DAYS` | `5` | Days after due date before late fee applies |
| `LATE_FEE_FLAT` | `50.0` | Flat late fee amount ($) |
| `NEXT_PUBLIC_API_URL` | *(empty — same-origin)* | Frontend → backend URL |

---

## Application Pages

| URL | Feature |
|---|---|
| `/` | Dashboard — stats, expiring lease banner, rent due count |
| `/properties` | Property list with filters |
| `/properties/[id]` | Property detail: info, AI description, financials, market comps |
| `/properties/[id]/documents` | Document vault — upload/download/delete |
| `/tenants` | Tenant list with screening score badges |
| `/tenants/[id]` | Tenant detail: payments, AI screening, activity log, lease history |
| `/leases` | Lease lifecycle — expiring leases, inline renewal dialog |
| `/maintenance` | Maintenance requests with priority/status filters |
| `/vendors` | Vendor directory — add, rate, delete |
| `/reports/rent-roll` | Rent roll report with CSV export |
| `/reports/occupancy` | Portfolio occupancy analytics |

---

## API Endpoints (v1.2)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/dashboard/stats` | Summary stats + expiring leases |
| GET/POST | `/api/v1/properties/` | Property CRUD |
| POST | `/api/v1/properties/{id}/generate-description` | AI description |
| GET | `/api/v1/properties/{id}/comps` | Market comparables |
| GET/POST | `/api/v1/tenants/` | Tenant CRUD |
| POST | `/api/v1/tenants/{id}/screen` | AI screening score |
| GET/POST | `/api/v1/tenants/{id}/communications` | Activity log |
| GET/POST | `/api/v1/payments/` | Rent payments |
| POST | `/api/v1/payments/{id}/apply-late-fee` | Apply late fee |
| GET | `/api/v1/leases/expiring?days=30` | Expiring leases |
| POST | `/api/v1/leases/{tenant_id}/renew` | Renew lease |
| GET/POST | `/api/v1/vendors/` | Vendor directory |
| POST | `/api/v1/maintenance/{id}/assign` | Assign vendor |
| POST | `/api/v1/maintenance/{id}/resolve` | Resolve + rate |
| GET | `/api/v1/maintenance/{id}/suggest-vendor` | AI vendor suggestion |
| GET/POST | `/api/v1/financials/expenses` | Expense tracking |
| GET | `/api/v1/financials/properties/{id}` | NOI, cap rate, P&L |
| GET | `/api/v1/financials/portfolio` | Portfolio financials |
| POST | `/api/v1/documents/upload` | Upload document |
| GET | `/api/v1/documents/{id}/download` | Download document |
| GET | `/api/v1/reports/rent-roll` | Rent roll report |
| GET | `/api/v1/reports/occupancy` | Occupancy analytics |

Full interactive docs: **http://localhost:8095/docs**

---

## What This Is

This scaffold contains the **complete boilerplate** for any DClaw vertical SaaS app:
- ✅ FastAPI backend with correct SQLAlchemy 2.0 setup
- ✅ Next.js 14 frontend with Tailwind + pre-built UI components
- ✅ Docker + docker-compose with working healthchecks
- ✅ Helm chart for Kubernetes deployment
- ✅ Alembic migrations setup
- ✅ pytest test harness with pinned pytest-asyncio==0.24.0
- ✅ GitHub Actions CI
- ✅ `AGENTS.md` + `PLAN-v1.2.md` templates
- ✅ Pre-built UI components (no shadcn CLI needed)

## How to Use

```bash
# 1. Clone the scaffold
git clone https://github.com/dclawstack/dclaw-scaffold.git dclaw-YOURAPP
cd dclaw-YOURAPP

# 2. Find/replace placeholders
# Real Estate    -> Your app name (e.g., CRM)
# {BACKEND_PORT}-> Next free port (see port registry below)
# {FRONTEND_PORT}-> Next free port
# {DB_NAME}     -> dclaw_yourapp

# 3. Write your PRODUCT-SPEC.md
# See PRODUCT-SPEC.md.template for the format

# 4. Hand to your coding agents
# See SCALING-PLAYBOOK.md for the parallel agent workflow
```

## Critical Rules for Agents

### DO NOT install shadcn CLI
The scaffold includes pre-built UI components in `frontend/src/components/ui/`. Installing `shadcn` v4 or `@base-ui/react` will break the Tailwind v3 build.

### DO NOT change the Postgres test port
`backend/tests/conftest.py` uses `localhost:5432`. GitHub Actions CI maps the Postgres service to port 5432. Changing this breaks CI.

### DO NOT delete `.github/workflows/ci.yml`
This file is required for GitHub Actions to run tests on every push.

### DO NOT upgrade pytest-asyncio
Keep `pytest-asyncio==0.24.0` pinned in `requirements.txt`. v1.3.0 breaks fixture scoping.

## Port Registry

| App | Backend Port | Frontend Port | Database |
|-----|-------------|---------------|----------|
| dclaw-chat | 8090 | 3000 | dclaw_chat |
| dclaw-med | 8092 | 3004 | dclaw_med |
| dclaw-learn | 8093 | 3003 | dclaw_learn |
| dclaw-code | 8094 | 3005 | dclaw_code |
| dclaw-legal | 8099 | 3013 | dclaw_legal |
| dclaw-crm | 8095 | 3006 | dclaw_crm |
| dclaw-finance | 8096 | 3007 | dclaw_finance |
| dclaw-hr | 8097 | 3008 | dclaw_hr |
| **TBD #9** | **8098** | **3009** | **dclaw_xxx** |
| **TBD #10** | **8100** | **3010** | **dclaw_xxx** |

> **Rule:** New apps take the next available port. Update this table when assigning.

## Files You Must Customize

| File | What to Change |
|------|---------------|
| `backend/app/core/config.py` | `app_name`, default database name |
| `backend/app/api/main.py` | Wire v1 routers |
| `frontend/package.json` | Package name |
| `frontend/src/app/layout.tsx` | Title, description |
| `frontend/src/app/page.tsx` | Dashboard content |
| `docker-compose.yml` | Port mappings |
| `helm/Chart.yaml` | Chart name |
| `helm/values.yaml` | Image repository names |
| `AGENTS.md` | App identity, port numbers |
| `PLAN-v1.2.md` | Feature backlog |
| `PRODUCT-SPEC.md` | (Create this) Domain models, business logic |

## What You Should NOT Change

- `app/models/base.py` — `DeclarativeBase` pattern
- `app/core/database.py` — Engine/session factory
- `docker-compose.yml` healthcheck commands
- `frontend/Dockerfile` `ARG NEXT_PUBLIC_API_URL` pattern
- `tests/conftest.py` — Test DB override pattern (keep `localhost:5432`)
- `frontend/src/components/ui/*.tsx` — Pre-built components (use as-is)
- `requirements.txt` — Keep `pytest-asyncio==0.24.0` pinned
- `.github/workflows/ci.yml` — Do not delete

## Contributors

- [@sureshOC](https://github.com/sureshOC)
