import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  const routes = (await db.all('SELECT * FROM shuttle_routes')).map((r) => ({
    ...r,
    path: JSON.parse(r.path_json),
    path_json: undefined,
  }));
  const stops = await db.all('SELECT * FROM shuttle_stops');
  res.json({ routes, stops });
});

export default router;
