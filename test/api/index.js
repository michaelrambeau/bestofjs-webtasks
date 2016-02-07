const test = require('tape');
const request = require('supertest');

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
        const checkRating = reviews.every(review => review.rating > 0);
        t.ok(checkRating, 'All reviews should have a `rating`');
        t.end();
      });
    });

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
  })
}

module.exports = run;
