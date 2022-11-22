require('dotenv').config();
const mysql = require('mysql2');

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });

const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
const encrypted = process.env['DATABASE_URL'];
let decrypted;

exports.handler = async function () {
  if (!decrypted) {
    // Decrypt code should run once and variables stored outside of the
    // function handler so that these are decrypted once per container
    const kms = new AWS.KMS();
    try {
        const req = {
            CiphertextBlob: Buffer.from(encrypted, 'base64'),
            EncryptionContext: { LambdaFunctionName: functionName },
        };
        const data = await kms.decrypt(req).promise();
        decrypted = data.Plaintext.toString('ascii');
    } catch (err) {
        console.log('Decrypt error:', err);
        throw err;
    }
  }

  // Creates a connection using the decypted version of the connection string
  const connection = mysql.createConnection(decrypted);

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