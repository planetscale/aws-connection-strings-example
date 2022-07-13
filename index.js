require('dotenv').config();
const mysql = require('mysql2');

exports.handler = function () {
  // Creates a connection to the PlanetScale database using the DATABASE_URL environment variable
  const connection = mysql.createConnection(process.env.DATABASE_URL);

  // Executes the query & reads the results
  connection.query("SELECT * FROM Tasks", (err, results) => {
    console.log(results);
  });

  // Close the connection to PlanetScale
  connection.end();

  return {
    statusCode: 200
  }
}