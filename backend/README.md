# Neighbourly Backend — Module 1: Authentication & Authorization

Built directly on top of the files you uploaded (`app/core/*`, `app/models/*`,
`app/utils/security.py`, `app/utils/password.py`, `app/dependencies.py`,
`main.py`, `init_db.py`) rather than a rewrite. Everything below either
came from those files as-is, fixes a bug found in them, or fills in what
was missing (schemas/services/routers/seed).

**Schema source of truth: `er-dbml.txt`, followed literally.** The SDD
is used only for *workflow* framing, not table structure.

## This round's changes

1. **Refresh tokens moved from Redis-only to Postgres.** New
   `refresh_tokens` table (`app/models/refresh_token.py`) stores a
   SHA-256 hash of each refresh token (never the raw value, same
   principle as `password_hash`), plus `expires_at`, `revoked`/
   `revoked_at`, and `replaced_by_token_id` so a rotation chain is
   reconstructable. Redis is now used only for the short-lived
   password-reset token. Rotation is still single-use: redeeming a
   token revokes it and links it to whatever replaced it, so replaying
   an already-rotated token is rejected.
   Run `python -m scripts.init_db` again to create the new table --
   `create_all()` only adds missing tables, it won't touch your
   existing ones.

2. **Response envelope restructured.**
   `app/utils/envelope.py` → `app/utils/api_response.py`, success shape
   is now `{ "success": true, "data": {...}, "message": "" }`. Every
   router endpoint calls `success_response(...)` explicitly.

3. **Error envelope restructured.**
   `app/utils/errors.py` → `app/utils/api_error.py`, shape is now
   `{ "success": false, "message": "..." }`. As part of this I also
   swept `app/dependencies.py` and `app/services/auth_service.py`,
   which had previously been raising raw FastAPI `HTTPException`
   in places instead of `AppError` -- those now consistently raise
   `AppError` subclasses (`BadRequest`, `InvalidCredentials`,
   `NotAuthenticated`, `Deactivated`, `NotAuthorized`, `NotFound`,
   `Conflict`, `ValidationFailed`, `ServerError`) so every error path
   goes through the same envelope. `main.py` also now registers a
   handler for the base Starlette/FastAPI `HTTPException` as a safety
   net -- without it, `OAuth2PasswordBearer`'s automatic 401 (when no
   `Authorization` header is sent) or a 404 on an unknown route would
   still leak out in the old `{"detail": ...}` shape.
   Validation errors (422) still carry field-level detail, under an
   additional `errors` key alongside `success`/`message`.

4. **Resident profile picture upload.** `resident_profiles.profile_image`
   already existed in `er-dbml.txt`; this is what actually populates it.
   - `POST /api/v1/residents/me/profile-picture` (multipart form, field
     name `file`) -- Resident-only. Validates JPEG/PNG/WEBP by sniffing
     the actual file bytes (not just the declared Content-Type), caps
     uploads at 5 MB (enforced via bounded chunked reads, not a
     read-then-check), generates its own filename (no path-traversal
     surface from a client-supplied name), and replaces any previous
     picture.
   - `DELETE /api/v1/residents/me/profile-picture` -- removes it.
   - Files are stored under `MEDIA_ROOT` (default `media/`) and served
     statically at `MEDIA_URL` (default `/media`); both are configurable
     via `.env`. `GET /api/v1/auth/me` already returns the current
     `profile_image` URL as part of `resident_profile`.
   - New dependency: `python-multipart` (required by FastAPI to parse
     `multipart/form-data`) -- added to `requirements.txt`.

## Tables (er-dbml.txt)

- `roles` — role_id, role_name
- `users` — user_id, role_id, full_name, phone, email, password_hash, is_active, is_verified, last_login, created_at, updated_at
- `blocks` — block_id, block_name, total_flats *(Module 2)*
- `flats` — flat_id, block_id, flat_number, floor_number, flat_type, occupancy_status *(Module 2, derived status)*
- `resident_profiles` — resident_id, user_id, flat_id, emergency_contact, alternate_phone, occupation, profile_image, created_at, updated_at
- `occupancy_history` — occupancy_id, resident_id, flat_id, occupancy_type, move_in_date, move_out_date, is_current, created_at, updated_at *(Module 2)*
- `maintenance_staff` — staff_id, user_id, specialization, experience_years, is_available, created_at, updated_at
- `security_guards` — guard_id, user_id, gate_assigned, shift, created_at, updated_at
- `refresh_tokens` — token_id, user_id, token_hash, issued_at, expires_at, revoked, revoked_at, replaced_by_token_id

full_name / phone / is_active / is_verified / last_login all live on
`users` per `user.py` — not duplicated onto the profile tables.

## The workflow

- **Admin is seeded** (`scripts/seed.py`) — never created through the API.
- **Admin creates Committee** — `POST /api/v1/auth/register-committee`
  (Admin-only). Generates a password, returns it in the response (same
  "no email service yet" caveat as before). Committee accounts are
  auto-verified (`is_verified=True`) since they're admin-provisioned, not
  part of the self-signup flow.
- **Resident / Maintenance / Security self-register** —
  `POST /api/v1/auth/signup`, no auth required. They pick their own
  password and start with `is_verified=False`.
- **`is_active` and `is_verified` are independent.** A freshly
  self-registered user can log in immediately (`is_active=True` from
  creation) — `is_verified` is a separate flag for later modules
  (complaints, bookings, etc.) to check before granting full access.
  Login and `/me` both surface `is_verified` so the frontend can show a
  "pending verification" state.
- **Committee verifies**: `GET /api/v1/auth/pending-verifications` lists
  unverified Resident/Maintenance/Security accounts;
  `POST /api/v1/auth/verify/{user_id}` flips `is_verified` to `True`.
  Scoped to `require_committee` only, per your spec — Admin is
  deliberately refused on `/verify` too (tested). Say the word if you'd
  rather Admin have that power as well.

## What I added (wasn't in your files yet, or added this round)

- `app/utils/redis_client.py` — password-reset token storage.
- `generate_opaque_token()` / `hash_token()` in `security.py` — for
  refresh/reset tokens and hashing them at rest. Your existing
  `create_access_token`/`verify_access_token` (PyJWT) are untouched.
- `app/schemas/`, `app/services/auth_service.py`, `app/routers/auth.py`.
- `app/models/refresh_token.py`, `app/services/profile_service.py`,
  `app/routers/profile.py` *(new this round)*.
- `scripts/seed.py` — seeds the 5 roles + bootstrap Admin.

## Removed on earlier request (still gone)

No self-service change-password endpoint, no login lockout. The only way
to get a new password is `forgot-password` → `reset-password`.

## A real bug this surfaced: don't use `.local` for `ADMIN_EMAIL`

Your original `_env` had `SUPER_ADMIN_EMAIL=superadmin@neighbourly.local`.
`.local` is a reserved special-use TLD, and `pydantic`'s `EmailStr` (used
on the login request schema) rejects it outright. You could seed that
admin account fine, but the login API would 422 on it forever. Changed
the example to `admin@neighbourly.com` in `.env.example` — use any
non-reserved-TLD domain in your real `.env`.

## A quirk worth knowing about, not a bug

Your `role.py` uses `Column(Enum(RoleEnum), ...)`. SQLAlchemy's default
behavior for a native Python `Enum` column is to persist the member's
`.name` ("ADMIN", "COMMITTEE", ...) to the database, not its `.value`
("Admin", "Committee", ...) — confirmed by inspecting the actual seeded
table. This happens to match the ALL-CAPS convention in er-dbml.txt's own
comment (`// ADMIN, COMMITTEE, RESIDENT, SECURITY, MAINTAINANCE`), so
left as-is. Everywhere in the API (JWT payload, `/me`, etc.) uses
`.value` ("Admin") for the human-readable form — only the raw DB column
looks like "ADMIN" if you inspect it directly.

One correction from that same comment: `MAINTAINANCE` looks like a typo
for `MAINTENANCE` (which is what `RoleEnum.MAINTENANCE` and every table
name, like `maintenance_staff`, actually use) — spelled correctly
throughout the code.

## Endpoints

`POST /register-committee` (Admin), `POST /signup` (public),
`POST /login`, `POST /refresh`, `POST /logout`, `POST /forgot-password`,
`POST /reset-password`, `GET /me`,
`GET /pending-verifications` (Committee), `POST /verify/{user_id}` (Committee),
`POST /residents/me/profile-picture` (Resident), `DELETE /residents/me/profile-picture` (Resident)

## Running it

```bash
cp .env.example .env             # edit SECRET_KEY, DATABASE_URL, REDIS_URL
pip install -r requirements.txt

python -m scripts.init_db        # creates/updates tables (no migration framework)
python -m scripts.seed           # seeds the 5 roles + bootstrap Admin

uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`, or:

```bash
curl -X POST localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neighbourly.com","password":"ChangeMe123!"}'
```

Response now looks like:

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

## On testing

No pytest shipped (per your earlier simplification request). This
round's changes (refresh-token issuance/rotation/reuse-rejection/
expiry/revocation, the new response/error envelopes, and the profile
picture upload's content sniffing / size cap / replace-and-delete
behavior) were exercised against the real modules with lightweight
in-memory stand-ins for Postgres/Redis before delivery, not kept in the
repo. Please still run your own end-to-end pass (`uvicorn` + real
Postgres/Redis) before treating this as production-ready.

## Module 2 — User & Apartment Management

Covers component design doc section 1.2 in full: blocks, flats, resident
directory, resident profile edits by staff, and move-in/move-out
occupancy tracking. `blocks`, `flats`, and `occupancy_history` were
already in `er-dbml.txt` (Module 1 called this out as what
`resident_profiles.flat_id` was waiting on) -- this module is what
actually populates and maintains them.

### The flat-selection workflow (revised from the original plan)

Originally I had signup accept no `flat_id` at all, forcing every
assignment through an Admin/Committee-driven move-in after the fact.
Revised per your direction to a more realistic flow instead:

1. **Committee registers the building structure first** --
   `POST /api/v1/blocks`, `POST /api/v1/flats` (Admin/Committee only).
2. **A resident picks their flat at signup.** The signup form lets them
   type a flat number; the frontend resolves it to a `flat_id` by
   calling `GET /api/v1/flats?block_id=..&flat_number=..` -- **this
   endpoint (and `GET /api/v1/blocks`) is deliberately public**, since a
   not-yet-registered user has no token yet. Only structural data is
   returned there (flat number/floor/type/status) -- no resident names,
   so nothing sensitive leaks. `POST /api/v1/auth/signup` then stores
   that `flat_id` on `resident_profiles` immediately, but backend
   re-validates it's a real flat (`NotFound` if not) -- never trust the
   frontend's check alone. At this point it's still just a *request*:
   no `occupancy_history` row exists yet, and the flat's
   `occupancy_status` hasn't changed.
3. **Verification IS the move-in.** When a Committee member calls
   `POST /api/v1/auth/verify/{user_id}`, if that user is a Resident who
   picked a `flat_id` at signup, this is now the moment
   `apartment_service.move_in()` actually runs: it creates the
   `occupancy_history` row (`move_in_date` = the moment of verification,
   not signup) and flips the flat to `occupied`. Optionally pass
   `{"occupancy_type": "Owner"|"Rental"}` in the verify request body;
   defaults to `"Owner"` if omitted. Re-verifying (or verifying someone
   an Admin already moved in manually beforehand) is a safe no-op, not a
   duplicate move-in.
4. **After that**, an Admin/Committee can still transfer or move a
   resident out at any time via the dedicated endpoints below --
   `resident_profiles.flat_id` is otherwise treated as read-only outside
   of `apartment_service.move_in()`/`move_out()`.

A flat can hold more than one current resident (family members) --
`occupancy_status` is derived as "occupied" iff *any* resident has a
current (`is_current=True`) `occupancy_history` row for that flat, not
tied to a single occupant.

### New endpoints

**Blocks** (`/api/v1/blocks`)
- `POST /` (Admin/Committee) -- create
- `GET /`, `GET /{block_id}` (public) -- list/detail, incl. computed `flat_count`
- `PATCH /{block_id}` (Admin/Committee) -- rename / resize; refuses to
  shrink `total_flats` below the number of flats already registered
- `DELETE /{block_id}` (Admin/Committee) -- refuses if it still has flats

**Flats** (`/api/v1/flats`)
- `POST /` (Admin/Committee) -- create; refuses if the block is already
  at its `total_flats` allotment, or the flat_number is already taken in
  that block
- `GET /` (public, filters: `block_id`, `flat_number`, `occupancy_status`)
- `GET /{flat_id}` (authenticated, any role) -- includes
  `current_residents` (names/phone/email), which is why this one isn't
  public
- `PATCH /{flat_id}` (Admin/Committee) -- `occupancy_status` isn't
  editable here, it's derived

**Residents** (`/api/v1/residents`, Admin/Committee -- distinct from
`/api/v1/residents/me/...` in Module 1, which is a Resident managing
their own profile picture)
- `GET /` -- directory (filters: `block_id`, `flat_id`)
- `GET /{resident_id}` -- single resident's full profile + flat/block
- `PATCH /{resident_id}` -- edit `emergency_contact`/`alternate_phone`/
  `occupation` (not `flat_id` -- that's move-in/move-out only)
- `POST /{resident_id}/move-in` -- assign/transfer to a flat
  (`{flat_id, occupancy_type, move_in_date?}`); auto-closes any existing
  current occupancy as a transfer rather than erroring
- `POST /{resident_id}/move-out` -- close out their current occupancy
  (`{move_out_date?}`)
- `GET /{resident_id}/occupancy-history` -- full move-in/move-out history

## Next module

Module 3 — Complaint Management (component design doc section 1.3):
`complaint_categories`, `complaints`, `complaint_images`,
`complaint_assignments`, `maintenance_tasks`, `complaint_comments` are
all already in `er-dbml.txt`, waiting on this module.