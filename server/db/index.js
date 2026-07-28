const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 
                         process.env.DATABASE_PRIVATE_URL || 
                         process.env.DATABASE_PUBLIC_URL || 
                         process.env.POSTGRES_URL;

// PostgreSQL connection pool configuration
const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || (connectionString && !connectionString.includes('localhost'))
    ? { rejectUnauthorized: false } 
    : false
});

// Event listener for unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('[DB Pool Error] Unexpected error on idle client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  connectionString
};
