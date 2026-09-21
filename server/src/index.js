import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import './db/index.js';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import dishRoutes from './routes/dishes.js';
import reviewRoutes from './routes/reviews.js';
import shuttleRoutes from './routes/shuttles.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api', dishRoutes);
app.use('/api', reviewRoutes);
app.use('/api/shuttles', shuttleRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`NYUAD Eats API listening on http://localhost:${PORT}`));
