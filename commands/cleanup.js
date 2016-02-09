// `npm run cleanup` command
// Remove sample data from the test database
require('dotenv').load();

const cleanup = require('../test/db/cleanup');
const connect = require('../test/db/connect');

connect(process.env.MONGO_URI_TEST)
.then(db => {
  return cleanup(db)
    .then(() => db.close())
    .catch(err => {
      db.close();
      console.log('Error during the cleanup', err.message);
      throw new Error(err.message);
    });
})
.then(() => console.log('Cleanup OK!'))
// exit with an error code to prevent the tests from running if setup fails
.catch(() => process.exit(1));
