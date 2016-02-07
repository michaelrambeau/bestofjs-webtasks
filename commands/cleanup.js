// `npm run cleanup` command
// Remove sample data from the test database
require('dotenv').load();

const cleanup = require('../test/db/cleanup');
const connect = require('../test/db/connect');

connect(process.env.MONGO_URI_TEST)
  .then(db => cleanup(db))
  .then(db => db.close())
  .then(() => console.log('Cleanup finish!'));
