const mongoose = require('mongoose');
const _ = require('lodash');

const getErrorMessage = require('../getErrorMessage');
const constants = require('./constants');

const fields = {
  projects: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    maxlength: constants.TITLE_MAX_LENGTH,
    required: true
  },
  url: {
    type: String,
    maxlength: constants.URL_MAX_LENGTH,
    required: true,
    unique: true
  },
  comment: {
    html: String,
    md: {
      type: String,
      maxlength: constants.COMMENT_MAX_LENGTH
    },
  },
  createdAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedAt: { type: Date },
  sample: Boolean
};

const schema = new mongoose.Schema(fields, {
  collection: 'links'
});

schema.methods.toJSON = function () {
  const item = this;
  const result = _.pick(item, ['_id', 'title', 'url', 'projects', 'createdBy', 'createdAt', 'updatedAt']);
  // result.id = item._id;
  // result.projects = item.projects.map(project => project.key);
  result.comment = item.comment.md;
  return result;
};

schema.statics.canCreate = function (data) {
  return this.find({ url: data.url })
    .then(results => {
      console.log('Checking existing reviews', results);
      if (results.length > 0) {
        throw new Error(getErrorMessage('DUPLICATE_LINK'));
      }
      return true;
    });
};

const model = mongoose.model('Link', schema);
module.exports = model;
