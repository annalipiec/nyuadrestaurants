import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth, requireVerified, optionalAuth } from '../middleware/auth.js';
import { priceTierFor } from '../constants.js';
import { nearestStop } from '../utils/geo.js';
import { isAdminEmail } from '../utils/admin.js';
import { notifyAdmins } from '../utils/email.js';

const router = Router();

async function decorateRestaurant(r) {
  const dishes = await db.all(`SELECT d.id, d.name, d.price_aed,
              (SELECT COUNT(*) FROM dish_likes WHERE dish_id = d.id) AS likes
       FROM dishes d WHERE d.restaurant_id = ? ORDER BY likes DESC, d.id ASC`, r.id);

  const reviewStats = await db.get(`SELECT COUNT(*) AS count, AVG(stars) AS avg_stars FROM reviews WHERE restaurant_id = ?`, r.id);

  // A restaurant's tags = the vibe tags students pick most often in its tips.
  const topTags = await db.all(
    `SELECT nyuad_phrase AS tag, COUNT(*) AS count, MIN(id) AS first_id
       FROM reviews
      WHERE restaurant_id = ? AND nyuad_phrase IS NOT NULL
      GROUP BY nyuad_phrase
      ORDER BY count DESC, first_id ASC
      LIMIT 3`,
    r.id
  );

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
    top_tags: topTags.map(({ tag, count }) => ({ tag, count })),
    avg_stars: reviewStats.avg_stars ? Math.round(reviewStats.avg_stars * 10) / 10 : null,
    nearest_shuttle_stop: shuttleStop
      ? { id: shuttleStop.id, name: shuttleStop.name, lat: shuttleStop.lat, lng: shuttleStop.lng, distance_m: walkMeters }
      : null,
  };
}

router.get('/', optionalAuth, async (req, res) => {
  const { cuisine, maxPrice, happyHour, q } = req.query;
  // Only approved restaurants are public; suggestions wait for the team (see routes/admin.js).
  let sql = 'SELECT * FROM restaurants WHERE verified = 1';
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
  if (q) {
    // Also matches restaurants whose tips carry a matching vibe tag ("vegan", "date", "late-night"…).
    sql += ` AND (name LIKE ? OR cuisine LIKE ? OR neighborhood LIKE ?
             OR EXISTS (SELECT 1 FROM reviews WHERE reviews.restaurant_id = restaurants.id AND nyuad_phrase LIKE ?))`;
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  sql += ' ORDER BY name ASC';

  const rows = await db.all(sql, ...params);
  res.json({ restaurants: await Promise.all(rows.map(decorateRestaurant)) });
});

router.get('/cuisines', async (_req, res) => {
  const rows = await db.all('SELECT DISTINCT cuisine FROM restaurants WHERE verified = 1 ORDER BY cuisine ASC');
  res.json({ cuisines: rows.map((r) => r.cuisine) });
});

// The current user's own suggestions, pending or approved — shown on the Profile tab.
router.get('/mine', requireAuth, async (req, res) => {
  const rows = await db.all(
    'SELECT id, name, cuisine, verified, created_at FROM restaurants WHERE submitted_by = ? ORDER BY created_at DESC',
    req.user.id
  );
  res.json({ restaurants: rows.map((r) => ({ ...r, verified: !!r.verified })) });
});

router.get('/:id', optionalAuth, async (req, res) => {
  const r = await db.get('SELECT * FROM restaurants WHERE id = ?', req.params.id);
  // A pending suggestion is only visible to whoever suggested it and to admins.
  if (!r || (!r.verified && !(req.user && (r.submitted_by === req.user.id || isAdminEmail(req.user.email))))) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  const reviews = await db.all(`SELECT reviews.id, reviews.stars, reviews.nyuad_phrase, reviews.text, reviews.created_at,
              users.name AS author_name
       FROM reviews JOIN users ON users.id = reviews.user_id
       WHERE restaurant_id = ? ORDER BY reviews.created_at DESC`, req.params.id);

  res.json({ restaurant: await decorateRestaurant(r), reviews });
});

const MAX_PENDING_PER_USER = 5;
// Generous box around Abu Dhabi emirate — catches swapped lat/lng and pins in the sea off Africa.
const ABU_DHABI_BOUNDS = { minLat: 22.5, maxLat: 25.5, minLng: 51.0, maxLng: 56.5 };

function cleanText(value, max) {
  const s = String(value ?? '').trim().replace(/\s+/g, ' ');
  return s ? s.slice(0, max) : null;
}

// Students suggest restaurants here; they stay hidden (verified = 0) until an admin approves them.
// Admins' own additions go live immediately.
router.post('/', requireAuth, requireVerified, async (req, res) => {
  const body = req.body || {};
  const name = cleanText(body.name, 80);
  const cuisine = cleanText(body.cuisine, 50);
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const price = Number(body.avg_meal_price_aed);

  if (!name || !cuisine) return res.status(400).json({ error: 'Name and cuisine are required.' });
  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < ABU_DHABI_BOUNDS.minLat || lat > ABU_DHABI_BOUNDS.maxLat ||
    lng < ABU_DHABI_BOUNDS.minLng || lng > ABU_DHABI_BOUNDS.maxLng
  ) {
    return res.status(400).json({ error: 'Pick the restaurant’s location on the map (it must be in Abu Dhabi).' });
  }
  if (!Number.isFinite(price) || price <= 0 || price > 1000) {
    return res.status(400).json({ error: 'Average price per person must be between 1 and 1000 AED.' });
  }

  const user = await db.get('SELECT id, name, email FROM users WHERE id = ?', req.user.id);
  const admin = isAdminEmail(user?.email);

  const duplicate = await db.get('SELECT id, verified FROM restaurants WHERE lower(name) = lower(?)', name);
  if (duplicate) {
    return res.status(409).json({
      error: duplicate.verified
        ? 'That restaurant is already on AD Bites.'
        : 'Someone already suggested that restaurant — it’s waiting for approval.',
    });
  }
  if (!admin) {
    const pending = (
      await db.get('SELECT COUNT(*) AS c FROM restaurants WHERE submitted_by = ? AND verified = 0', req.user.id)
    ).c;
    if (pending >= MAX_PENDING_PER_USER) {
      return res.status(429).json({
        error: `You have ${pending} suggestions waiting for approval. Please wait until the team reviews them.`,
      });
    }
  }

  const stops = await db.all('SELECT * FROM shuttle_stops');
  const closest = stops.length ? nearestStop(lat, lng, stops) : null;

  const info = await db.run(
    `INSERT INTO restaurants
        (name, cuisine, lat, lng, avg_meal_price_aed, description, happy_hour_info, getting_there_note,
         nearest_shuttle_stop_id, submitted_by, verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    name,
    cuisine,
    lat,
    lng,
    price,
    cleanText(body.description, 300),
    cleanText(body.happy_hour_info, 120),
    cleanText(body.getting_there_note, 120),
    closest?.id ?? null,
    req.user.id,
    admin ? 1 : 0
  );

  if (!admin) {
    await notifyAdmins(
      `New restaurant suggestion: ${name}`,
      [
        `${user.name} (${user.email}) suggested a restaurant on AD Bites:`,
        '',
        `${name} — ${cuisine}, about ${price} AED per person`,
        `Location: https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        cleanText(body.getting_there_note, 120) ? `Getting there: ${cleanText(body.getting_there_note, 120)}` : null,
        '',
        'Approve or reject it in the app: Profile → Review suggestions.',
      ]
        .filter((l) => l !== null)
        .join('\n')
    );
  }

  const created = await db.get('SELECT * FROM restaurants WHERE id = ?', info.lastInsertRowid);
  res.status(201).json({ restaurant: await decorateRestaurant(created) });
});

export default router;
