const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl = process.env.DATABASE_URL || '';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? '' : 'development-secret');
const pgSslRootCert = process.env.PGSSLROOTCERT || '';

if (nodeEnv === 'production') {
  if (!databaseUrl) throw new Error('DATABASE_URL must be configured in production');
  if (!process.env.FRONTEND_URL) throw new Error('FRONTEND_URL must be configured in production');
  if (jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters in production');
  if (/supabase\.(?:co|com)/i.test(databaseUrl) && !pgSslRootCert) {
    throw new Error('PGSSLROOTCERT must point to the Supabase database root certificate in production');
  }
}

const env = {
  port: Number(process.env.PORT) || 5001,
  nodeEnv,
  databaseUrl,
  jwtSecret,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  frontendUrl,
  pgSslRootCert,
  allowPublicSignup: process.env.ALLOW_PUBLIC_SIGNUP === 'true',
};

module.exports = env;
