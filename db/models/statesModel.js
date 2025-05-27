// lib/models/stateModel.js

const { query } = require("../query");



const TABLE = 'master_state'

module.exports.findStateByName = async (name) => {
  const sql = `SELECT * FROM ${TABLE} 
     WHERE m_state_name = ? 
     AND m_state_active = 1 
     AND m_state_deleted = 0 
     LIMIT 1`;
  
  return await query(sql, [name])
}
