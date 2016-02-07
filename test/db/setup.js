// Used by `.commands/setup.js` command file to create sample data for tests
const sample = {
  reviews: require('../sample/reviews'),
  links: require('../sample/links')
};

const collections = [
  'reviews',
  'links'
];
function setup(db) {
  return new Promise((resolve, reject) => {
    return Promise.all(collections.map(
      key => createCollection(db, key))
    )
    .then(() => resolve(db))
    .catch(err => reject(err));
  });
}

function createCollection(db, key) {
  const collection = db.collection(key);
  return new Promise((resolve, reject) => {
    const docs = sample[key].results.map(
      item => Object.assign({}, item, {
        sample: true
      })
    );
    collection.insert(docs, (err, result) => {
      if (err) return reject(err);
      const count = result.result.n;
      console.log(count, `${key} inserted`);
      return resolve(db);
    });
  });
}

module.exports = setup;
