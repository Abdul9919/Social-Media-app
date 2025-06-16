const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create users table first (since posts references it)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create posts table with proper foreign key reference
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index (only once)
    await client.query(`
      CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
    `);

    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
  } catch (error) { 
    await client.query('ROLLBACK');
    console.error('Error initializing database tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Test connection and log result
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(error => console.error('Database connection error:', error));

module.exports = { pool, initDB };