// lib/models/stateModel.js

const { query } = require("../query");



const TABLE = 'blacklisted_pan'

module.exports.checkBlacklistedPancard = async (pancard) => {
  const sql = `SELECT * FROM ${TABLE} 
     WHERE pancard = ?`;
    
  
  return query(sql,[pancard])
}
