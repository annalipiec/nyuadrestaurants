import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth, requireVerified, optionalAuth } from '../middleware/auth.js';
import { priceTierFor } from '../constants.js';
import { nearestStop } from '../utils/geo.js';

const router = Router();

async function decorateRestaurant(r) {
  const dishes = await db.all(`SELECT d.id, d.name, d.price_aed,
              (SELECT COUNT(*) FROM dish_likes WHERE dish_id = d.id) AS likes
       FROM dishes d WHERE d.restaurant_id = ? ORDER BY likes DESC, d.id ASC`, r.id);

  const reviewStats = await db.get(`SELECT COUNT(*) AS count, AVG(stars) AS avg_stars FROM reviews WHERE restaurant_id = ?`, r.id);

  const shuttleStop = r.nearest_shuttle_stop_id
    ? await db.get('SELECT * FROM shuttle_stops WHERE id = ?', r.nearest_shuttle_stop_id)
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

router.get('/', optionalAuth, async (req, res) => {
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

  const rows = await db.all(sql, ...params);
  res.json({ restaurants: await Promise.all(rows.map(decorateRestaurant)) });
});

router.get('/cuisines', async (_req, res) => {
  const rows = await db.all('SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine ASC');
  res.json({ cuisines: rows.map((r) => r.cuisine) });
});

router.get('/:id', async (req, res) => {
  const r = await db.get('SELECT * FROM restaurants WHERE id = ?', req.params.id);
  if (!r) return res.status(404).json({ error: 'Restaurant not found.' });

  const reviews = await db.all(`SELECT reviews.id, reviews.stars, reviews.nyuad_phrase, reviews.text, reviews.created_at,
              users.name AS author_name
       FROM reviews JOIN users ON users.id = reviews.user_id
       WHERE restaurant_id = ? ORDER BY reviews.created_at DESC`, req.params.id);

  res.json({ restaurant: await decorateRestaurant(r), reviews });
});

router.post('/', requireAuth, requireVerified, async (req, res) => {
  const { name, cuisine, neighborhood, address, lat, lng, avg_meal_price_aed, description, happy_hour_info } =
    req.body || {};

  if (!name || !cuisine || lat == null || lng == null || avg_meal_price_aed == null) {
    return res
      .status(400)
      .json({ error: 'name, cuisine, lat, lng, and avg_meal_price_aed are required.' });
  }

  const stops = await db.all('SELECT * FROM shuttle_stops');
  const closest = stops.length ? nearestStop(Number(lat), Number(lng), stops) : null;

  const info = await db.run(`INSERT INTO restaurants
        (name, cuisine, neighborhood, address, lat, lng, avg_meal_price_aed, description, happy_hour_info, nearest_shuttle_stop_id, submitted_by, verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
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

  const created = await db.get('SELECT * FROM restaurants WHERE id = ?', info.lastInsertRowid);
  res.status(201).json({ restaurant: await decorateRestaurant(created) });
});

export default router;
