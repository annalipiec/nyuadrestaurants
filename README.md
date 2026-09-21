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

Open http://localhost:5173. Sign up with any `@nyu.edu`-style email (the domain check is real, but
no verification email is sent yet — see "What's stubbed out" below).

To reseed from scratch, stop the server and delete `server/data/nyuad-eats.db*`, then run
`npm run seed` again.

## Feature tour

- **Explore page** (`/`) — map/list toggle, search, cuisine + price filters, happy-hour filter, and a
  shuttle-route overlay toggle.
- **Restaurant detail page** — price tag, star average, dishes with a like button, and reviews (star
  rating + optional NYUAD vibe tag + free text).
- **Add a spot** (`/add-restaurant`, requires login) — community submission form with a click-to-pin
  map; new restaurants are marked **unverified** until the community reviews them.
- **Auth** (`/login`, `/signup`) — email/password, signup restricted to `@nyu.edu` addresses.

## Important: about the seed data

The 14 restaurants, prices, dishes, and shuttle stop/route coordinates in `server/src/db/seed.js` are
**illustrative demo data**, written to show the app working end-to-end — not a verified list from you
and your friends. Before treating this as a real launch:

- Replace or supplement the seed data with your own firsthand knowledge (the whole point of the app!),
  or simply delete the seed script's restaurants and let real signups populate it via "Add a spot".
- Replace the shuttle route/stop coordinates with the actual current NYUAD shuttle schedule and GPS
  stops from Campus Life — these change by semester and the seeded ones are approximate placeholders.

## What's stubbed out / next steps

- **Email verification**: signup checks the `@nyu.edu` domain but doesn't send a confirmation email —
  wire up an email provider (e.g. SendGrid/Postmark) if you want to confirm real inboxes.
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
`/api/auth/signup`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | – | Create account (`@nyu.edu` only) |
| POST | `/auth/login` | – | Log in |
| GET | `/auth/me` | required | Current user |
| GET | `/restaurants` | – | List/filter restaurants (`q`, `cuisine`, `maxPrice`, `happyHour`) |
| GET | `/restaurants/cuisines` | – | Distinct cuisine list for the filter dropdown |
| GET | `/restaurants/:id` | – | Restaurant detail + reviews |
| POST | `/restaurants` | required | Submit a new restaurant (starts unverified) |
| POST | `/restaurants/:id/dishes` | required | Add a dish |
| POST | `/dishes/:id/like` | required | Toggle a like on a dish |
| POST | `/restaurants/:id/reviews` | required | Post a review (stars + optional vibe tag + text) |
| GET | `/phrases` | – | List of NYUAD vibe tags for the review form |
| GET | `/shuttles` | – | Shuttle routes (with path coordinates) + stops |
