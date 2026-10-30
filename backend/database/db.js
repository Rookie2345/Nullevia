const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
const dbStatus = {
  configured: false,
  connected: false,
  message: 'Database not initialized',
  error: null,
  lastChecked: null,
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  dbStatus.configured = false;
  dbStatus.connected = false;
  dbStatus.message = 'DATABASE_URL environment variable is missing or empty.';
  dbStatus.error = 'DATABASE_URL_NOT_CONFIGURED';
  dbStatus.lastChecked = new Date().toISOString();
  console.warn('\x1b[33m[Nullevia DB Warning]\x1b[0m DATABASE_URL is not configured. Backend starting in decoupled mode.');
} else {
  dbStatus.configured = true;

  // Configure Neon PostgreSQL pool with SSL
  const isSslRequired = databaseUrl.includes('neon.tech') || process.env.NODE_ENV === 'production';
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: isSslRequired ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    dbStatus.connected = false;
    dbStatus.error = err.message;
    dbStatus.message = 'Unexpected error on idle database client';
    dbStatus.lastChecked = new Date().toISOString();
    console.error('[Nullevia DB Error] Idle client error:', err.message);
  });
}

/**
 * Executes a parameterized SQL query safely
 */
async function query(text, params = []) {
  if (!pool) {
    throw new Error('Database pool is not initialized. Please verify DATABASE_URL.');
  }
  return pool.query(text, params);
}

/**
 * Initializes database connection and verifies/runs schema.sql
 */
async function initDatabase() {
  dbStatus.lastChecked = new Date().toISOString();

  if (!pool) {
    dbStatus.connected = false;
    dbStatus.message = 'DATABASE_URL is not set. Database features will return fallback data.';
    return false;
  }

  try {
    const client = await pool.connect();
    try {
      // 1. Verify connection
      const res = await client.query('SELECT NOW() as current_time, current_database() as db_name;');
      dbStatus.connected = true;
      dbStatus.error = null;
      dbStatus.message = `Connected to PostgreSQL database '${res.rows[0].db_name}' at ${res.rows[0].current_time.toISOString()}`;
      console.log(`\x1b[32m[Nullevia DB Success]\x1b[0m ${dbStatus.message}`);

      // 2. Run schema initialization
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('\x1b[32m[Nullevia DB Schema]\x1b[0m Schema verified and initial seed applied successfully.');
      }

      // 3. Run incremental migrations
      const migrationsDir = path.join(__dirname, 'migrations');
      if (fs.existsSync(migrationsDir)) {
        const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
        for (const file of migrationFiles) {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await client.query(sql);
          console.log(`\x1b[32m[Nullevia DB Migration]\x1b[0m Applied migration: ${file}`);
        }
      }

      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    dbStatus.connected = false;
    dbStatus.error = err.message;
    dbStatus.message = `Database connection failed: ${err.message}`;
    console.error('\x1b[31m[Nullevia DB Connection Error]\x1b[0m', err.message);
    return false;
  }
}

function getStatus() {
  return { ...dbStatus };
}

module.exports = {
  query,
  initDatabase,
  getStatus,
  pool,
};
