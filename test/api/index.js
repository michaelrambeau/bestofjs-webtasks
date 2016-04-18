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
    test('GET reviews', t => {
      getItems(app, 'reviews')
        .then(items => {
          t.ok(Array.isArray(items) && items.length > 0, 'Should return some items');
          t.equal(items.length, sample.reviews.length, `It should return ${sample.reviews.length} reviews`);
          const checkRating = items.every(review => review.rating > 0);
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
    test('POST reviews without a token', t => {
      request(app)
      .post('/reviews')
      .send(postData)
      .expect('Content-Type', /json/)
      .expect(401)
      .end(function () {
        t.end();
      });
    });

    test('Checking count', t => {
      checkCount(app, 'reviews', sample.reviews.length, t);
    });

    // Then, the same request but with a fake token
    const token = '1';
    const username = getUserProfile(token).nickname;
    test('POST reviews with a token', t => {
      request(app)
        .post('/reviews')
        .send(postData)
        .set('token', token)
        .expect(200)
        .end(function (err, result) {
          if (err) {
            console.log(err.message);
            return t.fail(err.message);
          }
          const json = result.body;
          const _id = json._id;
          t.ok(_id, 'The POST response should contain an _id');
          t.equal(_id.length, 24, 'The _id should be a valid mongo id');
          t.equal(json.createdBy, username, `The creator should be ${username}`);
          t.end();
        });
    });

    test('Checking count', t => {
      checkCount(app, 'reviews', sample.reviews.length + 1, t);
    });

    // Create a review by 'usertest2', and then update it.
    createAndUpdate(app, {
      token: '2',
      data0: postData,
      data1: {
        rating: 3
      },
      endPoint: 'reviews'
    });

    test('Checking count', t => {
      checkCount(app, 'reviews', sample.reviews.length + 2, t);
    });

    // Then try again to create the same review
    // An error should be triggered (only one review by project and by user)
    console.log('Creating a duplicate review...');
    test('POST reviews', t => {
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

    test('Checking count', t => {
      checkCount(app, 'links', sample.links.length, t);
    });

    const linkData0 = {
      title: 'A new link',
      url: 'http://devdocs.io/mongoose/',
      projects: '55b16a6d97f4cd0300d28ea8',
      comment: 'devdocs.io is great!',
      sample: true
    };

    createAndUpdate(app, {
      token: '2',
      data0: linkData0,
      data1: {
        comment: 'Updating the comment'
      },
      endPoint: 'links'
    });

    test('Checking count', t => {
      checkCount(app, 'links', sample.links.length + 1, t);
    });

    // Try to create a duplicate link (URL should be unique)
    test('Try to create a duplicate link', t => {
      request(app)
        .post('/links')
        .send(linkData0)
        .set('token', token)
        .expect(400)
        .end(function (err, result) {
          if (err) {
            console.log(err.message);
            return t.fail(err.message);
          }
          const json = result.body;
          t.equal(json.message, getErrorMessage('DUPLICATE_LINK'), `DUPLICATE_LINK error should be returned`);
          t.end();
        });
    });
    test('Try to create a duplicate link', t => {
      request(app)
        .post('/links')
        .send(linkData0)
        .set('token', token)
        .expect(400)
        .end(function (err, result) {
          if (err) {
            console.log(err.message);
            return t.fail(err.message);
          }
          const json = result.body;
          t.equal(json.message, getErrorMessage('DUPLICATE_LINK'), `DUPLICATE_LINK error should be returned`);
          t.end();
        });
    });
    const id = sample.links[0]._id;
    test('Try to update a link setting a URL that exists elsewhere ' + id, t => {
      request(app)
        .put('/links/' + id)
        .send(linkData0)
        .set('token', token)
        .expect(400)
        .end(function (err, result) {
          if (err) {
            console.log(err.message);
            return t.fail(err.message);
          }
          const json = result.body;
          t.equal(json.message, getErrorMessage('DUPLICATE_LINK'), `DUPLICATE_LINK error should be returned`);
          t.end();
        });
    });

    test('GET links', t => {
      request(app)
      .get('/links')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return t.fail(err.message);
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
