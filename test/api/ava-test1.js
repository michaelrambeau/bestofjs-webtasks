import test from 'ava';
import dotenv from 'dotenv';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const authMiddleware = require('../authMiddleware');

const getItems = require('./helpers').getItems;
const createApp = require('../../user-content-api/src/lib/app');

let app = null;

test.before('setup', t => {
  console.log('setup');
  dotenv.config({ path: '../../.env' });
  const uri = process.env.MONGO_URI_TEST;
  const context = {
    data: {
      MONGO_URI: uri
    },
    authMiddleware
  };
  app = createApp(context);
});

test('GET reviews', async t => {
  const sample = {
    reviews: require('../sample/reviews').results,
    links: require('../sample/links').results
  };
  const items = await getItems(app, 'reviews');

  t.truthy(Array.isArray(items) && items.length > 0, 'Should return some items');
  t.is(sample.reviews.length, items.length, `It should return ${sample.reviews.length} reviews`);
  const checkRating = items.every(review => review.rating > 0);
  t.truthy(checkRating, 'All reviews should have a `rating`');
;

});
