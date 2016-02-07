// used by `setup` and `cleanup` commands files to connect to test database.

const MongoClient = require('mongodb').MongoClient;

function connect(uri) {
  console.log('Connecting', uri);
  return new Promise((resolve, reject) => {
    MongoClient.connect(uri, function (err, db) {
      console.log('Connected correctly to server', uri);
      if (err) return reject(err);
      return resolve(db);
    });
  });
}
module.exports = connect;
