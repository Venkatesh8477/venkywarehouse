const fs = require('node:fs');
const { Pool } = require('pg');
const { databaseUrl, nodeEnv, pgSslRootCert } = require('./env');

const usesSupabase = /supabase\.(?:co|com)/i.test(databaseUrl);
const ssl = nodeEnv === 'production' || usesSupabase
  ? {
      rejectUnauthorized: Boolean(pgSslRootCert),
      ...(pgSslRootCert ? { ca: fs.readFileSync(pgSslRootCert, 'utf8') } : {}),
    }
  : false;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
