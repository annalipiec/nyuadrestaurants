// The Express app, without app.listen() — imported by src/index.js for local dev and by
// /api/index.js at the repo root, which Vercel runs as a serverless function.
import express from 'express';
import cors from 'cors';

import { ready } from './db/index.js';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import dishRoutes from './routes/dishes.js';
import reviewRoutes from './routes/reviews.js';
import shuttleRoutes from './routes/shuttles.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Make sure the schema exists (and an empty database is seeded) before any route queries it.
app.use(async (_req, _res, next) => {
  await ready();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api', dishRoutes);
app.use('/api', reviewRoutes);
app.use('/api/shuttles', shuttleRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

export default app;
