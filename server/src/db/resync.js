// `npm run resync` — fixes a database that was already seeded before seed.js had the
// team's real restaurant data (this is what happened to the production Turso DB).
// Point TURSO_DATABASE_URL/TURSO_AUTH_TOKEN (e.g. via `vercel env pull`) at the
// database you want fixed before running this — it talks to whatever ready() connects
// to, same as the server. See resyncSeedRestaurants() in ./seed.js for exactly what it
// deletes and re-inserts.
import { ready } from './index.js';
import { resyncSeedRestaurants } from './seed.js';

await ready();
await resyncSeedRestaurants();
