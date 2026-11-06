import { setDefaultResultOrder } from 'node:dns';
import { Pool } from 'pg';

setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL;
const sslMode = connectionString?.match(/sslmode=([a-z-]+)/i)?.[1]?.toLowerCase();
const useSsl = Boolean(connectionString) && sslMode !== 'disable';
const verifySsl =
  sslMode === 'verify-full' ||
  sslMode === 'verify-ca' ||
  process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';

const globalForDb = globalThis;
const poolKey = connectionString || '';
const cachedPool = globalForDb.__wemrayPool;
const hasMatchingPool = Boolean(cachedPool) && globalForDb.__wemrayPoolKey === poolKey;

if (cachedPool && !hasMatchingPool) {
  cachedPool.end().catch((error) => {
    console.error('Failed to close stale database pool', error);
  });
}

export const pool = hasMatchingPool
  ? cachedPool
  : new Pool({
      connectionString,
      application_name: 'wemray-website',
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: useSsl ? { rejectUnauthorized: verifySsl } : false,
    });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__wemrayPool = pool;
  globalForDb.__wemrayPoolKey = poolKey;
}

pool.on('error', (error) => {
  console.error('Unexpected database pool error', error);
});

export function query(text, params) {
  return pool.query(text, params);
}
