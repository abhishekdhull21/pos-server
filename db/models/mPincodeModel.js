// lib/models/stateModel.js

const { query } = require("../query");


const TABLE = 'master_pincode'

module.exports.findByPincode = async (pincode) => {
  const sql = `SELECT * FROM ${TABLE} 
     WHERE m_pincode_value = ? 
     AND m_pincode_active = 1 
     AND m_pincode_deleted = 0 
     LIMIT 1`;
  
  return await query(sql, [pincode])
}
