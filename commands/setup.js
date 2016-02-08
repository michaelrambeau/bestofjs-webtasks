// `npm run setup` command
// Create sample data in the test database
require('dotenv').load();

const setup = require('../test/db/setup');
const connect = require('../test/db/connect');

connect(process.env.MONGO_URI_TEST)
  .then(db => {
    return setup(db)
      .then(() => db.close())
      .catch(err => {
        db.close();
        console.log('Error during the setup', err.message);
        throw new Error(err.message);
      });
  })
  .then(() => console.log('Setup OK!'))
  // exit with an error code to prevent the tests from running if setup fails
  .catch(() => process.exit(1));
