const mysql = require('mysql2');
require('dotenv').config();

// Set up your MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 20184,
  waitForConnections:true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
});
db.query('SELECT 1', (err) => {
    if (err) {
      console.error('MySQL connection failed:', err);
      return;
    }
    console.log('MySQL Connected');
  
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  
    db.query(createTableQuery, (err, result) => {
      if (err) throw err;
      console.log('Table created or already exists.');
    });
  });
module.exports = db;
