/*
Return an array of invalid "reviews"
*/
const validItem = require('./validItem');
const omit = require('lodash').omit;

const invalidItems = [
  {
    reason: 'no `project`',
    data: omit(validItem, 'project')
  },
  {
    reason: 'invalid `project`',
    data: Object.assign({}, validItem, {
      project: 'aaaaaaaaaaaaaaa'
    })
  },
  {
    reason: 'no `rating`',
    data: omit(validItem, 'rating')
  },
  {
    reason: 'invalid `rating` (string)',
    data: Object.assign({}, validItem, {
      rating: 'aaaaaaaaaaaaaaa'
    })
  },
  {
    reason: 'invalid `rating` (> 5)',
    data: Object.assign({}, validItem, {
      rating: 6
    })
  },
  {
    reason: '`Comment` too long',
    data: Object.assign({}, validItem, {
      comment: 'x'.repeat(1200)
    })
  },
];

module.exports = invalidItems;
