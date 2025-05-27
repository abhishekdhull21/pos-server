const { query } = require("../query");

// src/db/models/leadModel.js
const allowedFields = [
  "first_name", "mobile", "email", "alternate_email", "designation",
  "company_name", "state_name", "city_name", "pincode", "gender", "loan_amount",
  "obligations", "monthly_income", "pancard", "dob", "coordinates", "utm_source","ip",
  "utm_campaign", "coupon", "rejectd_flag","lead_status_id","qde_consent"
];

/**
 * Get all leads (optional limit or filters can be added)
 */
module.exports.getAllLeads = async(limit = 100)=> {
  return await query('SELECT * FROM leads ORDER BY created_at DESC LIMIT ?', [limit]);
}

/**
 * Get a lead by ID
 */
module.exports.getLeadById = async(id) => {
  return await query('SELECT * FROM leads WHERE id = ?', [id]);
}

/**
 * Find leads by email
 */
module.exports.findLeadsByEmail = async(email)=> {
  return await query('SELECT * FROM leads WHERE email = ?', [email]);
}


/**
 * Get leads with flexible filters, ordering, and limit.
 *
 * @param {Object} options - Options for filtering and retrieval
 * @param {Object} [options.where] - Key-value pairs of fields to filter by (e.g., { email: 'a@b.com' })
 * @param {string} [options.orderBy] - Column name to order by (e.g., 'created_at')
 * @param {'ASC'|'DESC'} [options.order] - Sort order (default is 'DESC')
 * @param {number} [options.limit] - Limit the number of returned results
 * @param {boolean} [options.single] - Return only the first matched record
 * 
 * @returns {Promise<Object|Object[]>} - A single lead or an array of leads
 *
 * @example
 *   await getLeads({ where: { email: 'abc@xyz.com' }, limit: 1, single: true });
 *   await getLeads({ where: { status: 'open', source: 'web' }, orderBy: 'created_at' });
 */
module.exports.getLeads = async(options = {})=> {
  const {
    where = {},
    orderBy,
    order = 'DESC',
    limit,
    single = false,
  } = options;

  // Allowed fields to avoid SQL injection
  const allowedFields = ['id', 'email', 'phone', 'status', 'source', 'created_on','pancard'];
  const whereClauses = [];
  const values = [];

  // Build WHERE clause
  for (const [key, val] of Object.entries(where)) {
    if (!allowedFields.includes(key)) {
      throw new Error(`Invalid field name in where: ${key}`);
    }
    whereClauses.push(`\`${key}\` = ?`);
    values.push(val);
  }

  let sql = 'SELECT * FROM leads';

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }

  if (orderBy) {
    if (!allowedFields.includes(orderBy)) {
      throw new Error(`Invalid orderBy field: ${orderBy}`);
    }
    sql += ` ORDER BY \`${orderBy}\` ${order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
  }

  if (limit && !isNaN(limit)) {
    sql += ' LIMIT ?';
    values.push(Number(limit));
  }

  const results = await query(sql, values);
  return single ? results[0] : results;
}

/**
 * Create a new lead with dynamic fields
 * Ensures only allowed fields are inserted
 */
module.exports.createLeadStep = async(data) =>{

  const fields = [];
  const placeholders = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`\`${key}\``);
      placeholders.push('?');
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields provided for lead creation');
  }

  const sql = `INSERT INTO leads (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
  return await query(sql, values);
}

/**
 * Update an existing lead using id or pancard
 */
module.exports.updateLeadStep = async(idOrPancard, data) =>{
//pancard , mobile, firstname, email, 
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`\`${key}\` = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields provided for update');
  }

  const identifier = isNaN(idOrPancard) ? 'pancard' : 'id';
  values.push(idOrPancard);

  const sql = `UPDATE leads SET ${fields.join(', ')} WHERE \`${identifier}\` = ?`;
  return await query(sql, values);
}


/**
 * Create a new lead
 */
module.exports.createLead = async({ name, email, phone })=> {
  return await query(
    'INSERT INTO leads (name, email, phone) VALUES (?, ?, ?)',
    [name, email, phone]
  );
}

/**
 * Update a lead
 */
module.exports.updateLead = async(id, updates) =>{
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);

  const sql = `UPDATE leads SET ${fields.join(', ')} WHERE id = ?`;
  return await query(sql, values);
}

/**
 * Delete a lead
 */
module.exports.deleteLead = async(id) =>{
  return await query('DELETE FROM leads WHERE id = ?', [id]);
}
