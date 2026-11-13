import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth, requireVerified } from '../middleware/auth.js';

const router = Router();

router.post('/restaurants/:restaurantId/dishes', requireAuth, requireVerified, async (req, res) => {
  const restaurant = await db.get('SELECT id FROM restaurants WHERE id = ?', req.params.restaurantId);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

  const { name, price_aed } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Dish name is required.' });

  const info = await db.run('INSERT INTO dishes (restaurant_id, name, price_aed, added_by) VALUES (?, ?, ?, ?)', restaurant.id, name, price_aed != null ? Number(price_aed) : null, req.user.id);

  res.status(201).json({ dish: { id: info.lastInsertRowid, name, price_aed: price_aed || null, likes: 0 } });
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
