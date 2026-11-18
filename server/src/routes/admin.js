// AD Bites team endpoints (ADMIN_EMAILS, see utils/admin.js): review restaurant suggestions.
import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../utils/admin.js';
import { priceTierFor } from '../constants.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// Suggestions waiting for approval, oldest first, with who suggested them.
router.get('/restaurants/pending', async (_req, res) => {
  const rows = await db.all(
    `SELECT r.id, r.name, r.cuisine, r.lat, r.lng, r.avg_meal_price_aed, r.description, r.happy_hour_info,
            r.getting_there_note, r.created_at, s.name AS nearest_stop_name,
            u.name AS submitted_by_name, u.email AS submitted_by_email
       FROM restaurants r
       LEFT JOIN users u ON u.id = r.submitted_by
       LEFT JOIN shuttle_stops s ON s.id = r.nearest_shuttle_stop_id
      WHERE r.verified = 0
      ORDER BY r.created_at ASC`
  );
  res.json({ restaurants: rows.map((r) => ({ ...r, price_tier: priceTierFor(r.avg_meal_price_aed) })) });
});

router.post('/restaurants/:id/approve', async (req, res) => {
  const result = await db.run('UPDATE restaurants SET verified = 1 WHERE id = ? AND verified = 0', req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'No pending suggestion with that id.' });
  res.json({ ok: true });
});

// Reject = delete. Only pending suggestions can be deleted here, never a live restaurant.
router.delete('/restaurants/:id', async (req, res) => {
  const result = await db.run('DELETE FROM restaurants WHERE id = ? AND verified = 0', req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'No pending suggestion with that id.' });
  res.json({ ok: true });
});

export default router;
