import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth, requireVerified } from '../middleware/auth.js';

const router = Router();

router.post('/restaurants/:restaurantId/dishes', requireAuth, requireVerified, async (req, res) => {
  const restaurant = await db.get('SELECT id FROM restaurants WHERE id = ?', req.params.restaurantId);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

  const name = String(req.body?.name ?? '').trim().replace(/\s+/g, ' ');
  if (!name) return res.status(400).json({ error: 'Dish name is required.' });
  if (name.length > 80) return res.status(400).json({ error: 'Dish name must be 80 characters or fewer.' });

  const rawPrice = req.body?.price_aed;
  const price = rawPrice === null || rawPrice === undefined || rawPrice === '' ? null : Number(rawPrice);
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 1000)) {
    return res.status(400).json({ error: 'Price must be a number of AED between 0 and 1000.' });
  }

  const duplicate = await db.get(
    'SELECT id FROM dishes WHERE restaurant_id = ? AND lower(name) = lower(?)',
    restaurant.id,
    name
  );
  if (duplicate) {
    return res.status(409).json({ error: 'That dish is already listed — give it a like instead!' });
  }

  const info = await db.run(
    'INSERT INTO dishes (restaurant_id, name, price_aed, added_by) VALUES (?, ?, ?, ?)',
    restaurant.id,
    name,
    price,
    req.user.id
  );

  res.status(201).json({ dish: { id: info.lastInsertRowid, name, price_aed: price, likes: 0 } });
});

router.post('/dishes/:dishId/like', requireAuth, async (req, res) => {
  const dish = await db.get('SELECT id FROM dishes WHERE id = ?', req.params.dishId);
  if (!dish) return res.status(404).json({ error: 'Dish not found.' });

  const existing = await db.get('SELECT id FROM dish_likes WHERE dish_id = ? AND user_id = ?', dish.id, req.user.id);

  if (existing) {
    await db.run('DELETE FROM dish_likes WHERE id = ?', existing.id);
  } else {
    await db.run('INSERT INTO dish_likes (dish_id, user_id) VALUES (?, ?)', dish.id, req.user.id);
  }

  const likes = (await db.get('SELECT COUNT(*) AS c FROM dish_likes WHERE dish_id = ?', dish.id)).c;
  res.json({ dish_id: dish.id, liked: !existing, likes });
});

export default router;
