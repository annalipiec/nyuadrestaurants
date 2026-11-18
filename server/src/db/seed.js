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

// Real NYUAD shuttle stops, confirmed by the team (coordinates given directly, not
// approximated). One straight-line route per stop from campus — a simple, honest
// starting point rather than pretending to trace the actual road the shuttle drives,
// since we don't have real waypoint/GPS data for the roads themselves yet.
const NYUAD_CAMPUS = [24.5335, 54.438];
const REAL_STOPS = [
  { key: 'wtc', name: 'WTC stop', lat: 24.488711817967236, lng: 54.356473283742844 },
  { key: 'alWahda', name: 'Al Wahda stop', lat: 24.471688247027856, lng: 54.37297630832414 },
  { key: 'mamsha', name: 'Mamsha stop', lat: 24.538358148499473, lng: 54.41029684004894 },
  { key: 'galleria', name: 'Galleria Mall stop', lat: 24.501385508814867, lng: 54.38982096701346 },
  { key: 'louvre', name: 'Louvre stop', lat: 24.532504123520646, lng: 54.401687247219705 },
];

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

// Returns true if it seeded, false if the database already had restaurants.
export async function seedIfEmpty() {
  return db.transaction(async (tx) => {
    const already = (await tx.get('SELECT COUNT(*) AS c FROM restaurants')).c;
    if (already > 0) return false;

    const demoPasswordHash = bcrypt.hashSync('ad-bites-demo', 10);
    const existingSeedUser = await tx.get('SELECT id FROM users WHERE email = ?', 'ad-bites-team@nyu.edu');
    const seedUserId =
      existingSeedUser?.id ??
      (
        await tx.run(
          `INSERT INTO users (email, name, password_hash, class_year, email_verified) VALUES (?, ?, ?, ?, 1)`,
          'ad-bites-team@nyu.edu',
          'AD Bites Team',
          demoPasswordHash,
          2026
        )
      ).lastInsertRowid;

    const insertRoute = async (name, color, path) =>
      (await tx.run(`INSERT INTO shuttle_routes (name, color, path_json) VALUES (?, ?, ?)`, name, color, JSON.stringify(path)))
        .lastInsertRowid;
    const insertStop = async (name, lat, lng, routeId) =>
      (await tx.run(`INSERT INTO shuttle_stops (name, lat, lng, route_id) VALUES (?, ?, ?, ?)`, name, lat, lng, routeId))
        .lastInsertRowid;

    const realStops = {};
    for (const stop of REAL_STOPS) {
      const routeId = await insertRoute(
        `Campus ↔ ${stop.name} (straight-line, confirm real route later)`,
        '#57068C',
        [NYUAD_CAMPUS, [stop.lat, stop.lng]]
      );
      realStops[stop.key] = await insertStop(stop.name, stop.lat, stop.lng, routeId);
    }

    const restaurants = buildRestaurants(realStops);
    for (const r of restaurants) {
      await tx.run(
        `INSERT INTO restaurants
          (name, cuisine, neighborhood, address, lat, lng, avg_meal_price_aed, description, happy_hour_info, getting_there_note, nearest_shuttle_stop_id, submitted_by, verified)
         VALUES (@name, @cuisine, @neighborhood, @address, @lat, @lng, @avg_meal_price_aed, @description, @happy_hour_info, @getting_there_note, @nearest_shuttle_stop_id, @submitted_by, 1)`,
        { ...r, submitted_by: seedUserId }
      );
    }

    console.log(`Seeded ${restaurants.length} restaurants and shuttle stops.`);
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
