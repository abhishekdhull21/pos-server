const { query } = require("../query");

/**
 * Get detailed repayment summary for a lead by joining multiple tables.
 *
 * @param {number} leadId - ID of the lead
 * @returns {Promise<Object|null>} Repayment details or null if not found
 */
module.exports.getFullRepaymentDetails = async(leadId) =>{
const sql = `
  SELECT 
    leads.lead_id, 
    master_state.m_state_name AS state, 
    leads.pancard, 
    leads.first_name AS customer_name, 
    cam.loan_recommended AS loan_amount, 
    cam.net_disbursal_amount, 
    cam.admin_fee, 
    cam.disbursal_date, 
    cam.repayment_date, 
    cam.adminFeeWithGST AS gst, 
    cam.tenure, 
    cam.roi, 
    dl.disburse_beneficiary_account_no AS customer_bank_account_number, 
    dl.disburse_beneficiary_ifsc_code AS customer_bank_ifsc,
    loan.status as loan_status,
    loan.loan_settled_date,
    loan.loan_closure_date
  FROM leads 
  LEFT JOIN credit_analysis_memo AS cam 
    ON leads.lead_id = cam.lead_id 
  LEFT JOIN api_disburse_logs AS dl 
    ON leads.lead_id = dl.disburse_lead_id 
  LEFT JOIN master_state 
    ON master_state.m_state_id = leads.state_id
  LEFT JOIN loan 
    ON loan.lead_id  = leads.lead_id 
  WHERE leads.lead_id = ?
  LIMIT 1
`;

  const results = await query(sql, [leadId]);
  return results[0] || null;
}
