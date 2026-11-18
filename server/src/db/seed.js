// Seeds the database with the team's real, first-hand restaurant list so the app has
// genuine content from the first request — no placeholder/demo data.
//
// Fields not given directly by the team (description, must-try dishes, neighborhood/
// address) are left null/empty rather than invented; that's exactly what "Add a
// restaurant"/dish/review in the app is for once students start using it.
//
// Runs automatically on startup when the restaurants table is empty (see ready() in ./index.js),
// so a fresh Turso database gets this content on the first request. `npm run seed` runs it by hand.
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'url';
import db, { ready } from './index.js';
import { REAL_STOPS } from '../data/shuttleSchedule.js';

// Real NYUAD shuttle stops (confirmed coordinates) live in ../data/shuttleSchedule.js, next to
// the timetable that references them.


function buildRestaurants(stops) {
return [
  {
    name: 'Bait El Khetyar',
    cuisine: 'Lebanese/Palestinian',
    neighborhood: null,
    address: null,
    lat: 24.488857715842325, lng: 54.36087688046735,
    avg_meal_price_aed: 30,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'WTC stop + 10 min walk',
    nearest_shuttle_stop_id: stops.wtc,
  },
  {
    name: "Kopitiam by Chandy's",
    cuisine: 'Malaysian',
    neighborhood: null,
    address: null,
    lat: 24.482006805833016, lng: 54.37348117252967,
    avg_meal_price_aed: 45,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'Al Wahda + taxi (6 min)',
    nearest_shuttle_stop_id: stops.alWahda,
  },
  {
    name: 'Dragon Bao Bao',
    cuisine: 'Chinese',
    neighborhood: null,
    address: null,
    lat: 24.49168653820297, lng: 54.373495038139545,
    avg_meal_price_aed: 35,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'WTC stop + taxi (10 min)',
    nearest_shuttle_stop_id: stops.wtc,
  },
  {
    name: 'Boti Street',
    cuisine: 'Pakistani',
    neighborhood: null,
    address: null,
    lat: 24.48890756095828, lng: 54.35948653575668,
    avg_meal_price_aed: 35,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'WTC + 5 min walk',
    nearest_shuttle_stop_id: stops.wtc,
  },
  {
    name: 'Thai Renu Cafe & Restaurant',
    cuisine: 'Thai',
    neighborhood: null,
    address: null,
    lat: 24.492980826057384, lng: 54.36978126088917,
    avg_meal_price_aed: 50,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'WTC + taxi (9 min)',
    nearest_shuttle_stop_id: stops.wtc,
  },
  {
    name: 'Dampa Seafood Grill',
    cuisine: 'Seafood/Filipino',
    neighborhood: null,
    address: null,
    lat: 24.494572201671623, lng: 54.366337304338884,
    avg_meal_price_aed: 45,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'WTC + 20 min walk',
    nearest_shuttle_stop_id: stops.wtc,
  },
  {
    name: 'Zahrat Lebnan',
    cuisine: 'Lebanese',
    neighborhood: null,
    address: null,
    lat: 24.475855586763448, lng: 54.379063121284794,
    avg_meal_price_aed: 50,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'Al Wahda + 5 min walk',
    nearest_shuttle_stop_id: stops.alWahda,
  },
  {
    name: 'Bosnian Hut',
    cuisine: 'Balkan',
    neighborhood: null,
    address: null,
    lat: 24.480540930570964, lng: 54.38509222941662,
    avg_meal_price_aed: 45,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'Al Wahda + taxi (8 min)',
    nearest_shuttle_stop_id: stops.alWahda,
  },
  {
    name: 'Ting Irie',
    cuisine: 'Jamaican',
    neighborhood: null,
    address: null,
    lat: 24.545171331879025, lng: 54.424123762281994,
    avg_meal_price_aed: 50,
    description: null,
    happy_hour_info: 'Happy hours menu, Mon–Fri 12–7 PM.',
    getting_there_note: 'Mamsha stop',
    nearest_shuttle_stop_id: stops.mamsha,
  },
  {
    name: 'Bonna Anne Ethiopian Restaurant',
    cuisine: 'Ethiopian',
    neighborhood: null,
    address: null,
    lat: 24.489333149819316, lng: 54.38151149687885,
    avg_meal_price_aed: 45,
    description: null,
    happy_hour_info: null,
    getting_there_note: 'Al Wahda + taxi (8 min)',
    nearest_shuttle_stop_id: stops.alWahda,
  },
];

}

// This file's current seed/service account.
const CURRENT_SEED_USER_EMAIL = 'ad-bites-team@nyu.edu';

// Emails an OLDER version of this file used for its seed account — never the current
// one. resyncSeedRestaurants() deletes restaurants attributed to these (cascading to
// their dishes/reviews), but must never touch CURRENT_SEED_USER_EMAIL's restaurants:
// those are the real, current data, and a real user may have liked/reviewed one since
// it was inserted.
const OLD_SEED_USER_EMAILS = ['eats-team@nyu.edu'];

// Names of the placeholder stops/routes a pre-real-data version of this file seeded.
// resyncSeedRestaurants() deletes these by exact name so a database seeded with them
// (e.g. the production Turso DB, seeded before this file had real data) gets cleaned up.
const OLD_PLACEHOLDER_STOP_NAMES = [
  'NYUAD Campus – Bus Loop', 'Saadiyat Beach District', 'Al Reem Island Stop',
  'Hamdan Street Stop', 'Downtown / Electra Street Stop', 'Yas Mall Stop',
];
const OLD_PLACEHOLDER_ROUTE_NAMES = [
  'Saadiyat ↔ Downtown Loop (example)', 'Saadiyat ↔ Yas Island (example)',
];

async function ensureSeedUser(tx) {
  const email = CURRENT_SEED_USER_EMAIL;
  const existing = await tx.get('SELECT id FROM users WHERE email = ?', email);
  if (existing) return existing.id;
  const passwordHash = bcrypt.hashSync('ad-bites-demo', 10);
  return (
    await tx.run(
      `INSERT INTO users (email, name, password_hash, class_year, email_verified) VALUES (?, ?, ?, ?, 1)`,
      email,
      'AD Bites Team',
      passwordHash,
      2026
    )
  ).lastInsertRowid;
}

// Inserts the real shuttle stops, skipping any that already exist by name — safe to call
// against a database that already has some or all of them. Routes/times are not stored in the
// DB: GET /api/shuttles serves them from ../data/shuttleSchedule.js.
async function ensureRealStops(tx) {
  const realStops = {};
  for (const stop of REAL_STOPS) {
    const existing = await tx.get('SELECT id FROM shuttle_stops WHERE name = ?', stop.name);
    realStops[stop.key] =
      existing?.id ??
      (
        await tx.run('INSERT INTO shuttle_stops (name, lat, lng, route_id) VALUES (?, ?, ?, NULL)', stop.name, stop.lat, stop.lng)
      ).lastInsertRowid;
  }
  return realStops;
}

// Inserts the real restaurants, skipping any that already exist by name — returns how
// many were actually inserted.
async function insertRestaurantsIfMissing(tx, realStops, seedUserId) {
  let inserted = 0;
  for (const r of buildRestaurants(realStops)) {
    const existing = await tx.get('SELECT id FROM restaurants WHERE name = ?', r.name);
    if (existing) continue;
    await tx.run(
      `INSERT INTO restaurants
        (name, cuisine, neighborhood, address, lat, lng, avg_meal_price_aed, description, happy_hour_info, getting_there_note, nearest_shuttle_stop_id, submitted_by, verified)
       VALUES (@name, @cuisine, @neighborhood, @address, @lat, @lng, @avg_meal_price_aed, @description, @happy_hour_info, @getting_there_note, @nearest_shuttle_stop_id, @submitted_by, 1)`,
      { ...r, submitted_by: seedUserId }
    );
    inserted += 1;
  }
  return inserted;
}

// Returns true if it seeded, false if the database already had restaurants.
export async function seedIfEmpty() {
  return db.transaction(async (tx) => {
    const already = (await tx.get('SELECT COUNT(*) AS c FROM restaurants')).c;
    if (already > 0) return false;

    const seedUserId = await ensureSeedUser(tx);
    const realStops = await ensureRealStops(tx);
    const inserted = await insertRestaurantsIfMissing(tx, realStops, seedUserId);

    console.log(`Seeded ${inserted} restaurants and shuttle stops.`);
    return true;
  });
}

// One-off ops helper for a database that was already seeded before this file had the
// team's real restaurant data (this happened to the production Turso DB: it got the old
// placeholder restaurants seeded early on, and seedIfEmpty() only runs on an empty
// table, so it never got the real data). Deletes only rows this file is responsible for
// — restaurants submitted by an OLD seed account (never the current one — see
// OLD_SEED_USER_EMAILS), and the old placeholder stops/routes by exact name — never a
// real user's restaurant, dish, or review, and never the current real restaurants (or
// any dish/review a real user has added to one). Safe to re-run: stops/restaurants are
// inserted only if missing by name, and nothing belonging to the current seed account
// is ever deleted. Not run automatically — see `npm run resync` in server/.
export async function resyncSeedRestaurants() {
  return db.transaction(async (tx) => {
    for (const email of OLD_SEED_USER_EMAILS) {
      const user = await tx.get('SELECT id FROM users WHERE email = ?', email);
      if (user) await tx.run('DELETE FROM restaurants WHERE submitted_by = ?', user.id);
    }
    for (const name of OLD_PLACEHOLDER_STOP_NAMES) {
      await tx.run('DELETE FROM shuttle_stops WHERE name = ?', name);
    }
    for (const name of OLD_PLACEHOLDER_ROUTE_NAMES) {
      await tx.run('DELETE FROM shuttle_routes WHERE name = ?', name);
    }

    const seedUserId = await ensureSeedUser(tx);
    const realStops = await ensureRealStops(tx);
    const inserted = await insertRestaurantsIfMissing(tx, realStops, seedUserId);

    console.log(`Resync done: removed old placeholder data, inserted ${inserted} missing real restaurant(s).`);
    return true;
  });
}

// `npm run seed` — ready() creates the schema and seeds if empty.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const before = (await db.get('SELECT COUNT(*) AS c FROM sqlite_master WHERE name = ?', 'restaurants')).c;
  await ready();
  if (before) {
    const count = (await db.get('SELECT COUNT(*) AS c FROM restaurants')).c;
    console.log(`Database has ${count} restaurants (seed only runs when the table is empty).`);
  }
}
