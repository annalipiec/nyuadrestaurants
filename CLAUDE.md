# CLAUDE.md

Guidance for Claude Code sessions working in this repo.

## Project

NYUAD Eats — a PWA for NYU Abu Dhabi students to discover affordable restaurants near campus:
shuttle directions, must-try dishes, and community tips.

## Structure

```
client/   Vite + React + TypeScript PWA (the active frontend)
server/   Express + SQLite API from an earlier iteration of this project
```

`client/` was rebuilt from scratch as a TypeScript PWA, then wired up to `server/`'s API (see
"Backend integration" below). Both must be running for the app to work in dev — `server/` on `:4000`,
`client/` via `vite dev` (proxies `/api` to `:4000`).

## Backend integration

- `client/vite.config.ts` proxies `/api` → `http://localhost:4000` in dev. In production this proxy
  doesn't exist — whatever hosts the built client needs to either serve the API from the same origin
  or this needs a real API base URL / CORS setup. Not solved yet.
- `client/src/api/` is the typed API layer: `client.ts` (axios instance + JWT token storage in
  `localStorage`, key `nyuad_eats_token`), `types.ts` (mirrors server response shapes — keep in sync
  with `server/src/routes/*.js`), `restaurants.ts`, `auth.ts`, `shuttles.ts`.
- Auth: `src/context/AuthContext.tsx` holds the current `User` and exposes `signup`/`login`/`logout`/
  `verifyEmail`/`resendVerification`. Mirrors the server's nyu.edu-only signup + dev-mode email
  verification (code shown on screen, not actually emailed — see `server`'s own CLAUDE-equivalent
  notes / `issueDevVerificationCode` in `server/src/routes/auth.js`).
- **Known gap**: liking a dish calls `POST /api/dishes/:id/like`, but `GET /api/restaurants/:id`
  doesn't return whether *this* user already liked each dish — so the heart always starts unfilled
  client-side, even if you'd liked it in a previous session. Fix requires a server change (join against
  `dish_likes` for the current user) if this needs to be accurate.
- "Saved" is **localStorage only** (`src/context/SavedContext.tsx`, key
  `nyuad_eats_saved_restaurant_ids`) — there is no backend endpoint for it, and `SavedScreen` works by
  fetching *all* restaurants and filtering client-side (no "get restaurants by id" endpoint exists).
  Don't assume saves sync across devices/browsers.

## Routing

`react-router-dom`, `BrowserRouter` set up in `main.tsx`. Four bottom-nav tabs share chrome via
`MainTabsLayout` (nested under one `<Route>` in `App.tsx`, rendered via `<Outlet/>`), plus standalone
routes outside that layout:

- `/` — `MapScreen`: real Leaflet map + pins only, **no list** — this is the default landing tab.
- `/explore` — `ExploreListScreen`: search + list only, **no map**. Shares row rendering
  (`RestaurantRow.tsx`) and styles (`RestaurantList.css`) with `SavedScreen`.
- `/saved` — `SavedScreen`: restaurants saved via `SavedContext`, same row component.
- `/profile` — `ProfileScreen`: account info + log out when signed in; login/signup prompt otherwise.
- `/restaurants/:id` — `RestaurantDetailScreen` (outside `MainTabsLayout`, no bottom nav): real
  restaurant data, dish likes, reviews ("tips"). The back button does `navigate(-1)`, not a fixed
  route, so it returns wherever the user came from. Renders in one of two visual modes (see
  "Map-stays-visible overlay" below) — don't assume it always has the illustrated header.
- `/login`, `/signup`, `/verify-email` — auth screens, styled to match (`AuthScreens.css`), gate the
  write actions (reviews, dishes, new restaurants need a verified email; dish likes just need login).

**If you add a new screen that links to a restaurant** (a 5th tab, etc.), pass
`state={{ backgroundLocation: location }}` the same way the existing tabs do, or it'll fall back to
the full-page (non-overlay) render instead of the sheet-over-content one.

### Map-stays-visible overlay

Opening a restaurant from any tab (a map pin, a list row) does **not** navigate away from that tab —
`RestaurantDetailScreen` instead slides up as a bottom sheet on top of it (and on top of the bottom
nav), dimmed backdrop behind, the tab still fully mounted and interactive-state-preserved underneath
(zoom/pan/search query survive opening and closing the sheet). This is react-router's standard
"background location" modal pattern, implemented in `App.tsx`:

- Every `<Link>` that opens a restaurant passes `state={{ backgroundLocation: location }}` (see
  `MapScreen.tsx`, `RestaurantRow.tsx` — used by both `ExploreListScreen` and `SavedScreen`).
- `App.tsx` renders the main `<Routes>` (including the `MainTabsLayout` nested routes) using that
  `backgroundLocation` when present, so it keeps showing whichever tab you were on instead of
  switching to the restaurant route, then renders a **second** `<Routes>` for just the restaurant
  route, wrapped in `DetailOverlay` (fixed backdrop + dismiss-on-backdrop-click), on top of everything
  — including the bottom nav, which `DetailOverlay`'s `z-index` covers.
- `RestaurantDetailScreen` takes an `embedded` prop for this: `embedded` skips the illustrated
  `MapHeaderGraphic` header entirely (the real map behind it already shows the location) and shows a
  lightweight close/share control row at the top of the sheet instead; the sheet becomes
  height-constrained (`max-height: 88vh`) and scrolls internally rather than using page scroll.
- **A direct visit to `/restaurants/:id`** (a shared link, a page refresh while on that route) has no
  `backgroundLocation` in its router state, so it falls through to a plain, non-embedded, full-page
  render — the original illustrated-header standalone screen. This is intentional: there's no map
  mounted to show as a backdrop in that case.
- If you add a new place that links to a restaurant, remember to pass `backgroundLocation` the same
  way, or it'll fall back to the full-page (non-overlay) render instead of the sheet-over-map one.

## Design tokens

Single source of truth: `client/src/styles/tokens.css`. CSS custom properties switch automatically
on `prefers-color-scheme` — there is no manual theme toggle. If one gets added later, it should still
read/write these same token names so this file stays the one place colors are defined.

| Token | Light | Dark |
|---|---|---|
| `--color-text` | `#1a022a` | `#ffffff` |
| `--color-text-muted` | `#4e057e` | `#cdb5dd` |
| `--color-accent` | `#57068c` | `#ab83c6` |
| `--color-accent-strong` | `#681f98` | `#57068c` |
| `--color-surface` | `#ffffff` | `#1a022a` |
| `--color-card` | `#f1e9f7` | `#2b0346` |
| `--color-border` | `#cdb5dd` | `#4e057e` |
| `--color-map-land` | `#f3eef7` | `#2b0346`* |
| `--color-map-water` | `#cdb5dd` | `#4e057e`* |
| `--color-on-accent` | `#ffffff` | `#ffffff` (same in both) |
| `--color-scrim` | `rgba(26,2,42,.45)` | same (same in both) |

\* Dark-mode map colors were never specified in the original design spec (only light-mode values were
given). The dark values above are a placeholder guess, not confirmed. **Before building the map
screen, confirm real dark-mode map land/water colors** and update both `tokens.css` and this table.

**Rules for any new UI:**
- Never hardcode a hex color in a component. Reference the CSS custom property
  (`var(--color-accent)`, etc.) so light/dark both stay correct automatically.
- If a new semantic color is needed, add it to `tokens.css` under both the `:root` block and the
  `prefers-color-scheme: dark` block, and add a row to the table above.
- **`--color-accent` vs `--color-accent-strong` — this distinction matters and is easy to get backwards:**
  - `--color-accent-strong` is for **solid fill backgrounds only** (a filled bar/pill, an icon badge).
    It stays a dark/medium-dark purple in both themes. Pair it with `--color-on-accent` for the
    foreground content on top of it.
  - `--color-accent` is for **foreground content sitting on a surface/card background** — icon colors,
    link text, borders, "ink" in an illustration. It's specifically tuned per theme (dark purple on
    light, light lavender on dark) to stay legible against `--color-surface`/`--color-card`.
  - Using `--color-accent-strong` as a foreground color on a surface/card will look fine in light mode
    and then fail contrast in dark mode (both themes' accent-strong are dark, so dark-on-dark). This
    exact bug has happened **twice** already across `RestaurantDetailScreen`/`ExploreMapScreen` (most
    recently: a reused CSS class for both a review's star rating and its "vibe tag" text) — caught both
    times by screenshotting dark mode, never by the type checker or linter. **Always screenshot both
    themes** when styling anything new, and grep for `color-accent-strong` used as a `color:`/
    `border-color:` (not `background-color:`) before calling a change done.
  - One legitimate exception: a map pin/marker drawn on top of real map tile imagery (not one of our
    surface/card tokens) — see `restaurantMarkerIcon.ts`. There, a single consistent brand-purple pin
    regardless of theme is correct, since the backdrop is external tile imagery, not app chrome.

## Typography

- Font: **Figtree**, loaded as a self-hosted variable font via `@fontsource-variable/figtree`
  (not a Google Fonts `<link>` tag) — this keeps the PWA able to render its UI font offline and
  avoids an external network request at load time. Imported once in `src/styles/globals.css`.
- Use `var(--font-sans)` for font-family.
- Weight range for this product is **400–800** (`--font-weight-min`/`--font-weight-max` in
  `tokens.css` document this as a rule, not a technical constraint — the variable font file itself
  supports 300–900). Don't go lighter than 400 or bolder than 800.

## Touch targets

Every tappable element (buttons, links acting as controls, icon buttons, form inputs) must have a hit
area of at least 44×44px — `--tap-target-min: 44px` in `tokens.css`. Apply the `.tap-target` utility
class from `src/styles/globals.css` (or match its `min-width`/`min-height`/centering behavior) rather
than hardcoding `44px` in component styles.

## PWA setup

- Configured via `vite-plugin-pwa` in `client/vite.config.ts`, `registerType: 'autoUpdate'`.
- Manifest icons live in `client/public/`: `pwa-192x192.png`, `pwa-512x512.png`,
  `maskable-512x512.png`, `apple-touch-icon.png`, `favicon.png`. These are placeholder icons (a
  simple purple map-pin mark) generated to get the manifest/build working — swap them for real
  branded artwork before shipping.
- `devOptions.enabled: true` so the service worker can be exercised in `npm run dev`, not just in
  builds/previews.
- Screens live in `src/pages/`; see "Routing" above for the current set and how they connect to the
  real API.

## Deployment (Vercel)

- `client/vercel.json` sets `framework: vite`, the build command, `outputDirectory: dist`, and an SPA
  rewrite (`/(.*) → /index.html`) for whenever client-side routing is added.
- **Because this repo has both `client/` and `server/` at the root, the Vercel project's Root
  Directory must be set to `client`** in Project Settings → General. There's no way to express that
  in `vercel.json` itself — it's a dashboard/CLI project setting
  (`vercel link` then set Root Directory, or set it in the dashboard before the first deploy).
- `server/` is not deployed by this Vercel config at all; it's a separate Node process today.

## Commands

Both the server and client need to be running for the app to actually work:

```bash
# Terminal 1 — API
cd server
npm install
npm run seed     # one-time, creates server/data/nyuad-eats.db
npm run dev      # http://localhost:4000

# Terminal 2 — client
cd client
npm install
npm run dev      # http://localhost:5173 (or next free port), proxies /api to :4000
npm run build    # tsc -b && vite build; also generates the service worker
npm run preview  # serve the production build locally
```
