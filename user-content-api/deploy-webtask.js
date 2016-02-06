// Deploy the microservice on webtask.io
// `name` option is used in the webtask URL:
// https://webtask.it.auth0.com/api/run/wt-mikeair-gmail_com-0/user-content-api/
require('dotenv').load();

const options = [
  '--name user-content-api',
  `--secret MONGO_URI=${process.env.MONGO_URI}`,
  `--secret AUTH0_API_TOKEN=${process.env.AUTH0_API_TOKEN}`,
  `--no-parse --no-merge`
];
const cmd = `wt create ./user-content-api/build/webtask.js ${options.join(' ')}`;
console.log('Starting the deploy process', cmd);

const exec = require('child_process').exec;
exec(cmd, (error, stdout, stderr) => {
  if (stdout) console.log(`OK, here is the URL: ${stdout}`);
  if (stderr) console.log(`stderr: ${stderr}`);
  if (error) console.log(`exec error: ${error}`);
});
