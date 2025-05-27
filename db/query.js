// db/query.js
// This module provides a centralized, robust function for executing database queries
// compatible with the standard 'mysql' package.

// Import the pool from the correct path.
// Ensure this path correctly points to your config/db.js file.
const pool = require("../config/db");

const MAX_RETRIES = 3; // Maximum number of times to retry a failed query
const RETRY_DELAY = 1000; // 1 second - initial delay before retrying

// Helper function to pause execution for a given number of milliseconds
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes a SQL query with optional parameters, including retry logic and connection management.
 * This version is adapted for the 'mysql' package's callback-based connection.query method.
 *
 * @param {string} sql - The SQL query string to execute.
 * @param {Array<any>} params - An array of parameters to be safely escaped and inserted into the query.
 * @returns {Promise<Array<Object>>} A promise that resolves to the query results (rows).
 * @throws {Error} Throws an error if the query fails after all retries.
 */
module.exports.query = async (sql, params = []) => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now(); // Record the start time of the query attempt
    let connection; // Declare connection here so it's accessible in finally block

    try {
      // Get a connection from the pool. This is asynchronous and callback-based
      // in the 'mysql' package, so we wrap it in a Promise.
      connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
          if (err) {
            // Log connection error details for debugging
            console.error('[Pool Get Connection Error]', err);
            return reject(err);
          }
          resolve(conn);
        });
      });

      // Execute the SQL query with parameters using connection.query.
      // The 'mysql' package handles prepared statements by passing params as an array.
      // This is also callback-based, so we wrap it in a Promise.
      const rows = await new Promise((resolve, reject) => {
        connection.query(sql, params, (queryErr, results) => { // *** CHANGED from .execute to .query ***
          if (queryErr) {
            // Log query error details for debugging
            console.error('[Connection Query Error]', queryErr);
            return reject(queryErr);
          }
          resolve(results); // 'mysql' package directly returns results, not [rows, fields]
        });
      });

      const duration = Date.now() - startTime; // Calculate query duration

      // Log a warning for slow queries
      if (duration > 1000) {
        console.warn(`[Slow Query] Took ${duration}ms: ${sql}`);
      }

      console.info(`[Query Success] Attempt ${attempt + 1} | Duration: ${duration}ms`);
      return rows; // Return the query results
    } catch (error) {
      const duration = Date.now() - startTime; // Calculate duration even on error

      // Determine if the error is retryable (e.g., connection lost, timeout)
      const isRetryable = error.fatal ||
        ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT', 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR', 'ECONNREFUSED', 'EHOSTUNREACH'].includes(error.code);

      // Log detailed error information
      console.error(`[Query Error] Attempt ${attempt + 1} | Duration: ${duration}ms`, {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        message: error.message,
        stack: error.stack
      });

      // If the error is not retryable or we've reached max retries, throw the error
      if (!isRetryable || attempt === MAX_RETRIES) {
        throw new Error(`Database query failed after ${attempt + 1} attempt(s): ${error.sqlMessage || error.message}`);
      }

      // Log that a retry is happening and wait before the next attempt
      console.log(`Retrying query in ${RETRY_DELAY * (attempt + 1)}ms...`);
      await sleep(RETRY_DELAY * (attempt + 1));
    } finally {
      // Ensure the connection is released back to the pool, even if an error occurred.
      // This is critical to prevent connection leaks.
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {
          // Log any errors that occur during connection release (should be rare)
          console.error('[Connection Release Error]', {
            message: releaseError.message,
            stack: releaseError.stack
          });
        }
      }
    }
  }
};
