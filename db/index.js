// src/db/index.js
import mysql from 'mysql2/promise';

// Log environment variables (safely)
console.log('Database Configuration:', {
  host: process.env.MYSQL_HOST ? 'Set' : 'Not Set',
  port: process.env.MYSQL_PORT ? 'Set' : 'Not Set',
  user: process.env.MYSQL_USER ? 'Set' : 'Not Set',
  database: process.env.MYSQL_DATABASE ? 'Set' : 'Not Set',
  standaloneConfig: process.env?.__NEXT_PRIVATE_STANDALONE_CONFIG ? 'Available' : 'Not Available'
});
console.log('Database Configuration:', {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  standaloneConfig: process.env?.__NEXT_PRIVATE_STANDALONE_CONFIG
});

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env?.__NEXT_PRIVATE_STANDALONE_CONFIG?.env?.MYSQL_HOST,
  port: process.env.MYSQL_PORT || process.env?.__NEXT_PRIVATE_STANDALONE_CONFIG?.env?.MYSQL_PORT,
  user: process.env.MYSQL_USER || process.env?.__NEXT_PRIVATE_STANDALONE_CONFIG?.env?.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD || process.env?.__NEXT_PRIVATE_STANDALONE_CONFIG?.env?.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env?.__NEXT_PRIVATE_STANDALONE_CONFIG?.env?.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 10,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 120000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export default pool;
