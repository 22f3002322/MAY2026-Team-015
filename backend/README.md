# Neighbourly — Backend

FastAPI backend for **Neighbourly**, a role-based apartment/society management platform. It exposes a REST API consumed by the React frontend in [`../frontend`](../frontend); see the [root README](../README.md) for the full-stack overview.

![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Response & Error Envelope](#response--error-envelope)
- [Auth & Roles](#auth--roles)
- [API Reference](#api-reference)
  - [Module 1 — Authentication & Authorization](#module-1--authentication--authorization)
  - [Module 2 — Apartment Management](#module-2--apartment-management)
  - [Module 3 — Complaint Management](#module-3--complaint-management)
  - [Module 4 — Maintenance Staff Workflow](#module-4--maintenance-staff-workflow)
  - [Module 5 — Visitor Management](#module-5--visitor-management)
  - [Module 6 — Facility Booking](#module-6--facility-booking)
  - [Module 7 — Communication & Notifications](#module-7--communication--notifications)
  - [Module 8 — Billing & Payments](#module-8--billing--payments)
  - [Module 9 — Community Engagement (Polls)](#module-9--community-engagement-polls)
  - [Module 10 — AI Community Intelligence (optional)](#module-10--ai-community-intelligence-optional)
- [Database](#database)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Overview

Architecture: a modular, component-based system where each module (auth, apartments, complaints, maintenance, visitors, facilities, billing, communication, community, AI) owns a distinct functional area, all exposed through REST endpoints and backed by a single PostgreSQL database. Authentication is JWT-based Role-Based Access Control (RBAC) across five roles: **Admin, Committee, Resident, Security, Maintenance**.

All 30 tables described in the project's ER model are implemented (`app/models/__init__.py`), and every module is wired end-to-end (router → service → schema → model) and consumed by the frontend.

## Tech Stack

| Category | Technology |
| --- | --- |
| Web framework | FastAPI (`fastapi[standard]`) |
| ORM | SQLAlchemy |
| Database | PostgreSQL (`psycopg2-binary`) |
| Cache / ephemeral tokens | Redis |
| Auth tokens | JWT access tokens (`PyJWT`) + opaque, hashed, single-use-rotating refresh tokens (Postgres-backed) |
| Password hashing | `bcrypt` |
| File uploads | `python-multipart`, with magic-byte content-type sniffing |
| AI provider (optional) | Groq (OpenAI-compatible) via `httpx` |
| Testing | `pytest`, `pytest-asyncio`, `httpx.AsyncClient` |

## Project Structure

```text
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # pydantic-settings, reads .env
│   │   ├── database.py        # SQLAlchemy engine/session, get_db()
│   │   └── dependencies.py    # get_current_user, require_roles(*), verified-role variants
│   ├── models/                # SQLAlchemy models (30 tables)
│   ├── schemas/                # Pydantic request/response DTOs, one file per module
│   ├── routers/                 # FastAPI routers, one (or a few) per module
│   ├── services/                 # business logic — the only layer that talks to the DB
│   ├── utils/
│   │   ├── api_error.py        # AppError + subclasses (BadRequest, NotFound, Conflict, ...)
│   │   ├── api_response.py     # success_response(data, message)
│   │   ├── security.py         # JWT + opaque-token helpers
│   │   ├── password.py         # bcrypt hashing (72-byte cap handling)
│   │   ├── otp.py              # HMAC-hashed visitor OTPs
│   │   ├── groq_client.py      # Groq chat-completions client (Module 10)
│   │   └── ai_prompts.py       # versioned system prompts (Module 10)
│   └── main.py                 # app factory, CORS, global exception handlers, router registration
├── scripts/
│   ├── init_db.py              # Base.metadata.create_all() — no migration framework yet
│   └── seed.py                 # seeds roles + bootstrap admin + a full demo dataset
├── tests/
│   ├── conftest.py             # SQLite test DB, test client, user/resident factories
│   ├── test_facilities.py
│   ├── test_visitors.py
│   └── test_ai.py
├── requirements.txt
└── .env.example
```

## Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL (a running instance and an empty database)
- Redis (a running instance)

### Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env             # fill in DATABASE_URL, SECRET_KEY, REDIS_URL, OTP_HASH_SECRET, etc.

python -m scripts.init_db        # creates all tables (no migration framework — see script docstring)
python -m scripts.seed           # seeds the 5 roles + a bootstrap Admin + a demo dataset

uvicorn app.main:app --reload
```

The API is now live at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs` and `GET /health` for a liveness check (`{"success": true, "data": {"status": "ok"}, "message": ""}`).

### Example: log in via curl

```bash
curl -X POST localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<ADMIN_EMAIL from .env>","password":"<ADMIN_PASSWORD from .env>"}'
```

```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "bearer",
    "role": "Admin",
    "is_verified": true
  },
  "message": "Login successful."
}
```

### Example: upload a profile picture

```bash
curl -X POST localhost:8000/api/v1/residents/me/profile-picture \
  -H "Authorization: Bearer <resident access token>" \
  -F "file=@/path/to/photo.jpg"
```

### Example: record a bill payment

```bash
curl -X POST localhost:8000/api/v1/payments \
  -H "Authorization: Bearer <resident access token>" \
  -H "Content-Type: application/json" \
  -d '{"bill_id":1,"amount":"2500.00","payment_method":"upi","transaction_reference":"txn_001","status":"success"}'
```

## Environment Variables

Set these in `backend/.env` (see `.env.example` for the authoritative, always-up-to-date list). Never commit a populated `.env`.

| Variable | Purpose |
| --- | --- |
| `APP_NAME`, `APP_VERSION`, `DEBUG` | App metadata / debug mode |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string (password-reset tokens, AI rate limiting) |
| `SECRET_KEY`, `ALGORITHM` | JWT signing key + algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh-token lifetime |
| `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES` | Password-reset link TTL (stored in Redis) |
| `OTP_HASH_SECRET` | HMAC secret used to hash visitor OTPs at rest |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Bootstrap Admin account, created by `scripts/seed.py` |
| `MEDIA_ROOT`, `MEDIA_URL` | Local filesystem path / URL prefix for uploaded media (profile pictures, complaint images) |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |
| `AI_ENABLED` | Feature flag for Module 10 — `/api/v1/ai/*` returns `503` when `false` |
| `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BASE_URL`, `GROQ_TIMEOUT_SECONDS` | Groq provider config (required only if `AI_ENABLED=true`) |
| `AI_CHAT_RATE_LIMIT_PER_MINUTE` | Per-user chat rate limit (Redis-backed, fails open if Redis is down) |
| `AI_SUMMARY_CACHE_TTL_SECONDS` | Redis cache TTL for AI complaint-summary reports |

## Response & Error Envelope

Every response has the same shape, regardless of endpoint.

**Success** (`app/utils/api_response.py`):
```json
{ "success": true, "data": { }, "message": "" }
```

**Error** (`app/utils/api_error.py` + `main.py`'s global exception handlers):
```json
{ "success": false, "message": "Invalid email or password" }
```

`AppError` is the one exception type routers/services raise for expected, user-facing errors — `BadRequest` (400), `InvalidCredentials`/`NotAuthenticated` (401), `Deactivated`/`NotAuthorized` (403), `NotFound` (404), `Conflict` (409), `ValidationFailed` (422, carries per-field detail under an extra `errors` key), `ServerError` (500), `ServiceUnavailable` (503). Stray FastAPI/Starlette `HTTPException`s (e.g. a missing `Authorization` header) and any unhandled exception are also normalized into this same shape — a client only ever needs to handle one error format.

## Auth & Roles

Five roles (`RoleEnum`): **Admin, Committee, Resident, Security, Maintenance**.

- **Admin** is seeded once (`scripts/seed.py`), never created through the API.
- **Admin creates Committee** accounts (`POST /api/v1/auth/register-committee`) — auto-verified, since they're admin-provisioned.
- **Resident / Maintenance / Security self-register** (`POST /api/v1/auth/signup`, public, no auth). They start `is_verified=False` until a Committee member reviews them.
- `is_active` and `is_verified` are independent: a freshly self-registered user can log in immediately; `is_verified` separately gates write access to complaints, bookings, visitor pre-registration, and voting.

| Dependency | Guarantees |
| --- | --- |
| `get_current_user` | Valid, non-expired access token; user exists and `is_active` |
| `require_roles(*roles)` (`require_admin`, `require_committee`, `require_resident`, `require_security`, `require_maintenance`) | Above, plus role membership |
| `require_admin_or_committee` | Above, role is Admin or Committee |
| `require_roles_verified(*roles)` (`require_verified_resident`, `require_verified_security`, `require_verified_maintenance`) | Above, plus `is_verified=True` |
| `get_resident_profile` / `get_security_guard_profile` / `get_maintenance_staff_profile` | Resolves the caller's own role-specific profile row |

**Tokens** — Access tokens are short-lived JWTs. Refresh tokens are opaque random strings, persisted only as a SHA-256 hash, and are single-use: redeeming one revokes it and links it to its replacement, so a replayed token is detectable. Password-reset tokens live only in Redis, single-use, with no user-enumeration leak. There is no self-service change-password endpoint's login-lockout — password recovery is `forgot-password` → `reset-password` only (a dedicated authenticated `change-password` endpoint also exists).

## API Reference

### Module 1 — Authentication & Authorization

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register-committee` | Admin | Only way a Committee account is created |
| POST | `/api/v1/auth/signup` | Public | Self-registration (Resident / Maintenance / Security) |
| POST | `/api/v1/auth/login` | Public | |
| POST | `/api/v1/auth/refresh` | Public (valid refresh token) | Rotates the refresh token |
| POST | `/api/v1/auth/logout` | Authenticated | Revokes the given refresh token |
| POST | `/api/v1/auth/forgot-password` | Public | |
| POST | `/api/v1/auth/reset-password` | Public (valid reset token) | |
| POST | `/api/v1/auth/change-password` | Authenticated | |
| GET | `/api/v1/auth/me` | Authenticated | Current user + role-specific profile |
| GET | `/api/v1/auth/pending-verifications` | Committee | Unverified Resident/Maintenance/Security accounts |
| POST | `/api/v1/auth/verify/{user_id}` | Committee | Verifies the account; for a Resident with a requested flat, this also performs move-in |
| POST | `/api/v1/auth/users/{user_id}/deactivate` | Admin | Suspends login, revokes all refresh tokens |
| POST | `/api/v1/auth/users/{user_id}/reactivate` | Admin | |
| POST | `/api/v1/residents/me/profile-picture` | Resident | Multipart upload, validated by content sniffing, 5 MB cap |
| DELETE | `/api/v1/residents/me/profile-picture` | Resident | |

### Module 2 — Apartment Management

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST / PATCH / DELETE | `/api/v1/blocks[/{id}]` | Admin/Committee | |
| GET | `/api/v1/blocks[/{id}]` | Public | Powers the pre-signup flat picker; includes computed `flat_count` |
| POST / PATCH / DELETE | `/api/v1/flats[/{id}]` | Admin/Committee | Delete refuses occupied flats |
| GET | `/api/v1/flats` | Public | Structural data only |
| GET | `/api/v1/flats/{id}` | Authenticated | Includes `current_residents` |
| GET | `/api/v1/residents` | Admin/Committee | Filters `block_id` / `flat_id` |
| GET / PATCH | `/api/v1/residents/{id}` | Admin/Committee | PATCH edits contact fields only (not `flat_id`) |
| POST | `/api/v1/residents/{id}/move-in` | Admin/Committee | |
| POST | `/api/v1/residents/{id}/move-out` | Admin/Committee | |
| GET | `/api/v1/residents/{id}/occupancy-history` | Admin/Committee | |
| PATCH | `/api/v1/residents/me` | Resident | Self-service contact-field edit |

A flat's `occupancy_status` is derived (never set directly): `occupied` iff at least one `OccupancyHistory` row for it is current.

### Module 3 — Complaint Management

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/admin/complaint-categories` | Admin/Committee | |
| GET | `/api/v1/admin/complaint-categories` | Admin/Committee | |
| GET | `/api/v1/complaint-categories` | Public | Read-only mirror so signup/complaint forms can list categories |
| POST | `/api/v1/complaints` | Verified Resident | `resident_id` always the caller's own profile |
| GET | `/api/v1/complaints` | Authenticated | Scoped by role: own (Resident), assigned (Maintenance), all (Admin/Committee) |
| GET / PATCH | `/api/v1/complaints/{id}` | Ownership-checked | Residents may edit `description`/`priority`, never `status` directly |
| POST | `/api/v1/complaints/{id}/assign` | Admin/Committee | Creates the assignment + the `MaintenanceTask` that drives Module 4 |
| POST | `/api/v1/complaints/{id}/comments` | Ownership-checked | Optional 1–5 rating, only once `resolved` |
| POST | `/api/v1/complaints/{id}/images` | Ownership-checked | Multipart image upload |

Non-Admin/Committee callers follow the state machine `open → assigned → in_progress → resolved → {closed, assigned}`; Admin/Committee can force any transition.

### Module 4 — Maintenance Staff Workflow

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/maintenance/tasks` | Verified Maintenance | Caller's own tasks |
| GET | `/api/v1/maintenance/tasks/{id}` | Verified Maintenance | 403 if not the caller's task |
| POST | `/api/v1/maintenance/tasks/{id}/accept` | Verified Maintenance | `assigned → accepted` |
| POST | `/api/v1/maintenance/tasks/{id}/decline` | Verified Maintenance | `assigned → declined`; parent complaint reopens to `open` |
| POST | `/api/v1/maintenance/tasks/{id}/schedule` | Verified Maintenance | Sets `scheduled_at`, no status change |
| POST | `/api/v1/maintenance/tasks/{id}/start` | Verified Maintenance | `accepted → in_progress` |
| POST | `/api/v1/maintenance/tasks/{id}/complete` | Verified Maintenance | `in_progress → completed`; resolves the parent complaint |
| GET | `/api/v1/admin/maintenance-staff` | Admin/Committee | Staff directory with live `open_task_count` |
| GET | `/api/v1/maintenance-staff[/{id}]` | Admin/Committee | Directory (mirrors the above with more fields) |
| PATCH | `/api/v1/maintenance-staff/me/availability` | Verified Maintenance | Own `is_available` toggle |
| GET | `/api/v1/security-guards[/{id}]` | Admin/Committee | Security directory |

### Module 5 — Visitor Management

OTPs are 6-digit, generated with `secrets.choice`, and stored only as an HMAC-SHA256 hash — compared with a timing-safe comparison. The plaintext OTP is returned exactly once, in the pre-registration response (no SMS/email gateway is wired up).

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/visitors/pre-register` | Verified Resident | Returns the plaintext OTP once |
| GET | `/api/v1/visitors/requests` | Verified Resident | Caller's own requests |
| GET | `/api/v1/visitors/requests/all` | Admin/Committee/verified Security | No OTPs — lets gate staff match an arrival to a `request_id` |
| POST | `/api/v1/visitors/{id}/deny` | Verified Resident | Cancel a pre-registration before arrival |
| POST | `/api/v1/visitors/{id}/verify-otp` | Verified Security | Flips to `arrived`, creates the `VisitorLog` |
| POST | `/api/v1/visitors/logs/{id}/exit` | Verified Security | Sets `exit_time` |
| GET | `/api/v1/visitors/logs` | Admin only | Full, society-wide audit trail |
| GET | `/api/v1/visitors/logs/mine` | Verified Security | Only the calling guard's own check-ins |

### Module 6 — Facility Booking

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST / GET / GET{id} / PATCH | `/api/v1/admin/facilities[/{id}]` | Admin/Committee | |
| GET | `/api/v1/admin/facilities` | Any authenticated | Read access is open to all roles |
| POST | `/api/v1/facility-bookings` | Verified Resident | `resident_id` always the caller's own profile |
| GET | `/api/v1/facility-bookings` | Authenticated | Resident sees only their own; every other role sees all |
| GET | `/api/v1/facility-bookings/{id}` | Ownership-checked | |
| PATCH | `/api/v1/facility-bookings/{id}` | Admin/Committee (any field) or verified Resident (own booking, date/time/cancel only) | |

Booking validation checks facility active status, opening/closing hours, `maximum_duration`, no bookings in the past, and slot conflicts (with row-level locking to close a create/update race).

### Module 7 — Communication & Notifications

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/announcements` | Admin/Committee | Also pushes into every resident's notification inbox |
| GET | `/api/v1/announcements` | Authenticated | `include_inactive=true` only honored for Admin/Committee |
| GET / PATCH / DELETE | `/api/v1/announcements/{id}` | Authenticated (read) / Admin/Committee (write) | |
| GET | `/api/v1/notifications` | Authenticated | `unread_only` filter |
| POST | `/api/v1/notifications/{id}/read` | Authenticated | |
| POST | `/api/v1/notifications/read-all` | Authenticated | |

Notifications are never created via a public endpoint — they're fired internally by real events (bill generated, payment success, complaint update, booking update, visitor arrival, announcement published, poll opened).

### Module 8 — Billing & Payments

Money is `Decimal` everywhere (`Numeric(10, 2)` columns), never `float`.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/admin/bills` | Admin/Committee | `amount` computed from `items` when provided; notifies the flat's residents |
| GET | `/api/v1/admin/bills/summary` | Admin/Committee | Billed / collected / outstanding totals |
| GET / GET{id} / PATCH | `/api/v1/admin/bills[/{id}]` | Admin/Committee | |
| GET | `/api/v1/billing/me/bills` | Resident | Own flat's bills |
| GET | `/api/v1/billing/me/payments` | Resident | Own flat's payments |
| POST | `/api/v1/payments` | Verified Resident (own flat's bill) or Admin/Committee | No real gateway — caller reports the outcome (`pending`/`success`/`failed`); auto-generates a `Receipt` on success |
| GET | `/api/v1/payments` | Authenticated | Admin/Committee see everything; Resident sees only their own |
| GET | `/api/v1/payments/{id}` | Ownership-checked | |
| PATCH | `/api/v1/payments/{id}` | Verified Resident (own) or Admin/Committee | Moves a `pending` payment to `success`/`failed` |
| GET | `/api/v1/payments/{id}/receipt` | Ownership-checked | 404 if the payment never succeeded |

### Module 9 — Community Engagement (Polls)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/polls` | Admin/Committee | Requires ≥ 2 options; notifies every resident |
| GET / GET{id} | `/api/v1/polls[/{id}]` | Authenticated | |
| PATCH | `/api/v1/polls/{id}` | Admin/Committee | Including `is_active` (early close) |
| POST | `/api/v1/polls/{id}/vote` | Verified Resident | Rejected outside the poll's active window, or a repeat vote when multi-voting isn't allowed |
| GET | `/api/v1/polls/{id}/results` | Authenticated | Live per-option counts + total, even before the poll ends |

### Module 10 — AI Community Intelligence (optional)

Provider: **Groq** (OpenAI-compatible). Toggle with `AI_ENABLED` / `GROQ_API_KEY`; every `/api/v1/ai/*` route returns `503` in the standard error envelope when disabled or misconfigured. Fully wired on both backend and frontend (chat widget, smart search, AI complaint-classification suggestion, AI staff recommendations, and an admin complaint-summary report).

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/ai/complaints/classify` | Verified Resident, Admin, Committee | Suggests `category_id` + `priority`; does **not** create a complaint |
| GET | `/api/v1/ai/complaints/{id}/staff-recommendations` | Admin, Committee | Ranked staff suggestions; a human still assigns |
| GET | `/api/v1/ai/search` | Authenticated | Role-scoped search over complaints + announcements, with optional AI re-ranking |
| POST | `/api/v1/ai/reports/complaints/summary` | Admin, Committee | SQL aggregates + AI narrative, Redis-cached |
| POST | `/api/v1/ai/chat` | Authenticated | Grounded reply + citations, Redis-backed per-user rate limit |

Every AI call is logged to `ai_inference_logs` (feature, latency, truncated raw response) for auditing.

## Database

Tables (30): `roles`, `users`, `refresh_tokens` · `blocks`, `flats`, `resident_profiles`, `occupancy_history` · `maintenance_staff`, `security_guards` · `complaint_categories`, `complaints`, `complaint_images`, `complaint_assignments`, `maintenance_tasks`, `complaint_comments` · `visitors`, `visitor_requests`, `visitor_logs` · `facilities`, `facility_bookings` · `maintenance_bills`, `bill_items`, `payments`, `receipts` · `announcements`, `notifications` · `polls`, `poll_options`, `poll_votes` · `ai_inference_logs`.

`full_name` / `phone` / `is_active` / `is_verified` / `last_login` all live on `users`, not duplicated onto role-specific profile tables. Timestamps are naive datetimes that numerically represent Asia/Kolkata wall-clock time (`app/models/mixins.py:ist_now`), matching the plain `TIMESTAMP WITHOUT TIME ZONE` columns in Postgres.

There is currently **no migration framework** — `scripts/init_db.py` calls `Base.metadata.create_all()` directly against the models. This is fine for a single-developer/early-stage build; swap to Alembic before you need versioned migrations or production rollback support.

## Testing

A `pytest` suite lives under `backend/tests/`, backed by an isolated **SQLite** database (see `conftest.py`) — no PostgreSQL or Redis needed to run it.

```bash
cd backend
pytest -q
```

Current coverage includes facility CRUD + booking conflict/validation rules (`test_facilities.py`), visitor OTP verification (`test_visitors.py`), and the AI module with a mocked Groq client (`test_ai.py`). Please add tests under `backend/tests/` for any new endpoint or business rule.

## Contributing

```bash
git checkout -b feature/your-feature
# make your changes, add/update tests under backend/tests/
git add .
git commit -m "Describe your change"
git push -u origin feature/your-feature
```

Then open a Pull Request. See the [root README](../README.md#contributing) for the full workflow.

## License

This project is developed for educational and portfolio purposes.