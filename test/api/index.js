const test = require('tape');
const request = require('supertest');
const getItems = require('./helpers').getItems;
const checkCount = require('./helpers').checkCount;
const createAndUpdate = require('./create-update');
const getErrorMessage = require('../../user-content-api/src/lib/getErrorMessage');
const getUserProfile = require('../sample/getUserProfile');
const sample = {
  reviews: require('../sample/reviews').results,
  links: require('../sample/links').results
};

function run(app) {
  return new Promise((resolve) => {
    if (true) test('GET reviews', t => {
      request(app)
      .get('/reviews')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) t.fail();
        const reviews = res.body.results;
        t.ok(Array.isArray(reviews) && reviews.length > 0, 'Should return some reviews');
        t.equal(sample.reviews.length, reviews.length, `It should return ${sample.reviews.length} reviews`);
        const checkRating = reviews.every(review => review.rating > 0);
        t.ok(checkRating, 'All reviews should have a `rating`');
        t.end();
      });
    });

    const postData = {
      comment: 'This is a test',
      project: '55723c9f4140883353bc773e',
      rating: 4,
      sample: true
    };

    // First send an invalid request (no token)
    if (true) test('POST reviews', t => {
      request(app)
      .post('/reviews')
      .send(postData)
      .expect('Content-Type', /json/)
      .expect(401)
      .end(function () {
        t.end();
      });
    });

    if (false) test('Checking count', t => {
      getItems(app, 'reviews')
        .then(items => {
          t.ok(Array.isArray(items) && items.length > 0, 'Should return some items');
          const expectedCount = sample.reviews.length;
          t.equal(expectedCount, items.length, `It should return ${expectedCount} items`);
          t.end();
        })
        .catch(err => t.fail(err.message));
    });

    // Then, the same request but with a fake token
    const token = '1';
    const username = getUserProfile(token).nickname;
    if (true) test('POST reviews', t => {
      request(app)
        .post('/reviews')
        .send(postData)
        .set('token', token)
        .expect(200)
        .end(function (err, result) {
          if (err) {
            console.log(err.message);
            t.fail();
          }
          const json = result.body;
          const _id = json._id;
          t.ok(_id, 'The POST response should contain an _id');
          t.equal(_id.length, 24, 'The _id should be a valid mongo id');
          t.equal(json.createdBy, username, `The creator should be ${username}`);
          t.end();
        });
    });

    if (true) test('Checking count', t => {
      checkCount(app, 'reviews', sample.reviews.length + 1, t);
    });

    // Create a review by 'usertest2', and then update it.
    if (true) createAndUpdate(app, {
      token: '2',
      data0: postData,
      data1: {
        rating: 3
      },
      endPoint: 'reviews'
    });

    if (true) test('Checking count', t => {
      checkCount(app, 'reviews', sample.reviews.length + 2, t);
    });

    // Then try again to create the same review
    // An error should be triggered (only one review by project and by user)
    console.log('Creating a duplicate review...');
    if (true) test('POST reviews', t => {
      request(app)
      .post('/reviews')
      .send(postData)
      .set('token', token)
      .expect(400)
      .end(function (err, result) {
        const json = result.body;
        t.equal(json.message, getErrorMessage('DUPLICATE_REVIEW'));
        t.end();
      });
    });

    // LINKS

    if (true) test('Checking count', t => {
      checkCount(app, 'links', sample.links.length, t);
    });

    createAndUpdate(app, {
      token: '2',
      data0: {
        title: 'A new link',
        url: 'http://devdocs.io/mongoose/',
        comment: 'devdocs.io is great!',
        sample: true
      },
      data1: {
        comment: 'Updating the comment'
      },
      endPoint: 'links'
    });

    if (true) test('Checking count', t => {
      checkCount(app, 'links', sample.links.length + 1, t);
    });

    if (true) test('GET links', t => {
      request(app)
      .get('/links')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) t.fail();
        const links = res.body.results;
        t.ok(Array.isArray(links) && links.length > 0, 'Should return some links');
        const checkUrl = links.every(link => link.url.length > 0);
        t.ok(checkUrl, 'All links should have a `url`');
        t.end();
        // Return a resolved promise after the last test
        // TODO run tests in parallel
        return resolve();
      });
    });
  });
}

module.exports = run;
