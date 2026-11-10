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

`client/` was rebuilt from scratch as a TypeScript PWA; `server/` predates that rebuild and has not
been re-integrated with it yet. Don't assume the two are wired together until a session explicitly
connects them (API base URL, CORS, etc.).

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
    exact bug happened once already in `RestaurantDetailScreen` — caught by screenshotting dark mode,
    not by the type checker or linter, so **always screenshot both themes** when styling anything new.

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
- First real screen: `src/components/RestaurantDetailScreen.tsx` (built from an uploaded design
  mockup), rendered directly by `App.tsx`. It uses hardcoded sample data (`SAMPLE_RESTAURANT`) — there
  is no routing yet and this client isn't wired up to `server/`'s API.

## Deployment (Vercel)

- `client/vercel.json` sets `framework: vite`, the build command, `outputDirectory: dist`, and an SPA
  rewrite (`/(.*) → /index.html`) for whenever client-side routing is added.
- **Because this repo has both `client/` and `server/` at the root, the Vercel project's Root
  Directory must be set to `client`** in Project Settings → General. There's no way to express that
  in `vercel.json` itself — it's a dashboard/CLI project setting
  (`vercel link` then set Root Directory, or set it in the dashboard before the first deploy).
- `server/` is not deployed by this Vercel config at all; it's a separate Node process today.

## Commands

```bash
cd client
npm install
npm run dev      # http://localhost:5173 (or next free port)
npm run build    # tsc -b && vite build; also generates the service worker
npm run preview  # serve the production build locally
```
