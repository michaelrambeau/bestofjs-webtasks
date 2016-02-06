// Local server entry point
require('dotenv').load();
const webtask = require('./lib/app');

const context = {
  data: {
    MONGO_URI: process.env.MONGO_URI
  }
};

console.log('Starting manually the Express server', context);
const app = webtask(context);
const PORT = 3000;
console.log('Express server listening on port', PORT);
app.listen(PORT);
