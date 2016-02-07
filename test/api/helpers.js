const test = require('tape');
const request = require('supertest');

function checkItemsCount(app, key, expectedCount) {
  test(`GET ${key}`, t => {
    request(app)
    .get(`/${key}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if (err) t.fail();
      const items = res.body.results;
      t.ok(Array.isArray(items) && items.length > 0, 'Should return some items');
      t.equal(expectedCount, items.length, `It should return ${expectedCount} items`);
      t.end();
    });
  });
}

module.exports = checkItemsCount;
