var express = require('express');
const { getLeadRepaymentInfo } = require('../services/leadsService');
var leadRouter = express.Router();

/* GET users listing. */
leadRouter.get('/', async function(req, res, next) {
    // const status = await checkDBConnection();
//   res.json({let: await getUserById(20)});
});


leadRouter.get('/getCustomerDisbursement', async (req, res) => {
  // Access query parameters from req.query in Express
  const pancard = req.query.pancard;

  if (!pancard) {
    // Send a JSON response with status 400 for missing parameter
    return res.status(400).json({ error: 'Missing pancard' });
  }

  try {
    // Call the service function to get data
    const data = await getLeadRepaymentInfo(pancard);

    if (!data) {
      // Send a JSON response with status 404 if lead not found
      return res.status(404).json({ error: 'Lead not found or no data available' });
    }

    // Send a successful JSON response
    return res.status(200).json({ success: true, status: 200, data });
  } catch (err) {
    // Log the error for debugging purposes
    console.error('Database Error in /getCustomerDisbursement:', err);
    // Send a 500 Internal Server Error response
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = leadRouter;
