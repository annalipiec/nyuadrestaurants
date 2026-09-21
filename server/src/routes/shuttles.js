import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

router.get('/', (_req, res) => {
  const routes = db.prepare('SELECT * FROM shuttle_routes').all().map((r) => ({
    ...r,
    path: JSON.parse(r.path_json),
    path_json: undefined,
  }));
  const stops = db.prepare('SELECT * FROM shuttle_stops').all();
  res.json({ routes, stops });
});

export default router;
