var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  port     : process.env.RDS_PORT  || 3306,
  database: process.env.DB_NAME,

});

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err);
    return;
  }

  console.log('Connected to database.');
});

connection.end();