const mongoose = require('mongoose');
const _ = require('lodash');

const fields = {
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  },
  rating: Number,
  comment: {
    html: String,
    md: String
  },
  createdAt: { type: Date },
  createdBy: { type: String },
  updatedAt: { type: Date },
  sample: Boolean
};

const schema = new mongoose.Schema(fields, {
  collection: 'reviews'
});


schema.methods.toJSON = function () {
  const item = this;
  const result = _.pick(item, ['_id', 'project', 'rating', 'createdBy', 'createdAt', 'updatedAt']);
  result.comment = item.comment.md;
  return result;
};

schema.statics.canCreate = function (data) {
  return this.find({ project: data.project, createdBy: data.createdBy })
    .then(results => {
      console.log('Existing reviews by the same user', results);
      if (results.length > 0) {
        throw new Error('A review by the same user already exists!');
      }
      return true;
    });
};

const model = mongoose.model('Review', schema);
module.exports = model;
