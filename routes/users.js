var express = require('express');
const { checkDBConnection } = require('../config/db');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
    // const status = await checkDBConnection();
  res.json({done:"l"});
});

module.exports = router;
