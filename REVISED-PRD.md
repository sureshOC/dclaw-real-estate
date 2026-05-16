---
tags: [meta, prd, revised, swarm]
version: 2.3
date: 2026-05-16
app_id: real-estate
app_name: DClaw Real Estate
category: Real Estate
status: Future
---

# 📘 DClaw Real Estate — Revised PRD v2.3

> **The single document every agent must read before writing code for this app.**
> Generated from DClaw Master PRD v2.2. Read the Master PRD first: https://raw.githubusercontent.com/dclawstack/dclaw-prd/main/DClaw-Master-PRD.md

---

## 1. Product Identity

| Field | Value |
|-------|-------|
| **App ID** | `real-estate` |
| **Name** | DClaw Real Estate |
| **Category** | Real Estate |
| **Tagline** | Property management and deals |
| **Color** | #10B981 |
| **Phase** | Future |
| **Port (Frontend Dev)** | 3099 (TBD — assign before build) |
| **Port (Backend Dev)** | 18169 (TBD — assign before build) |
| **Maturity Tier** | 🔴 Tier 3 — Minimal Scaffold |

---

## 2. Current State Assessment

### 2.1 Scaffold Status
| Component | Status | Notes |
|-----------|--------|-------|
| `frontend/` | ❌ | Next.js 14+ app |
| `backend/` | ❌ | FastAPI + SQLAlchemy 2.0 |
| `docs/` | ❌ | getting-started, guides, reference, releases |
| `helm/` | ❌ | K8s deployment manifests |
| `.github/workflows/` | ❌ | CI/CD + Claude integration |
| `AGENTS.md` | ❌ | Per-repo agent instructions |
| `PLAN-v1.2.md` | ❌ | Feature roadmap |
| `docker-compose.yml` | ❌ | Local dev stack |
| `tests/` | ❌ | pytest + pytest-asyncio |
| `alembic/` | ❌ | Database migrations |
| `dclaw-manifest.json` | ❌ | DPanel registration |

### 2.2 Code Maturity
| Metric | Value |
|--------|-------|
| Python source files (backend) | ~0 |
| TypeScript/TSX files (frontend) | ~0 |
| Total source files | ~0 |
| Tests | ❌ Missing |
| Alembic migrations | ❌ Missing |
| DPanel manifest | ❌ Missing |

### 2.3 Feature Maturity
- **P0 Foundation:** Not yet implemented
- **P1 Platform:** Not yet started
- **P2 Vertical:** Not yet started

---

## 3. Gap Analysis

| # | Gap | Severity | Fix |
|---|-----|----------|-----|
| 1 | Missing `frontend/` directory | 🔴 | Scaffold Next.js 14+ frontend with shadcn/ui |
| 2 | Missing `backend/` directory | 🔴 | Scaffold FastAPI backend with SQLAlchemy 2.0 |
| 3 | Missing `docs/` directory | 🟡 | Create docs/ with getting-started, guides, reference, releases |
| 4 | Missing `helm/` directory | 🟡 | Copy helm chart from dclaw-scaffold and customize |
| 5 | Missing test suite | 🟡 | Add pytest + pytest-asyncio tests in backend/tests/ |
| 6 | Missing Alembic migrations | 🟡 | Initialize alembic and create initial migration |
| 7 | Missing `dclaw-manifest.json` | 🔴 | Create frontend/public/dclaw-manifest.json for DPanel |
| 8 | Minimal source code — mostly template scaffold | 🔴 | Implement P0 backend models, API routes, and frontend pages |

---

## 4. Sacred Architecture & Tech Stack

> **NON-NEGOTIABLE. Every DClaw product MUST use this exact stack.**

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js 14+ | App Router, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI | Pydantic v2, SQLAlchemy 2.0, asyncpg |
| **Database** | PostgreSQL 16 | CloudNativePG operator in K8s |
| **Vector DB** | Qdrant / pgvector | Only if RAG / semantic search |
| **Cache / Bus** | Redis | 7.x |
| **Object Storage** | MinIO | Latest |
| **Workflow** | Temporal.io | Only if automation/orchestration |
| **Auth** | Logto | JWT validation on all protected routes |
| **Billing** | Stripe | Metered or per-seat |
| **K8s Operator** | Go + controller-runtime | 0.18 |
| **LLM Local** | Ollama | Apple Silicon |
| **LLM Cloud** | OpenRouter + Kimi K2.5 | Fallback |
| **Monitoring** | Prometheus + Grafana | Latest |

### 4.1 Python Rules
- `ruff` formatting enforced
- Type hints on ALL public APIs
- `pydantic` v2 for schemas
- `sqlalchemy` 2.0 style (`Mapped`, `mapped_column`)
- `pytest` + `pytest-asyncio` for tests
- Functions < 50 lines
- No `print()` — use `structlog`

### 4.2 TypeScript / Next.js Rules
- Strict TypeScript (`strict: true`)
- Tailwind for ALL styling
- `cn()` utility for conditional classes
- No `any` without `// @ts-ignore`

### 4.3 Docker Standards
- Port mappings MUST match container listen port
- Healthchecks MUST use binaries present in base image
- `docker compose config` must pass before shipping
- Service type MUST be `ClusterIP`
- TLS required on all ingress

---

## 5. P0 Foundation Features (Must Have — Demo Ready)

> **Every P0 MUST include an AI Copilot per YC S25/W26 RFS.**

| # | Feature | Description | AI Component | Acceptance Criteria |
|---|---------|-------------|--------------|---------------------|
| P0.1 | **AI Real Estate Copilot** | Analyze properties, predict values, and optimize portfolios. | LLM property-analysis + valuation-modeling + investment-recommendation | Analyze 100 properties in <5min; predict value ±5% |
| P0.2 | **Property Listings** | Manage listings with AI-powered descriptions and photo optimization. | AI listing-generation + photo-enhancement + pricing-suggestion | Generate description in <30s; enhance photos; suggest price |
| P0.3 | **Deal Tracking** | Track offers, negotiations, and closings. | AI deal-probability prediction + timeline-estimation | Track 500 deals; predict close date; alert on delays |
| P0.4 | **Tenant Management** | Manage tenants, leases, and rent collection. | AI tenant-screening + rent-optimization + delinquency-prediction | Screen 100 applicants; optimize rent; predict payment risk |

---

## 6. P1 Platform Features (Should Have — v1.1–1.2)

| # | Feature | Description | AI Component | Acceptance Criteria |
|---|---------|-------------|--------------|---------------------|
| P1.1 | **Portfolio Analytics** | Track performance across property portfolios. | AI portfolio-scoring + risk-assessment + optimization | Track 1000 properties; NOI tracking; cap rate analysis |
| P1.2 | **Maintenance Requests** | Track and dispatch maintenance work orders. | AI priority-scoring + vendor-matching + cost-estimation | Tenant portal; auto-dispatch; cost tracking |
| P1.3 | **Document Management** | Store and manage leases, deeds, and closing documents. | AI document-classification + key-term extraction + expiration-alert | Organize 10K docs; auto-extract terms; expiry alerts |
| P1.4 | **Integration with Lease** | Sync lease data with DClaw Lease for compliance. | API sync + obligation-tracking | Bi-directional sync; shared calendar; compliance alerts |

---

## 7. P2 Vertical / Scale Features (Could Have — v1.3+)

| # | Feature | Description | AI Component | Acceptance Criteria |
|---|---------|-------------|--------------|---------------------|
| P2.1 | **Market Analysis** | Track market trends, comparables, and investment opportunities. | AI market-trend prediction + opportunity-identification | Track 50 markets; comp analysis; opportunity scoring |
| P2.2 | **Investor Reporting** | Generate investor reports with distributions and returns. | AI report-generation + waterfall-calculation | Quarterly reports; waterfall modeling; IRR tracking |
| P2.3 | **Virtual Tours** | Create and manage virtual property tours. | AI tour-generation + floor-plan extraction | 3D tours; floor plans; VR support |
| P2.4 | **CRM Integration** | Sync contacts and deals with DClaw CRM. | API sync + lead-routing + activity-tracking | Shared contacts; lead routing; activity sync |

---

## 8. Scaffold Checklist

Before marking this app "shipped", confirm:

- [ ] `frontend/` with Next.js 14+, Tailwind, shadcn/ui
- [ ] `backend/` with FastAPI, Pydantic v2, SQLAlchemy 2.0, asyncpg
- [ ] `docs/` with getting-started, guides, reference, releases, troubleshooting
- [ ] `helm/` with Chart.yaml, values.yaml, templates (deployment, service, ingress, cloudnativepg)
- [ ] `.github/workflows/` with build-backend.yml, build-frontend.yml, deploy.yml, claude.yml
- [ ] `frontend/public/dclaw-manifest.json` for DPanel registration
- [ ] `backend/tests/` with pytest + pytest-asyncio
- [ ] `backend/alembic/` with initial migration
- [ ] `Dockerfile` + `docker-compose.yml` with correct healthchecks
- [ ] Health endpoint at `/health` returning `{"status":"ok"}`
- [ ] `AGENTS.md` with per-repo instructions
- [ ] `PLAN-v1.2.md` with feature roadmap
- [ ] Port assigned from registry and documented
- [ ] No hardcoded secrets — use `.env.example` + K8s Secrets
- [ ] Non-root containers in Dockerfile

---

## 9. AI Copilot Mandate (YC S25/W26 Requirement)

Every DClaw app MUST have an AI Copilot as its first P0 feature. The copilot must:
1. Be contextually aware of the app's domain data
2. Use RAG over the app's knowledge base where applicable
3. Suggest next actions, not just answer questions
4. Be accessible from every page via floating chat or sidebar
5. Fall back to local Ollama when cloud is unavailable

---

## 10. Next Tasks for Vibe Coders

1. **Scaffold the backend**: Create `backend/app/` with models, schemas, API routes, and services per the P0 features above.
2. **Scaffold the frontend**: Create `frontend/src/app/` with pages for each P0 feature using Next.js 14 App Router + shadcn/ui.
3. **Add infrastructure**: Create `helm/`, `docker-compose.yml`, `.github/workflows/`, and `docs/` following dclaw-scaffold conventions.
4. **Write tests**: Add `backend/tests/` with pytest + pytest-asyncio covering all P0 API endpoints.

---

## 11. Domain Research Notes

Inspired by Buildium, AppFolio, Yardi, CoStar. Real estate AI optimizes the largest asset class.

---

## 12. Links & Resources

| Resource | URL |
|----------|-----|
| **Master PRD** | https://raw.githubusercontent.com/dclawstack/dclaw-prd/main/DClaw-Master-PRD.md |
| **GitHub Org** | https://github.com/dclawstack |
| **DPanel** | https://dpanel.dclawstack.io |
| **Port Registry** | See `dclaw-platform/PORT_REGISTRY.md` |
| **App PRD Template** | Obsidian Vault → `00-META/📐 App PRD Template.md` |
| **Scaffold Source** | `dclaw-scaffold/` in DClaw-Stack |

---

*Revised PRD version: 2.3*
*Generated: 2026-05-16 by DClaw Stack Generator*
*Next review: When P0 features are complete or architecture changes*
