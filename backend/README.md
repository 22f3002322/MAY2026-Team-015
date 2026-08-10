# Neighbourly Backend

This README replaces the previous Module‑1/Module‑2‑only version. It now
documents every component that's actually wired up end‑to‑end
(router → service → schema → model): **Modules 1–9**, matching sections
1.1–1.9 of the component design doc. Section 1.10 (**AI Community
Intelligence**) is designed but not yet built — see "Next module" at the
bottom.

**Architecture, per the component design doc:** a modular,
component‑based system where each component owns a distinct functional
area, communicating through REST APIs built with FastAPI, backed by a
single PostgreSQL database. Authentication is JWT‑based Role‑Based
Access Control (RBAC). Components are developed independently but share
the same database and the same response/error envelope.

**Schema source of truth: `er-dbml.txt`, followed literally.** The
component design doc's ER diagram describes 30 entities across every
module including 1.10; all 30 entity groups are represented in code today
(`app/models/__init__.py`), including `ai_inference_logs` for Module 1.10.

---

## Response & error envelope

Every response has the same shape, regardless of endpoint:

**Success** (`app/utils/api_response.py`):
```json
{ "success": true, "data": { ... }, "message": "" }
```
Routers call `success_response(...)` explicitly for every 2xx response.

**Error** (`app/utils/api_error.py` + `main.py`'s global exception
handlers):
```json
{ "success": false, "message": "Invalid email or password" }
```
`AppError` is the one exception type routers/services raise for
expected, user‑facing errors (`BadRequest` 400, `InvalidCredentials` /
`NotAuthenticated` 401, `Deactivated` / `NotAuthorized` 403, `NotFound`
404, `Conflict` 409, `ValidationFailed` 422, `ServerError` 500).
`main.py` also catches:
- Stray `fastapi`/`starlette` `HTTPException`s that slip out of a
  dependency (e.g. `OAuth2PasswordBearer`'s automatic 401 when no
  `Authorization` header is sent, or a 404 on an unknown route) — these
  still come back in the same `{success, message}` shape instead of
  Starlette's default `{"detail": ...}`.
- `RequestValidationError` (422) — carries per‑field detail under an
  additional `errors` key, alongside the required `success`/`message`.
- Any other unhandled exception — logged, returned as a generic 500 so
  internals never leak to the client.

Routers never construct error bodies themselves; they raise an
`AppError` subclass and move on.

---

## Auth & roles

Five roles (`RoleEnum` in `app/models/auth.py`): **Admin, Committee,
Resident, Security, Maintenance**.

- **Admin** is seeded once (`scripts/seed.py`), never created through
  the API.
- **Admin creates Committee** — the only account‑creation path that
  needs an authenticated caller (`POST /api/v1/auth/register-committee`).
  Committee accounts are auto‑verified (`is_verified=True`) since
  they're admin‑provisioned, not part of the self‑signup flow.
- **Resident / Maintenance / Security self‑register** — public
  `POST /api/v1/auth/signup`, no auth required. They start
  `is_verified=False` until a Committee member reviews them.
- **`is_active` and `is_verified` are independent.** A freshly
  self‑registered user can log in immediately (`is_active=True` from
  creation); `is_verified` is a separate flag that later modules
  (complaints, bookings, visitor pre‑registration, voting…) check
  before granting full access.

`app/core/dependencies.py` exposes the building blocks every router
uses:

| Dependency | Guarantees |
|---|---|
| `get_current_user` | Valid, non‑expired access token; user exists and `is_active` |
| `require_roles(*roles)` → `require_admin`, `require_committee`, `require_resident`, `require_security`, `require_maintenance` | Above, plus role membership |
| `require_admin_or_committee` | Above, role is Admin or Committee |
| `require_roles_verified(*roles)` → `require_verified_resident`, `require_verified_security`, `require_verified_maintenance` | Above, plus `is_verified=True` — used for actions that should wait on committee review (filing complaints, booking facilities, pre‑registering visitors, verifying visitor OTPs, voting) |
| `get_resident_profile` / `get_security_guard_profile` / `get_maintenance_staff_profile` | Resolves the caller's own role‑specific profile row; `NotAuthorized` if none exists |

---

## Module 1 — Authentication & Authorization (1.1)

### Session & account endpoints (`/api/v1/auth`)

- `POST /register-committee` (Admin) — the *only* way a Committee
  account gets created.
- `POST /signup` (public) — self‑registration for Resident /
  Maintenance / Security. Starts unverified.
- `POST /login`, `POST /refresh`, `POST /logout`
- `POST /forgot-password`, `POST /reset-password`
- `GET /me` — current user + whichever role‑specific profile applies.
- `GET /pending-verifications` (**Committee only** — Admin is
  deliberately refused here too) — lists unverified Resident /
  Maintenance / Security accounts.
- `POST /verify/{user_id}` (Committee) — flips `is_verified=True`. If
  the user is a Resident who picked a flat at signup, **this call is
  also the move‑in** (see Module 2).

### Profile picture (`/api/v1/residents/me`)

- `POST /profile-picture` (Resident, multipart `file`) — replaces any
  existing picture. Validates JPEG/PNG/WEBP by sniffing the actual file
  bytes (not just the declared `Content-Type`), caps uploads at 5 MB via
  bounded chunked reads, generates its own filename (no path‑traversal
  surface from a client‑supplied name).
- `DELETE /profile-picture` (Resident) — removes it.

Files live under `MEDIA_ROOT` (default `media/`), served statically at
`MEDIA_URL` (default `/media`); `GET /me` returns the current
`profile_image` URL as-is, ready for an `<img src>`.

### Tokens

- **Access tokens** are short‑lived JWTs (`app/utils/security.py`,
  PyJWT). Payload: `sub`, `full_name`, `email`, `role`, `is_verified`,
  `iat` (explicit UTC timestamp — a naive‑IST `iat` previously landed in
  the future on a UTC‑clocked server and PyJWT rejects that), `exp`.
- **Refresh tokens** are opaque random strings, persisted in Postgres
  (`refresh_tokens` table) as a SHA‑256 hash only — never the raw value,
  same principle as `password_hash`. Rotation is single‑use: redeeming
  one revokes it and links it (`replaced_by_token_id`) to the row minted
  in its place, so replaying an already‑rotated token is detectable and
  rejected.
- **Password reset** tokens live only in Redis
  (`pwdreset:{token}` → `user_id`, TTL = `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES`),
  single‑use, no user enumeration (same response whether or not the
  email exists). Completing a reset revokes every refresh token the
  user currently holds.
- There is deliberately **no self‑service change‑password endpoint** and
  no login lockout — the only way to get a new password is
  `forgot-password` → `reset-password`.

---

## Module 2 — User & Apartment Management (1.2)

Blocks, flats, and occupancy history are the building‑registration side
of the app; resident directory/profile edits are the staff‑facing side.

### The flat‑selection workflow

1. **Committee registers the building structure** —
   `POST /api/v1/blocks`, `POST /api/v1/flats` (Admin/Committee only).
2. **A resident picks a flat at signup.** The signup form resolves a
   typed flat number to a `flat_id` via
   `GET /api/v1/flats?block_id=..&flat_number=..` — deliberately
   **public**, since a not‑yet‑registered user has no token yet (same
   reasoning for `GET /api/v1/blocks`). Only structural data is
   returned there (no resident names). The backend still re‑validates
   the `flat_id` is real and currently unclaimed (`NotFound`/`Conflict`
   if not) — it never trusts the frontend's check alone. At this point
   it's just a *request*: no `occupancy_history` row exists yet, and
   the flat's `occupancy_status` hasn't changed.
3. **Verification IS the move‑in.** `POST /api/v1/auth/verify/{user_id}`
   calls `apartment_service.move_in()` the moment a Resident who picked
   a flat at signup gets verified — `move_in_date` is the moment of
   verification, not signup. Optionally pass
   `{"occupancy_type": "Owner"|"Rental"}`; defaults to `"Owner"`.
   Re‑verifying, or verifying someone an Admin already moved in
   manually, is a safe no‑op.
4. After that, `flat_id` is otherwise **read‑only** outside of
   `move_in()`/`move_out()` — an Admin/Committee transfers or moves a
   resident out via the dedicated endpoints below.

A flat can hold more than one current resident (family members) —
`occupancy_status` is derived as `"occupied"` iff *any* resident has a
current (`is_current=True`) `occupancy_history` row for that flat.

### Endpoints

**Blocks** (`/api/v1/blocks`)
- `POST /` (Admin/Committee)
- `GET /`, `GET /{block_id}` (public) — incl. computed `flat_count`
- `PATCH /{block_id}` (Admin/Committee) — refuses to shrink
  `total_flats` below the number of flats already registered
- `DELETE /{block_id}` (Admin/Committee) — refuses if it still has flats

**Flats** (`/api/v1/flats`)
- `POST /` (Admin/Committee) — refuses if the block is already at its
  `total_flats` allotment, or the number is taken in that block
- `GET /` (public, filters `block_id` / `flat_number` / `occupancy_status`)
- `GET /{flat_id}` (any authenticated role) — includes
  `current_residents` (names/phone/email), which is why this one isn't
  public
- `PATCH /{flat_id}` (Admin/Committee) — `occupancy_status` isn't
  editable here, it's derived

**Residents directory** (`/api/v1/residents`, Admin/Committee — distinct
from `/api/v1/residents/me/...`, which is a Resident managing their own
profile picture)
- `GET /` — filters `block_id`, `flat_id`
- `GET /{resident_id}` — full profile + flat/block
- `PATCH /{resident_id}` — edits `emergency_contact` /
  `alternate_phone` / `occupation` only (not `flat_id` — that's
  move‑in/move‑out only)
- `POST /{resident_id}/move-in` — `{flat_id, occupancy_type,
  move_in_date?}`
- `POST /{resident_id}/move-out` — `{move_out_date?}`
- `GET /{resident_id}/occupancy-history` — full move‑in/move‑out history

---

## Module 3 — Complaint Management (1.3)

### Categories

- `POST /api/v1/admin/complaint-categories` (Admin/Committee) — create
- `GET /api/v1/admin/complaint-categories` (Admin/Committee) — list
- `GET /api/v1/complaint-categories` (**any authenticated user**) —
  read‑only mirror so a resident can discover valid `category_id`
  values before filing a complaint, without needing the Admin‑only list.

### Complaints (`/api/v1/complaints`)

Ownership is enforced centrally (`_authorize_complaint_access`):
Admin/Committee can access anything; a Resident only their own; a
Maintenance staff member only complaints they're assigned to; everyone
else is refused.

- `POST /` (verified Resident) — resident_id is always the caller's own
  profile, never client‑supplied. Optional `image_urls`.
- `GET /` (any authenticated user) — scoped by role: Resident sees their
  own; Maintenance sees only complaints assigned to them (via their
  staff profile); Admin/Committee see everything.
- `GET /{complaint_id}` — ownership‑checked as above.
- `PATCH /{complaint_id}` — ownership‑checked. Residents may edit
  `description`/`priority` on their own complaint but can **never**
  set `status` directly (`NotAuthorized` if they try) — status only
  moves through `/assign` and the maintenance task endpoints below.
  Non‑Admin/Committee callers must follow the state machine:
  `open → assigned → in_progress → resolved → {closed, assigned}`;
  Admin or Committee can force any transition.
- `POST /{complaint_id}/assign` (Admin/Committee) — `{staff_id}`.
  Creates the `ComplaintAssignment`, flips `open → assigned`, and (this
  is what actually lets the assignee do anything) creates the
  `MaintenanceTask` row that drives the accept → schedule → start →
  complete workflow in Module 4.
- `POST /{complaint_id}/comments` — feedback + optional `1–5` rating;
  a rating is only accepted once the complaint is `resolved`.

---

## Module 4 — Maintenance Staff Management (1.4)

All under `/api/v1/maintenance/tasks`, all `require_verified_maintenance`
+ the caller's own `MaintenanceStaff` profile. A `MaintenanceTask` is
created automatically (`status="accepted"`) the moment a complaint is
assigned (Module 3); this router drives it the rest of the way.

- `GET /` — the caller's own tasks.
- `GET /{task_id}` — 403 if the task isn't assigned to the caller.
- `POST /{task_id}/schedule` — `{scheduled_at}`, sets a target time
  without changing status.
- `POST /{task_id}/start` — `accepted → in_progress`; also flips the
  parent complaint `assigned → in_progress`.
- `POST /{task_id}/complete` — `in_progress → completed`; also flips
  the parent complaint `in_progress → resolved` (sets `resolved_at`)
  and fires a `complaint_update` notification to the resident asking
  for feedback.

Each of `schedule`/`start`/`complete` enforces both the correct
starting status and that the task belongs to the caller.

---

## Module 5 — Visitor Management (1.5)

OTPs are 6‑digit numeric (`app/utils/otp.py`), generated with
`secrets.choice` and stored only as an HMAC‑SHA256 hash
(`OTP_HASH_SECRET`), compared with `hmac.compare_digest` (timing‑safe).
The raw OTP is returned exactly once, in the pre‑register response —
there's no SMS/email gateway wired up yet (same "not built yet" caveat
as billing's mocked payment gateway and committee‑creation's
returned‑not‑emailed initial password).

- `POST /api/v1/visitors/pre-register` (verified Resident) — looks up
  the visitor by phone (reuses the row if it already exists, otherwise
  creates one), creates a `VisitorRequest` with a hashed OTP, and
  returns the plaintext OTP for the resident to share.
- `GET /api/v1/visitors/requests` (verified Resident) — the caller's
  own requests only.
- `POST /api/v1/visitors/{request_id}/verify-otp` (verified Security) —
  verifies the OTP against the caller's own `SecurityGuard` profile
  (the log's `security_guard_id` is always whoever actually
  authenticated, never an arbitrary guard row), flips the request to
  `arrived`, creates the `VisitorLog` (`entry_time` = now), and
  notifies the resident (`visitor_arrival`). Rejects an already‑arrived
  or already‑denied request, and an incorrect OTP.
- `POST /api/v1/visitors/logs/{log_id}/exit` (verified Security) — sets
  `exit_time`; `Conflict` if exit was already logged.
- `GET /api/v1/visitors/logs` (**Admin only** — the one admin‑capable
  endpoint in this API that does *not* also accept Committee) — full
  visitor log.

---

## Module 6 — Facility Booking (1.6)

### Facilities (`/api/v1/admin/facilities`, Admin/Committee)
- `POST /`, `GET /`, `GET /{facility_id}`, `PATCH /{facility_id}`

### Bookings (`/api/v1/facility-bookings`)
- `POST /` (verified Resident) — `resident_id` is always the caller's
  own profile, never client‑supplied. Validated against the facility
  before anything is written:
  - facility must be `is_active`
  - `end_time > start_time`
  - the slot must fall within the facility's `opening_time`/
    `closing_time`
  - duration must not exceed `maximum_duration`
  - the slot can't be in the past
  - and it can't overlap an existing `booked` slot for that facility
    (`check_booking_conflict`)
  A confirmed booking notifies the resident (`booking_update`).
- `GET /` — Resident sees only their own bookings; every other role
  sees all.
- `GET /{booking_id}` — 403 if a Resident requests someone else's
  booking (guessing an id doesn't work).
- `PATCH /{booking_id}` (Admin/Committee) — e.g. cancelling. The
  date/time window and conflict checks are **only re‑run if
  date/time actually changed** in the patch, so a pure status update
  (like cancelling) isn't blocked by the slot now being "in the past".
  A status change notifies the resident.

---

## Module 7 — Communication & Notification (1.7)

Two things: admin/committee‑authored **announcements**, and the
per‑user **notification** inbox that every other module feeds. There is
deliberately no public "create a notification for an arbitrary user"
endpoint — notifications only ever originate from real events inside
`complaint_service`, `booking_service`, `visitor_service`,
`billing_service`, `auth_service`, and this module itself.

### Announcements (`/api/v1/announcements`)
- `POST /` (Admin/Committee) — also pushes the announcement into every
  Resident's notification inbox (`notify_all_residents`,
  `notification_type="announcement"`), not just the standalone list.
- `GET /` (any authenticated) — only Admin/Committee can pass
  `include_inactive=true` and actually see inactive/expired
  announcements; everyone else always gets the current, live list.
- `GET /{announcement_id}` (any authenticated)
- `PATCH /{announcement_id}`, `DELETE /{announcement_id}` (Admin/Committee)

### Notifications (`/api/v1/notifications`)
- `GET /` (any authenticated) — `unread_only` filter.
- `POST /{notification_id}/read`
- `POST /read-all`

### Notification types fired around the app

| `notification_type` | Fired by | When |
|---|---|---|
| `account_verified` | `auth_service.verify_user` | Committee verifies an account |
| `bill_generated` | `billing_service.create_bill` | A new bill is generated for a flat |
| `payment_success` | `billing_service.create_payment` | A payment succeeds |
| `complaint_update` | `complaint_service.assign_complaint` / `complete_task` | Complaint assigned / resolved |
| `booking_update` | `booking_service.create_booking` / `update_booking` | Booking confirmed / status changed |
| `visitor_arrival` | `visitor_service.verify_visitor_otp` | A pre‑registered visitor is checked in |
| `announcement` | `notification_service.create_announcement` | A new announcement is published |
| `poll` | `community_service.create_poll` | A new poll opens |

---

## Module 8 — Billing & Payment (1.8)

Money is `Decimal` everywhere (`Numeric(10, 2)` columns) — never
`float`, which can't represent currency exactly and would compound
errors across items/payments/summaries.

### Bills (`/api/v1/admin/bills`, Admin/Committee)
- `POST /` — if `items` are supplied, `amount` is **computed as their
  sum and the client‑supplied `amount` is ignored**; a top‑level
  `amount` is only used as‑is when there are no items (e.g. a flat
  maintenance fee with no line‑item breakdown). Notifies every resident
  of the flat (`bill_generated`).
- `GET /summary` — `total_billed`, `total_collected`,
  `total_outstanding`, `unpaid_bill_count` across every bill in the
  system.
- `GET /`, `GET /{bill_id}` — `flat_id` filter on the list.
- `PATCH /{bill_id}` — direct admin correction of `due_date`/`status`.

### My billing (`/api/v1/billing/me`, Resident)
- `GET /bills`, `GET /payments` — the caller's own flat's bills/payments
  (empty list if the resident has no `flat_id` yet).

### Payments & receipts (`/api/v1/payments`)

There's no real payment gateway wired up — `PaymentCreate.status` is
how the caller reports the outcome directly (`pending` / `success` /
`failed`), the same "mocked, not built yet" pattern as visitor OTP
delivery.

- `POST /` (verified Resident, or Admin/Committee) — ownership‑checked:
  a Resident may only pay a bill belonging to their own flat.
  `Conflict` if the bill is already `paid`, or if the
  `transaction_reference` has been used before. On `status="success"`:
  flips the bill to `paid`, **auto‑generates a `Receipt`** server‑side
  (`RCPT-{year}-{payment_id:06d}` — never client‑suppliable/spoofable),
  and notifies the resident (`payment_success`).
- `GET /` — Admin/Committee see everything (optional `bill_id` filter);
  a Resident sees only their own flat's payments.
- `GET /{payment_id}` — ownership‑checked the same way.
- `GET /{payment_id}/receipt` — ownership‑checked; 404 if the payment
  never succeeded (no receipt exists yet).

---

## Module 9 — Community Engagement (1.9)

### Polls (`/api/v1/polls`)
- `POST /` (Admin/Committee) — requires at least 2 options. Notifies
  every Resident (`poll`).
- `GET /` (any authenticated)
- `GET /{poll_id}` (any authenticated)
- `PATCH /{poll_id}` (Admin/Committee) — including `is_active`, which is
  a real column (see below).
- `POST /{poll_id}/vote` (verified Resident) — `{option_id}`. Rejected
  if the poll isn't `is_active`, or today is before `start_date` or
  after `end_date`, or the option doesn't belong to the poll, or (when
  `allow_multiple_votes` is false) the caller already voted.
- `GET /{poll_id}/results` (any authenticated) — per‑option vote counts
  + total, live at any point (not gated on the poll having ended).
  `anonymous` means votes aren't attributed to a voter in the data
  model — it doesn't hide the aggregate totals.

---

## Cross‑cutting notes

- **Everything server‑generated stays server‑generated.** Receipt
  numbers, OTPs (hashed at rest), refresh/reset tokens (hashed at
  rest), profile‑picture filenames, and `occupancy_status` are never
  accepted as client input — they're all derived or generated inside
  the service layer.
- **Ownership checks are centralized, not sprinkled per‑field.**
  Complaints (`_authorize_complaint_access`), bookings, and bill
  payments (`_assert_can_touch_bill`) each have one function that
  decides access, called from every endpoint that touches that
  resource, so a new endpoint can't accidentally skip the check.
- **"Verified" gates the resident‑facing write path, not read/login.**
  A brand‑new, unverified account can still log in and hit `GET /me`;
  it just can't file complaints, book facilities, pre‑register
  visitors, verify visitor OTPs, or vote until a Committee member
  verifies it.
- **IST timestamps are naive on purpose.** `ist_now()`
  (`app/models/mixins.py`) returns a naive datetime that numerically
  represents Asia/Kolkata wall‑clock time, matching the plain
  `TIMESTAMP WITHOUT TIME ZONE` columns actually stored in Postgres —
  comparisons against it (refresh‑token expiry, booking‑in‑the‑past
  checks, etc.) always use `ist_now()`, never a timezone‑aware
  datetime.

---

## Tables (`er-dbml.txt`)

`roles`, `users`, `refresh_tokens` · `blocks`, `flats`,
`resident_profiles`, `occupancy_history` · `maintenance_staff`,
`security_guards` · `complaint_categories`, `complaints`,
`complaint_images`, `complaint_assignments`, `maintenance_tasks`,
`complaint_comments` · `visitors`, `visitor_requests`, `visitor_logs` ·
`facilities`, `facility_bookings` · `maintenance_bills`, `bill_items`,
`payments`, `receipts` · `announcements`, `notifications` · `polls`,
`poll_options`, `poll_votes` · `ai_inference_logs`

`full_name` / `phone` / `is_active` / `is_verified` / `last_login` all
live on `users`, not duplicated onto the role‑specific profile tables.

---

## Running it

```bash
cp .env.example .env             # edit SECRET_KEY, DATABASE_URL, REDIS_URL, OTP_HASH_SECRET, etc.
pip install -r requirements.txt

python -m scripts.init_db        # creates all tables (no migration framework)
python -m scripts.seed           # seeds the 5 roles + bootstrap Admin

uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`, or:

```bash
curl -X POST localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neighbourly.com","password":"ChangeMe123!"}'
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

Profile picture upload:
```bash
curl -X POST localhost:8000/api/v1/residents/me/profile-picture \
  -H "Authorization: Bearer <resident access token>" \
  -F "file=@/path/to/photo.jpg"
```

Record a mocked bill payment:
```bash
curl -X POST localhost:8000/api/v1/payments \
  -H "Authorization: Bearer <resident access token>" \
  -H "Content-Type: application/json" \
  -d '{"bill_id":1,"amount":"2500.00","payment_method":"upi","transaction_reference":"txn_001","status":"success"}'
```

`GET /health` is unauthenticated and returns
`{"success": true, "data": {"status": "ok"}, "message": ""}` — useful
for container/load‑balancer health checks.

A note from Module 1, still true: your original `.env` had
`SUPER_ADMIN_EMAIL=superadmin@neighbourly.local` — `.local` is a
reserved special‑use TLD and pydantic's `EmailStr` (used on
`LoginRequest`) rejects it outright, so that account could be seeded
but never logged in. Use any non‑reserved‑TLD domain for `ADMIN_EMAIL`
in your real `.env`.

## On testing

No pytest suite ships in this snapshot. Every workflow above (auth/
token rotation, occupancy tracking, the complaint state machine, the
maintenance task lifecycle, visitor OTP verification, facility booking
conflict detection, billing/receipt generation, and poll voting) was
exercised manually against the real modules with lightweight in‑memory
stand‑ins for Postgres/Redis before delivery. Please run your own
end‑to‑end pass (`uvicorn` + real Postgres/Redis) before treating this
as production‑ready, and add pytest coverage per module as it stabilizes.

## Module 10 — AI Community Intelligence (1.10)

Backend APIs are implemented (Phase 1). Frontend wiring is a later phase.
Provider: **Groq** (OpenAI-compatible). Toggle with `AI_ENABLED` /
`GROQ_API_KEY` in `.env` (see `.env.example`).

Layering matches Modules 1–9:

| Piece | Path |
|---|---|
| Router | `app/routers/ai_router.py` (`/api/v1/ai`) |
| Staff directory | `maintenance_router.router_staff_admin` (`/api/v1/admin/maintenance-staff`) |
| Service | `app/services/ai_service.py` |
| Schemas | `app/schemas/ai_schema.py` |
| Model | `app/models/ai.py` → `ai_inference_logs` |
| Client / prompts | `app/utils/groq_client.py`, `app/utils/ai_prompts.py` |

### Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/v1/ai/complaints/classify` | Verified Resident, Admin, Committee | Suggests `category_id` + `priority`; does **not** create a complaint |
| `GET` | `/api/v1/admin/maintenance-staff` | Admin, Committee | Staff list + `open_task_count` |
| `GET` | `/api/v1/ai/complaints/{complaint_id}/staff-recommendations` | Admin, Committee | Ranked staff; human still assigns |
| `GET` | `/api/v1/ai/search?q=&limit=` | Any authenticated (role-scoped) | Complaints + announcements; optional Groq re-rank |
| `POST` | `/api/v1/ai/reports/complaints/summary` | Admin, Committee | SQL aggregates + LLM narrative; Redis cache |
| `POST` | `/api/v1/ai/chat` | Any authenticated (role-scoped context) | Grounded reply + citations; Redis rate limit |

If `AI_ENABLED=false` or Groq is misconfigured, AI routes return **503** in the
standard `{success, message}` envelope. Complaint create/assign never call Groq.

```bash
curl -X POST localhost:8000/api/v1/ai/complaints/classify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Water leaking from the bathroom ceiling for two days"}'
```

Recreate/add tables after pulling:

```bash
python -m scripts.init_db
```

Pytest (mocked Groq): `pytest tests/test_ai.py -q`
