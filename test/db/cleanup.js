// Used by `.commands/cleanup.js` command file to delete sample data.
const collections = [
  'reviews',
  'links'
];
function cleanup(db) {
  return new Promise((resolve, reject) => {
    return Promise.all(collections.map(
      key => deleteCollection(db, key))
    )
    .then(() => resolve(db))
    .catch(err => reject(err));
  });
}

function deleteCollection(db, key) {
  const collection = db.collection(key);
  return new Promise((resolve, reject) => {
    const docs = {
      sample: true
    };
    console.log('Removing...', key);
    collection.deleteMany(docs, null, (err, result) => {
      if (err) return reject(err);
      const count = result.result.n;
      if (count > 0) {
        console.log(count, `${key} deleted`);
      } else {
        console.log(`No ${key} item to delete.`);
      }
      return resolve(db);
    });
  });
}
module.exports = cleanup;
