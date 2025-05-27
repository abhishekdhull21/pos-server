// src/db/models/userModel.js
// This module defines functions for interacting with the 'users' table,
// utilizing the centralized 'query' function.

// Import the reusable query function
const { query } = require('../query.js'); // Adjust path if your file structure differs

/**
 * Retrieves a user by their ID from the database.
 * @param {number} userId - The ID of the user to retrieve.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array containing the user object (or empty array if not found).
 */
module.exports.getUserById = async(userId) => {
  // Simply call the query function with the SQL and parameters
  return await query('SELECT * FROM users WHERE user_id = ?', [userId]);
}

/**
 * Creates a new user in the database.
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @returns {Promise<Object>} A promise that resolves to the result of the INSERT operation (e.g., insertId).
 */
module.exports.createUser =async (name, email) =>{
  // Simply call the query function with the SQL and parameters
  return await query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
}