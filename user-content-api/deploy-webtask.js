// Deploy the microservice on webtask.io
// `name` option is used in the webtask URL:
// https://webtask.it.auth0.com/api/run/wt-mikeair-gmail_com-0/user-content-api-dev/
require('dotenv').load();
const minimist = require('minimist');

const version = 'v1'; // version number added at the end of the production URL

// Check command line arguments
const argv = minimist(process.argv.slice(2));
const prod = argv.prod;

const options = [
  `--name user-content-api-${prod ? version : 'dev'}`,
  `--secret MONGO_URI=${process.env.MONGO_URI}`,
  `--secret AUTH0_API_TOKEN=${process.env.AUTH0_API_TOKEN}`,
  `--no-parse --no-merge`
];

// Add `--prod` parameter if it was specified from the command line.
if (argv.prod) options.push('--prod');

const cmd = `wt create ./user-content-api/build/webtask.js ${options.join(' ')}`;
console.log('Starting the deploy process', cmd);

const exec = require('child_process').exec;
exec(cmd, (error, stdout, stderr) => {
  if (stdout) console.log(`OK, here is the URL: ${stdout}`);
  if (stderr) console.log(`stderr: ${stderr}`);
  if (error) console.log(`exec error: ${error}`);
});
