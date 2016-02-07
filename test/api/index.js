const test = require('tape');
const request = require('supertest');
const checkItemsCount = require('./helpers');
const sample = {
  reviews: require('../sample/reviews').results
};

function run(app) {
  return new Promise((resolve) => {
    test('GET reviews', t => {
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
    test('POST reviews', t => {
      request(app)
      .post('/reviews')
      .send(postData)
      .expect('Content-Type', /json/)
      .expect(401)
      .end(function () {
        t.end();
      });
    });

    checkItemsCount(app, 'reviews', sample.reviews.length);

    // Then, create a new item
    test('POST reviews', t => {
      request(app)
        .post('/reviews')
        .send(postData)
        .set('token', 'tokenXXX')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
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
          t.end();
        });
    });

    checkItemsCount(app, 'reviews', sample.reviews.length + 1);

    // Then try again to create the same review
    // An error should be triggered (only one review by project and by user)

    test('GET links', t => {
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
