// lib/models/stateModel.js

const { query } = require("../query");


const TABLE = 'lead_customer'
module.exports.createLeadCustomer = async (data) => {
    const fields = [];
    const placeholders = [];
    const values = [];
  
    for (const [key, value] of Object.entries(data)) {
        fields.push(`\`${key}\``);
        placeholders.push('?');
        values.push(value );
      
    }
  
    if (fields.length === 0) {
      throw new Error('No valid fields provided for lead creation');
    }
  
    const sql = `INSERT INTO ${TABLE} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    console.log("control on line: 24",sql,values);
    
    return await query(sql, values);
}
