# NYUAD Eats

A community-built directory of affordable restaurants in Abu Dhabi, made by and for NYU Abu Dhabi
students. Built around three ideas that existing apps (Google Maps, TripAdvisor, Beli) don't cover
well for this specific audience:

1. **Actual affordability**, not just a generic price filter — every restaurant carries a price tag
   computed from its average cost per person, anchored to the NYUAD meal swipe value (33 AED):
   *"Less than a meal swipe"*, *"Worth a Campus Card top-up"*, or *"Senior-year splurge"*.
2. **Shuttle-aware maps** — the map overlays NYUAD shuttle routes and stops so students without cars
   can see how far a restaurant actually is from a drop-off point, not just from campus as the crow flies.
3. **Open, low-barrier community input** — star ratings *and* NYUAD-specific "vibe tags" (e.g. "Would
   shuttle back for this", "Group dinner, split the bill"), plus per-dish likes, all gated only by an
   `@nyu.edu` login (no submission quotas like Beli).
4. **Verified-student content** — posting a review, dish, or restaurant requires confirming your
   `@nyu.edu` inbox with a 6-digit code, not just typing an `@nyu.edu`-shaped email, so reviews stay
   trustworthy. Browsing, liking dishes, and signing in don't require verification.

## Tech stack

- **Client**: React + Vite, Tailwind CSS v4 (NYUAD purple/white theme), React Router, Leaflet /
  OpenStreetMap for maps (no API key required).
- **Server**: Node + Express, SQLite (via `better-sqlite3`, a single-file DB — no external database
  to provision), JWT auth with bcrypt password hashing.

## Project structure

```
server/   Express API + SQLite database + seed script
client/   React + Vite frontend
```

## Running it locally

You'll need Node.js 18+.

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Seed the database (one-time; creates server/data/nyuad-eats.db)
cd ../server && npm run seed

# 3. Start the API (in one terminal)
npm run dev        # http://localhost:4000

# 4. Start the frontend (in another terminal)
cd ../client && npm run dev   # http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173. Sign up with any `@nyu.edu`-style email. No real email provider is wired
up yet, so after signup you'll land on `/verify-email` with your 6-digit verification code shown
directly on the page (also logged by the server as `[DEV] Verification code for ...`) — enter it to
unlock posting reviews, dishes, and restaurants. See "What's stubbed out" below for swapping this for
real email delivery.

To reseed from scratch, stop the server and delete `server/data/nyuad-eats.db*`, then run
`npm run seed` again.

## Feature tour

- **Explore page** (`/`) — map/list toggle, search, cuisine + price filters, happy-hour filter, and a
  shuttle-route overlay toggle.
- **Restaurant detail page** — price tag, star average, dishes with a like button, and reviews (star
  rating + optional NYUAD vibe tag + free text).
- **Add a spot** (`/add-restaurant`, requires a verified account) — community submission form with a
  click-to-pin map; new restaurants are marked **unverified** until the community reviews them.
- **Auth** (`/login`, `/signup`) — email/password, signup restricted to `@nyu.edu` addresses.
- **Email verification** (`/verify-email`) — a 6-digit code gate between signing up and posting
  content. Unverified accounts can browse and like dishes, but get a "verify your email" prompt (with
  a link straight to `/verify-email`) in place of the add-dish/review/add-restaurant forms, plus a
  site-wide reminder banner until they verify.

## Important: about the seed data

The 14 restaurants, prices, dishes, and shuttle stop/route coordinates in `server/src/db/seed.js` are
**illustrative demo data**, written to show the app working end-to-end — not a verified list from you
and your friends. Before treating this as a real launch:

- Replace or supplement the seed data with your own firsthand knowledge (the whole point of the app!),
  or simply delete the seed script's restaurants and let real signups populate it via "Add a spot".
- Replace the shuttle route/stop coordinates with the actual current NYUAD shuttle schedule and GPS
  stops from Campus Life — these change by semester and the seeded ones are approximate placeholders.

## What's stubbed out / next steps

- **Real email delivery**: verification codes are generated and gate posting correctly, but they're
  returned in the API response / logged to the server console instead of actually emailed (see
  `issueDevVerificationCode` in `server/src/routes/auth.js`). To send real email, swap that function
  for a call to a provider (e.g. Resend, SendGrid, Postmark) and stop returning `dev_verification_code`
  in the signup/resend API responses.
- **Photos**: the schema/UI don't yet support photo uploads for reviews or dishes; adding this would
  need an object storage provider (e.g. S3-compatible) since this is a single-server demo.
- **"Verify" workflow**: restaurants submitted via "Add a spot" start `unverified`; there's no admin/
  moderator UI yet to explicitly mark one verified beyond it accumulating community reviews.
- **Profile page**: there's no "my reviews / saved restaurants" page yet.
- **Deployment**: this runs as two local dev servers. For real deployment, build the client
  (`npm run build` in `client/`) and serve the static output behind the same domain/proxy as the API,
  and swap the SQLite file for a persistted volume or a hosted Postgres if you expect concurrent writes
  at scale.

## API overview

All endpoints are under `/api`. Auth uses `Authorization: Bearer <token>` from `/api/auth/login` or
`/api/auth/signup`. "verified" in the Auth column means `requireAuth` *and* a verified email
(`requireVerified`); "required" means `requireAuth` only.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | – | Create account (`@nyu.edu` only); returns `dev_verification_code` |
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
