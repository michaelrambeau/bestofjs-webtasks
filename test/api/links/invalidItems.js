const validItem = require('./validItem');
const omit = require('lodash/object/omit');

const invalidItems = [
  {
    reason: '`title` too long',
    data: Object.assign({}, validItem, {
      title: 'x'.repeat(150)
    })
  },
  {
    reason: 'no `title`',
    data: omit(validItem, 'title')
  },
  {
    reason: 'no `projects`',
    data: omit(validItem, 'projects')
  },
  {
    // note: if we pass a valid project ID instead of an array,
    // mongoose will automatically make an array from it
    // so `projects: validItem.projects[0]` will not trigger a validation error.
    reason: 'invalid `projects ` (not an array)',
    data: Object.assign({}, validItem, {
      projects: 'xxxxxxxx'
    })
  },
  {
    reason: 'invalid `projects` (not a valid id)',
    data: Object.assign({}, validItem, {
      projects: ['aaaaaaaaaaaaaaa']
    })
  },
  {
    reason: '`URL` too long',
    data: Object.assign({}, validItem, {
      url: 'x'.repeat(150)
    })
  },
  {
    reason: 'no `URL`',
    data: omit(validItem, 'url')
  },
  {
    reason: '`Comment` too long',
    data: Object.assign({}, validItem, {
      comment: 'x'.repeat(1200)
    })
  },
];

module.exports = invalidItems;
