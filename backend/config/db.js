import dotenv from 'dotenv';

dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  // Keep a few connections open so requests don't pay for a new
  // TLS handshake to the database each time
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});


// An idle connection dropping (e.g. Neon scaling to zero) is normal:
// the pool discards it and opens a new one. Don't crash the server.
pool.on('error', (err) => {
  console.error('Idle database connection error (will reconnect):', err.message);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool
}