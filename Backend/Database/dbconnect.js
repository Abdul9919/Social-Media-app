const { Pool } = require('pg');
const fs = require('fs')
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initDB = async () => {
  try {
    // Check if the SQL file exists
    const sqlFilePath = './Database/database.sql';
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    // Read the SQL file
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL commands
    await pool.query(sql);
    console.log('Database tables initialized successfully');
  }
  catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}

// Test connection and log result
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(error => console.error('Database connection error:', error));

module.exports = { pool, initDB };