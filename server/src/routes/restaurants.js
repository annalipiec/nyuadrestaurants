import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { priceTierFor } from '../constants.js';
import { nearestStop } from '../utils/geo.js';

const router = Router();

function decorateRestaurant(r) {
  const dishes = db
    .prepare(
      `SELECT d.id, d.name, d.price_aed,
              (SELECT COUNT(*) FROM dish_likes WHERE dish_id = d.id) AS likes
       FROM dishes d WHERE d.restaurant_id = ? ORDER BY likes DESC, d.id ASC`
    )
    .all(r.id);

  const reviewStats = db
    .prepare(
      `SELECT COUNT(*) AS count, AVG(stars) AS avg_stars FROM reviews WHERE restaurant_id = ?`
    )
    .get(r.id);

  const shuttleStop = r.nearest_shuttle_stop_id
    ? db.prepare('SELECT * FROM shuttle_stops WHERE id = ?').get(r.nearest_shuttle_stop_id)
    : null;
  const walkMeters = shuttleStop
    ? nearestStop(r.lat, r.lng, [shuttleStop])?.distance_m ?? null
    : null;

  return {
    ...r,
    verified: !!r.verified,
    price_tier: priceTierFor(r.avg_meal_price_aed),
    dishes,
    review_count: reviewStats.count,
    avg_stars: reviewStats.avg_stars ? Math.round(reviewStats.avg_stars * 10) / 10 : null,
    nearest_shuttle_stop: shuttleStop
      ? { id: shuttleStop.id, name: shuttleStop.name, lat: shuttleStop.lat, lng: shuttleStop.lng, distance_m: walkMeters }
      : null,
  };
}

router.get('/', optionalAuth, (req, res) => {
  const { cuisine, maxPrice, happyHour, q, verifiedOnly } = req.query;
  let sql = 'SELECT * FROM restaurants WHERE 1=1';
  const params = [];

  if (cuisine) {
    sql += ' AND cuisine = ?';
    params.push(cuisine);
  }
  if (maxPrice) {
    sql += ' AND avg_meal_price_aed <= ?';
    params.push(Number(maxPrice));
  }
  if (happyHour === 'true') {
    sql += ' AND happy_hour_info IS NOT NULL';
  }
  if (verifiedOnly === 'true') {
    sql += ' AND verified = 1';
  }
  if (q) {
    sql += ' AND (name LIKE ? OR cuisine LIKE ? OR neighborhood LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY name ASC';

  const rows = db.prepare(sql).all(...params);
  res.json({ restaurants: rows.map(decorateRestaurant) });
});

router.get('/cuisines', (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine ASC').all();
  res.json({ cuisines: rows.map((r) => r.cuisine) });
});

router.get('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Restaurant not found.' });

  const reviews = db
    .prepare(
      `SELECT reviews.id, reviews.stars, reviews.nyuad_phrase, reviews.text, reviews.created_at,
              users.name AS author_name
       FROM reviews JOIN users ON users.id = reviews.user_id
       WHERE restaurant_id = ? ORDER BY reviews.created_at DESC`
    )
    .all(req.params.id);

  res.json({ restaurant: decorateRestaurant(r), reviews });
});

router.post('/', requireAuth, (req, res) => {
  const { name, cuisine, neighborhood, address, lat, lng, avg_meal_price_aed, description, happy_hour_info } =
    req.body || {};

  if (!name || !cuisine || lat == null || lng == null || avg_meal_price_aed == null) {
    return res
      .status(400)
      .json({ error: 'name, cuisine, lat, lng, and avg_meal_price_aed are required.' });
  }

  const stops = db.prepare('SELECT * FROM shuttle_stops').all();
  const closest = stops.length ? nearestStop(Number(lat), Number(lng), stops) : null;

  const info = db
    .prepare(
      `INSERT INTO restaurants
        (name, cuisine, neighborhood, address, lat, lng, avg_meal_price_aed, description, happy_hour_info, nearest_shuttle_stop_id, submitted_by, verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
    .run(
      name,
      cuisine,
      neighborhood || null,
      address || null,
      Number(lat),
      Number(lng),
      Number(avg_meal_price_aed),
      description || null,
      happy_hour_info || null,
      closest?.id || null,
      req.user.id
    );

  const created = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ restaurant: decorateRestaurant(created) });
});

export default router;
