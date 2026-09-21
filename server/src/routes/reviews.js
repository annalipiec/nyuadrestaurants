import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { NYUAD_PHRASES } from '../constants.js';

const router = Router();

router.get('/phrases', (_req, res) => {
  res.json({ phrases: NYUAD_PHRASES });
});

router.post('/restaurants/:restaurantId/reviews', requireAuth, (req, res) => {
  const restaurant = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(req.params.restaurantId);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

  const { stars, nyuad_phrase, text } = req.body || {};
  const starsNum = Number(stars);
  if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
    return res.status(400).json({ error: 'stars must be an integer between 1 and 5.' });
  }

  const info = db
    .prepare(
      'INSERT INTO reviews (restaurant_id, user_id, stars, nyuad_phrase, text) VALUES (?, ?, ?, ?, ?)'
    )
    .run(restaurant.id, req.user.id, starsNum, nyuad_phrase || null, text || null);

  const review = db
    .prepare(
      `SELECT reviews.id, reviews.stars, reviews.nyuad_phrase, reviews.text, reviews.created_at, users.name AS author_name
       FROM reviews JOIN users ON users.id = reviews.user_id WHERE reviews.id = ?`
    )
    .get(info.lastInsertRowid);

  res.status(201).json({ review });
});

export default router;
