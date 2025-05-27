var express = require('express');
const { checkDBConnection } = require('../config/db');
const { getUserById } = require('../db/models/userModel');
var userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', async function(req, res, next) {
    // const status = await checkDBConnection();
  res.json({let: await getUserById(20)});
});

module.exports = userRouter;
