const mongoose = require('mongoose');
const _ = require('lodash');

const fields = {
  projects: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  }],
  title: {
    type: String
  },
  url: {
    type: String
  },
  comment: {
    html: String,
    md: String
  },
  createdAt: {
    type: Date
  },
  createdBy: { type: String },
  updatedAt: { type: Date }
};

const schema = new mongoose.Schema(fields, {
  collection: 'links'
});

schema.methods.toJSON = function () {
  const item = this;
  const result = _.pick(item, ['_id', 'title', 'url', 'projects', 'createdBy', 'createdAt']);
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
        throw new Error('A link already exists with the same URL!');
      }
      return true;
    });
};

const model = mongoose.model('Link', schema);
module.exports = model;
