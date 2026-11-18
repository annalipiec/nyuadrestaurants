import { Router } from 'express';
import db from '../db/index.js';
import { NYUAD_CAMPUS, OTHER_SERVICES, REAL_STOPS, ROUTES, SCHEDULE_INFO } from '../data/shuttleSchedule.js';

const router = Router();

// Today's date in Abu Dhabi as YYYY-MM-DD (en-CA formats dates that way).
function abuDhabiToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(new Date());
}

// Routes + timetable come from data/shuttleSchedule.js; stop ids come from the DB so the client
// can match a restaurant's nearest_shuttle_stop.id to the routes that serve it.
router.get('/', async (_req, res) => {
  const stops = await db.all('SELECT id, name, lat, lng FROM shuttle_stops');
  const stopByKey = {};
  for (const real of REAL_STOPS) {
    const row = stops.find((s) => s.name === real.name);
    if (row) stopByKey[real.key] = row;
  }

  const today = abuDhabiToday();
  const routes = ROUTES.filter(
    (r) => (!r.validFrom || today >= r.validFrom) && (!r.validUntil || today <= r.validUntil)
  ).map((r) => {
    const routeStops = r.stops.map(({ label, stop }) => {
      if (stop === 'campus') return { label, stop_id: null, is_campus: true, ...NYUAD_CAMPUS };
      const row = stop ? stopByKey[stop] : null;
      return { label, stop_id: row?.id ?? null, is_campus: false, lat: row?.lat ?? null, lng: row?.lng ?? null };
    });
    return {
      key: r.key,
      name: r.name,
      color: r.color,
      service: r.service,
      stops: routeStops,
      trips: r.trips,
      // Straight segments between consecutive stops we have coordinates for — the stop order is
      // real, the line between stops is not the road the bus drives.
      // Empty when none of the route's off-campus stops have coordinates yet.
      path: routeStops.some((s) => !s.is_campus && s.lat != null)
        ? routeStops.filter((s) => s.lat != null).map((s) => [s.lat, s.lng])
        : [],
    };
  });

  res.json({ info: SCHEDULE_INFO, stops, routes, other_services: OTHER_SERVICES });
});

export default router;
