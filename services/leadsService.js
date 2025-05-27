// services/leadsService.js
// This module provides business logic for handling lead-related operations.

// Convert ES module imports to CommonJS requires
const { getFullRepaymentDetails } = require('../db/helper/repayment'); // Adjust path as needed
const { checkBlacklistedPancard } = require('../db/models/blacklistedPancards'); // Adjust path
const { createLeadCustomer } = require('../db/models/customerModel'); // Adjust path
const { createLeadEmployment } = require('../db/models/leadEmployment'); // Adjust path
const {
  createLeadStep,
  getLeads,
  updateLeadStep,
} = require('../db/models/leadsModel'); // Adjust path
const { findByPincode } = require('../db/models/mPincodeModel'); // Adjust path
const { findStateByName } = require('../db/models/statesModel'); // Adjust path
const { parseFullName } = require('../utils'); // Adjust path

// Convert ES module export to CommonJS module.exports for the function
async function getLeadRepaymentInfo(pancard) {
  const lead = await getLeads({
    where: { pancard },
    limit: 1,
    orderBy: "created_on",
    order: "DESC",
    single: true,
  });
  console.log("lead for pancard: ", pancard, lead);
  const leadID = lead?.lead_id;

  if (!leadID) return null;

  const repaymentInfo = await getFullRepaymentDetails(leadID);

  return repaymentInfo || null;
}

/**
 * Save or update lead by pancard and step data
 *
 * @param {string} step - The current step of the lead form (e.g., 1, 2, 3, etc.)
 * @param {string} pancard - Unique identifier for the lead
 * @param {object} leadData - Data to insert or update
 */
async function saveLeadByStep(step, pancard, leadData) {
  if (!pancard) throw new Error("Pancard is required");

  if (step === 1) {
    // Step 1: Initial Info
    let isBlacklisted = 0;
    const blacklisted_pan = await checkBlacklistedPancard(pancard);
    if (blacklisted_pan?.pancard) {
      isBlacklisted = 1;
    }
    const utm_source =
      leadData?.utm_source?.toUpperCase()?.replace(/[^a-zA-Z]/g, "") || "";
    const initials = {
      lead_black_list_flag: isBlacklisted,
      mobile:  String(leadData?.mobile || "").replace(/\D/g, ""),
      pancard:pancard.toUpperCase()?.trim(),
      user_type: "NEW",
      lead_entry_date: new Date(),
      created_on: new Date(),
      stage: "S1",
      lead_status_id: 1,

      qde_consent: "Y",
      utm_source: "WEB",
      lead_is_mobile_verified: 1,

      source:
        utm_source === "C4C"
          ? "C4C"
          : utm_source === "REFCASE"
          ? "refcase"
          : "Import",

      utm_campaign:
        leadData?.utm_campaign?.toUpperCase()?.replace(/[^a-zA-Z]/g, "") || "",
      ip: leadData?.ip || "",
    };
    return await createLeadStep(initials);
  }

  if (step === 2) {
    // Step 2: Personal Info
    const personalInfo = {
      name: leadData?.name?.replace(/[^a-zA-Z ]/g, "") || "",
      email: leadData?.email || "",
      // gender:
      //   leadData?.gender?.toUpperCase() === "MALE" ||
      //   leadData?.gender?.toUpperCase() === "FEMALE"
      //     ? leadData.gender.toUpperCase()
      //     : "",
      // dob: leadData?.dob
      //   ? new Date(leadData.dob).toISOString().split("T")[0]
      //   : null,
      //   updated_on: new Date()
    };
    return await updateLeadStep(pancard, personalInfo);
  }

  if (step === 3) {
    // Step 3: Address Info
    const pincode = leadData?.pincode?.replace(/\D/g, "") || "";
    const city_name = leadData?.city_name || "";
    const state_name = leadData?.state_name || "";
    let state_id = null;
    let m_pincode_city_id = null;

    if (state_name) {
      const state = await findStateByName(state_name);
      if (state) {
        state_id = state.m_state_id;
      }
    }
    if(pincode){
     const mPincode = await findByPincode(pincode);
     m_pincode_city_id = mPincode?.m_pincode_city_id
    }

    const addressInfo = {
      pincode,
      // city_name,
      // state_name,
      state_id,
      city_id:m_pincode_city_id,
              updated_on: new Date()

    };
    return await updateLeadStep(pancard, addressInfo);
  }

  if (step === 4) {
    // Step 4: Loan Requirement Info
    const loanRequirement = {
      loan_amount: parseInt(leadData?.loan_amount || 0),
      obligations: parseInt(leadData?.obligations || 0),
              updated_on: new Date()

    };
    return await updateLeadStep(pancard, loanRequirement);
  }

  if (step === 5) {
    // Step 5: Employment Info
    const employementInfo = {
      company_name: leadData?.company_name?.toUpperCase()?.trim() || "",
      designation: leadData?.designation?.toUpperCase()?.trim() || "",
      monthly_income: parseInt(leadData?.monthly_income || 0),
              updated_on: new Date()

    };
    return await updateLeadStep(pancard, employementInfo);
  }

  if (step === 6) {
    // Final Step: we create more info and checks here
    const lead = await getLeads({
      where:{
        pancard,
      },
      orderBy:'created_on',
      order:'DESC',
      limit:1,
      single:true
    })
    const { first_name, middle_name = "", last_name = "" } =parseFullName(lead?.firstName)
    await createLeadCustomer({
          customer_lead_id: lead.lead_id,
          first_name,
          middle_name,
          sur_name: last_name,
          gender: lead.gender || "",
          dob: lead.dob || "",
          mobile: lead?.mobile,
          email:lead?.email,
          pancard,
          state_id: lead?.state_id,
          city_id: lead.city_id,
          cr_residence_pincode: lead?.pincode,
          created_date: new Date(),
    });
    await createLeadEmployment({
          lead_id: lead.lead_id,
          emp_email: lead?.email,
          created_on: new Date(),
        });
  }
}

// Export the functions using CommonJS module.exports
module.exports = {
  getLeadRepaymentInfo,
  saveLeadByStep
};
