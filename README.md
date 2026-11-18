# AD Bites

_(Formerly "NYUAD Eats" — renamed, same project.)_

A community-built directory of affordable restaurants in Abu Dhabi, made by and for NYU Abu Dhabi
students. Built around ideas that existing apps (Google Maps, TripAdvisor, Beli) don't cover well for
this specific audience:

1. **Actual affordability**, not just a generic price filter — every restaurant carries a price tag
   computed from its average cost per person, anchored to the NYUAD meal swipe value (33 AED):
   *"Less than a meal swipe"*, *"Worth a Campus Card top-up"*, or *"Senior-year splurge"*.
2. **Shuttle-aware details** — each restaurant's page shows its distance from the nearest NYUAD
   shuttle stop, with one tap to get directions there.
3. **Open, low-barrier community input** — star ratings *and* NYUAD-specific "vibe tags" (e.g. "Would
   shuttle back for this", "Group dinner, split the bill"), plus per-dish likes, gated only by an
   `@nyu.edu` login (no submission quotas like Beli).
4. **Verified-student content** — posting a review requires confirming your `@nyu.edu` inbox with a
   6-digit code, not just typing an `@nyu.edu`-shaped email, so reviews stay trustworthy. Browsing and
   liking dishes don't require verification, just login.

## Tech stack

- **Client**: Vite + React + TypeScript, installable as a PWA (`vite-plugin-pwa`), plain CSS using a
  token system (see `CLAUDE.md`) rather than a framework, React Router, Leaflet / OpenStreetMap for
  the map (no API key required).
- **Server**: Node + Express, SQLite via `@libsql/client` — a local file in dev, a hosted
  [Turso](https://turso.tech) database in production — JWT auth with bcrypt password hashing.

## Project structure

```
server/   Express API + SQLite database + seed script
client/   Vite + React + TypeScript PWA frontend
```

See `CLAUDE.md` for the design token system, routing structure, and backend integration details.

## Running it locally

You'll need Node.js 18+. Both the server and client need to run together.

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Seed the database (optional — the server also does this on first start; creates server/data/nyuad-eats.db)
cd ../server && npm run seed

# 3. Start the API (in one terminal)
npm run dev        # http://localhost:4000

# 4. Start the frontend (in another terminal)
cd ../client && npm run dev   # http://localhost:5173 (or next free port), proxies /api to :4000
```

Open the client URL it prints. Sign up with any `@nyu.edu`-style email. Locally, with no `SMTP_USER`/`SMTP_PASS`
in `server/.env`, no email is sent: after signup you'll land on `/verify-email` with your 6-digit verification code shown
directly on the page (also logged by the server as `[DEV] Verification code for ...`) — enter it to
unlock liking dishes and posting reviews. Set `SMTP_USER`/`SMTP_PASS` to send real emails locally too.

To reseed from scratch, stop the server and delete `server/data/nyuad-eats.db*`, then run
`npm run seed` again.

## Deploying to Vercel

The frontend and the API deploy together as one Vercel project (the API runs as a serverless function
at `/api`). The database is hosted on Turso, since Vercel functions can't keep a local SQLite file.

1. Create a free database at [turso.tech](https://turso.tech), then copy its **database URL**
   (`libsql://…`) and create an **auth token**.
2. At [vercel.com/new](https://vercel.com/new), import this GitHub repo. Leave **Root Directory** as
   the repo root (`./`) and leave the framework/build settings alone; the root `vercel.json` sets them.
3. Add these environment variables before deploying:
   - `TURSO_DATABASE_URL`: the `libsql://…` URL
   - `TURSO_AUTH_TOKEN`: the token
   - `JWT_SECRET`: any long random string (e.g. `openssl rand -hex 32`)
   - `SMTP_USER` / `SMTP_PASS`: the Gmail address that sends verification codes, and a Google
     [app password](https://myaccount.google.com/apppasswords) for it (needs 2-Step Verification on)
4. Deploy. The first API request creates the tables and loads the demo restaurants automatically.

## Feature tour

- **Explore screen** (`/`) — a real map of all restaurants plus a searchable list below it; tap a
  marker or a list row to open its detail screen.
- **Restaurant detail screen** (`/restaurants/:id`) — price tag, a "Getting there" card (distance from
  the nearest shuttle stop, tap for directions), a happy-hours bar when one exists, must-try dishes
  with a like button, and community tips (reviews: star rating + optional NYUAD vibe tag + free text).
- **Auth** (`/login`, `/signup`) — email/password, signup restricted to `@nyu.edu` addresses.
- **Email verification** (`/verify-email`) — a 6-digit code gate between signing up and posting a
  review. Unverified accounts can browse and like dishes, but get a "verify your email" prompt in
  place of the review form until they do.

Not built yet: submitting a new restaurant, a "Saved"/"Profile" screen or bottom nav (a design mockup
exists for this — see `restaurant-detail.png` — but it isn't wired up), and the shuttle-route overlay
on the map (the old prototype had one; the current map shows restaurant pins only).

## Important: about the seed data

The 14 restaurants, prices, dishes, and shuttle stop/route coordinates in `server/src/db/seed.js` are
**illustrative demo data**, written to show the app working end-to-end — not a verified list from you
and your friends. Before treating this as a real launch, replace it with your own firsthand knowledge
(the whole point of the app!) and the actual current NYUAD shuttle schedule/GPS stops from Campus
Life — these change by semester and the seeded ones are approximate placeholders.

## What's stubbed out / next steps

- **Email sender**: verification codes go out through a Gmail account (SMTP + app password, ~500
  emails/day). For a custom from-address and better deliverability, point `SMTP_HOST`/`SMTP_USER`/
  `SMTP_PASS`/`EMAIL_FROM` at a provider like Resend with your own domain.
- **Submitting a new restaurant**: the API supports it (`POST /restaurants`, starts `unverified`), but
  there's no client screen for it yet.
- **"Saved" and "Profile" screens**: no backend endpoint for saving a restaurant exists yet (the
  bookmark button on the detail screen is local-only, doesn't persist), and there's no profile screen.
- **Per-user "already liked" state**: `GET /restaurants/:id` doesn't say whether the current user has
  already liked each dish, so the heart always starts unfilled even across sessions — see `CLAUDE.md`.
- **Photos**: no photo uploads for reviews or dishes; would need an object storage provider.

## API overview

All endpoints are under `/api`. Auth uses `Authorization: Bearer <token>` from `/api/auth/login` or
`/api/auth/signup`. "verified" in the Auth column means `requireAuth` *and* a verified email
(`requireVerified`); "required" means `requireAuth` only.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | – | Create account (`@nyu.edu` only); emails a verification code (returns `dev_verification_code` instead in local dev without SMTP) |
| POST | `/auth/login` | – | Log in |
| GET | `/auth/me` | required | Current user (includes `email_verified`) |
| POST | `/auth/verify` | required | Confirm the 6-digit code to set `email_verified = true` |
| POST | `/auth/resend-verification` | required | Issue a new code (unverified accounts only) |
| GET | `/restaurants` | – | List/filter restaurants (`q`, `cuisine`, `maxPrice`, `happyHour`) |
| GET | `/restaurants/cuisines` | – | Distinct cuisine list for the filter dropdown |
| GET | `/restaurants/:id` | – | Restaurant detail + reviews |
| POST | `/restaurants` | verified | Submit a new restaurant (starts unverified) |
| POST | `/restaurants/:id/dishes` | verified | Add a dish |
| POST | `/dishes/:id/like` | required | Toggle a like on a dish |
| POST | `/restaurants/:id/reviews` | verified | Post a review (stars + optional vibe tag + text) |
| GET | `/phrases` | – | List of NYUAD vibe tags for the review form |
| GET | `/shuttles` | – | Shuttle routes (with path coordinates) + stops |
