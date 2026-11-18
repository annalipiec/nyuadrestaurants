// Regenerates src/data/shuttlePaths.json: each shuttle route's path along real roads, so the map
// can draw it following the streets instead of straight lines between stops.
//
//   node scripts/build-shuttle-paths.mjs        (from server/)
//
// Run it whenever a route's stops or a stop's coordinates change in src/data/shuttleSchedule.js,
// then commit the JSON. Paths are driving routes between consecutive stops from the public OSRM
// demo server (OpenStreetMap data) — a close approximation of the bus's road, not GPS-traced.
// Only public stop coordinates are sent. GET /api/shuttles falls back to straight lines for any
// route whose stops no longer match what this file was generated from (see `waypoints`).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROUTES, routeWaypoints } from '../src/data/shuttleSchedule.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'data', 'shuttlePaths.json');
const OSRM = 'https://router.project-osrm.org/route/v1/driving';

// Douglas–Peucker in degrees; ~0.00003° ≈ 3 m keeps every visible bend but drops most points.
function simplify(points, tolerance = 0.00003) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points[points.length - 1]];
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    // A loop's endpoints coincide (campus → … → campus): measure from the point instead.
    const d = len < 1e-9
      ? Math.hypot(p[0] - a[0], p[1] - a[1])
      : Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [a, b];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

const result = {};
for (const route of ROUTES) {
  const waypoints = routeWaypoints(route);
  if (waypoints.length < 3) {
    console.log(`- ${route.key}: no mapped stops, skipped`);
    continue;
  }
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const res = await fetch(`${OSRM}/${coords}?overview=full&geometries=geojson`, {
    headers: { 'User-Agent': 'ad-bites-shuttle-paths/1.0' },
  });
  const body = await res.json();
  if (body.code !== 'Ok') throw new Error(`${route.key}: OSRM said ${body.code} ${body.message ?? ''}`);
  const full = body.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const pathPoints = simplify(full).map(([lat, lng]) => [+lat.toFixed(5), +lng.toFixed(5)]);
  result[route.key] = { waypoints, distance_km: +(body.routes[0].distance / 1000).toFixed(1), path: pathPoints };
  console.log(`- ${route.key}: ${full.length} → ${pathPoints.length} points, ${result[route.key].distance_km} km`);
  await new Promise((r) => setTimeout(r, 1100)); // stay well under the demo server's 1 req/s limit
}

fs.writeFileSync(OUT, JSON.stringify(result) + '\n');
console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
