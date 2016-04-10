const request = require('supertest');
const test = require('tape');

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

function runModelValidationTests(app, options) {
  console.log('> start the loop', options.items.length);
  const p = options.items.map(item => {
    return new Promise(resolve => {
      console.log('Check item', item);
      test(`"${options.modelName}" model validation rules ${item.reason}`, (t) => {
        request(app)
          .post(options.path)
          .send(item.data)
          .expect('Content-Type', /json/)
          .set('token', '1')
          .expect(400)
          .end(function (err, result) {
            const json = result.body;
            console.log('RESULT', err, json);
            //t.fail('Big failure!')
            t.ok(json.message);
            t.end();
            return resolve();
          });
      });
    });
  });
  return Promise.all(p);
}

module.exports = {
  getItems,
  checkCount,
  runModelValidationTests
};
