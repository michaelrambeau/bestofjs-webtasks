const request = require('supertest');

function getItems(app, key) {
  console.log('Checking item count', key);
  return new Promise(function (resolve, reject) {
    request(app)
      .get(`/${key}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return reject(err);
        const items = res.body.results;
        return resolve(items);
      });
  });
}

function checkCount(app, key, expectedCount, t) {
  getItems(app, key)
    .then(items => {
      t.ok(Array.isArray(items) && items.length > 0, 'Should return some items');
      t.equal(expectedCount, items.length, `It should return ${expectedCount} items`);
      t.end();
    })
    .catch(err => t.fail(err.message));
}

module.exports = {
  getItems,
  checkCount
};
