var express = require('express');
const userRouter = require('./users');
const leadRouter = require('./leads');
var router = express.Router();

/* GET home page. */
router.use("/users",userRouter)
router.use("/leads",leadRouter)

module.exports = router;
