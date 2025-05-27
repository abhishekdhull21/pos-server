// db.js
// This module sets up and exports a MySQL connection pool.

const mysql = require('mysql');

// Load environment variables if not already loaded by app.js
// It's good practice to ensure dotenv is configured here too,
// in case this module is run or tested independently.
require('dotenv').config();

// Database connection configuration using environment variables
const connConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.RDS_PORT || 3306, // Default MySQL port
  database: process.env.DB_NAME,
  connectionLimit: 10, // IMPORTANT: Adjust this based on your database server's capacity and application's needs
  waitForConnections: true, // If all connections are in use, queue new requests
  queueLimit: 0 // No limit on the queue for waiting connections
};

// Create a connection pool
const pool = mysql.createPool(connConfig);

// Test the connection pool when the application starts
pool.getConnection((err, connection) => {
  if (err) {
    // Handle specific connection errors
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused. Check host, port, and credentials.');
    }
    console.error('Error connecting to the database pool:', err.message);
    // Exit the process if the initial connection fails critically
    process.exit(1);
  } else {
    console.log('Successfully connected to the database pool. Connection ID:', connection.threadId);
    // Release the connection back to the pool immediately after testing
    // This connection is just for testing, not for keeping open.
    connection.release();
  }
});

// Export the pool so it can be used in other parts of your application
module.exports = pool;

