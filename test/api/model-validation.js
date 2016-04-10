const runModelValidationTests = require('./helpers').runModelValidationTests;

const options = [
  {
    modelName: 'Links',
    path: '/links',
    items: require('./links/invalidItems')
  },
  {
    modelName: 'Reviews',
    path: '/reviews',
    items: require('./reviews/invalidItems')
  }
];

function run(app) {
  const p = options.map(config => runModelValidationTests(app, config));
  return Promise.all(p);
}
module.exports = run;
