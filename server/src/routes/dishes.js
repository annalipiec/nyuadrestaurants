import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/restaurants/:restaurantId/dishes', requireAuth, (req, res) => {
  const restaurant = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(req.params.restaurantId);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

  const { name, price_aed } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Dish name is required.' });

  const info = db
    .prepare('INSERT INTO dishes (restaurant_id, name, price_aed, added_by) VALUES (?, ?, ?, ?)')
    .run(restaurant.id, name, price_aed != null ? Number(price_aed) : null, req.user.id);

  res.status(201).json({ dish: { id: info.lastInsertRowid, name, price_aed: price_aed || null, likes: 0 } });
});

router.post('/dishes/:dishId/like', requireAuth, (req, res) => {
  const dish = db.prepare('SELECT id FROM dishes WHERE id = ?').get(req.params.dishId);
  if (!dish) return res.status(404).json({ error: 'Dish not found.' });

  const existing = db
    .prepare('SELECT id FROM dish_likes WHERE dish_id = ? AND user_id = ?')
    .get(dish.id, req.user.id);

  if (existing) {
    db.prepare('DELETE FROM dish_likes WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO dish_likes (dish_id, user_id) VALUES (?, ?)').run(dish.id, req.user.id);
  }

  const likes = db.prepare('SELECT COUNT(*) AS c FROM dish_likes WHERE dish_id = ?').get(dish.id).c;
  res.json({ dish_id: dish.id, liked: !existing, likes });
});

export default router;
