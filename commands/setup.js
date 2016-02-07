// `npm run setup` command
// Create sample data in the test database
require('dotenv').load();

const setup = require('../test/db/setup');
const connect = require('../test/db/connect');

connect(process.env.MONGO_URI_TEST)
  .then(db => setup(db))
  .then(db => db.close())
  .then(() => console.log('Setup finish!'));
