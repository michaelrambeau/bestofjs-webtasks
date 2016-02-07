require('dotenv').load();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const runApiTests = require('./api');
const createApp = require('../user-content-api/src/lib/app');
const authMiddleware = require('./authMiddleware');

const uri = process.env.MONGO_URI_TEST;
const context = {
  data: {
    MONGO_URI: uri
  },
  authMiddleware
};

const app = createApp(context);

runApiTests(app)
  .then(() => finish())
  .catch(err => {
    console.log('Unexpected ERROR!', err.message);
    finish();
  });

function finish() {
  console.log('> Closing the db...');
  mongoose.disconnect((err) => {
    if (err) return console.log(err);
    console.log('Disconnected!');
  });
}
