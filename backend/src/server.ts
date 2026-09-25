import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'smart_manager',
  user: process.env.DB_USER ?? 'smart_manager',
  password: process.env.DB_PASSWORD,
  connectionLimit: 5,
  connectTimeout: 5000,
});

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:8081' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'smart-manager-api' });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

const server = app.listen(port, process.env.HOST ?? '0.0.0.0', () => {
  console.log(`Smart Manager API listening on port ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => { void pool.end().then(() => process.exit(0)); });
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
