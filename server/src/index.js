import app from './app.js';
import { ready } from './db/index.js';

await ready();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AD Bites API listening on http://localhost:${PORT}`));
