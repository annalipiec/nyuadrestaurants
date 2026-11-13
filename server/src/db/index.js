// Database access via libSQL. In production (Vercel) this talks to a hosted Turso database
// configured by TURSO_DATABASE_URL / TURSO_AUTH_TOKEN. Locally, with neither set, it falls back
// to the SQLite file at server/data/nyuad-eats.db — same schema, same SQL.
//
// Every helper is async. `await ready()` before the first query: it creates tables if needed
// and seeds demo data into an empty database (see ./seed.js).
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

function localFileUrl() {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return `file:${path.join(dataDir, 'nyuad-eats.db')}`;
}

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL || localFileUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function toObjects(rs) {
  return rs.rows.map((row) => Object.fromEntries(rs.columns.map((c, i) => [c, row[i]])));
}

// `args` is either positional values or a single object of named (@name) values.
function normalizeArgs(args) {
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    return args[0];
  }
  return args;
}

function makeDb(executor) {
  return {
    async all(sql, ...args) {
      return toObjects(await executor.execute({ sql, args: normalizeArgs(args) }));
    },
    async get(sql, ...args) {
      return (await this.all(sql, ...args))[0];
    },
    async run(sql, ...args) {
      const rs = await executor.execute({ sql, args: normalizeArgs(args) });
      return {
        changes: rs.rowsAffected,
        lastInsertRowid: rs.lastInsertRowid != null ? Number(rs.lastInsertRowid) : undefined,
      };
    },
  };
}

const db = makeDb(client);

// Runs `fn(tx)` inside a write transaction; `tx` has the same all/get/run helpers.
db.transaction = async (fn) => {
  const tx = await client.transaction('write');
  try {
    const result = await fn(makeDb(tx));
    await tx.commit();
    return result;
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  } finally {
    tx.close();
  }
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  class_year INTEGER,
  email_verified INTEGER NOT NULL DEFAULT 0,
  verification_code TEXT,
  verification_expires_at TEXT,
  verification_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  neighborhood TEXT,
  address TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  avg_meal_price_aed REAL NOT NULL,
  description TEXT,
  happy_hour_info TEXT,
  nearest_shuttle_stop_id INTEGER,
  submitted_by INTEGER,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (nearest_shuttle_stop_id) REFERENCES shuttle_stops(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS dishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price_aed REAL,
  added_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS dish_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dish_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(dish_id, user_id),
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  nyuad_phrase TEXT,
  text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shuttle_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#57068C',
  path_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shuttle_stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  route_id INTEGER,
  FOREIGN KEY (route_id) REFERENCES shuttle_routes(id) ON DELETE SET NULL
);
`;

async function init() {
  await client.execute('PRAGMA foreign_keys = ON');
  await client.executeMultiple(SCHEMA);

  // Migration for databases created before email verification was added.
  const userColumns = (await db.all('PRAGMA table_info(users)')).map((c) => c.name);
  if (!userColumns.includes('email_verified')) {
    await client.executeMultiple(`
      ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN verification_code TEXT;
      ALTER TABLE users ADD COLUMN verification_expires_at TEXT;
    `);
  }
  if (!userColumns.includes('verification_attempts')) {
    await client.execute('ALTER TABLE users ADD COLUMN verification_attempts INTEGER NOT NULL DEFAULT 0');
  }

  const { seedIfEmpty } = await import('./seed.js');
  await seedIfEmpty();
}

let readyPromise;
export function ready() {
  if (!readyPromise) {
    readyPromise = init().catch((err) => {
      readyPromise = undefined; // let the next request retry
      throw err;
    });
  }
  return readyPromise;
}

export default db;
