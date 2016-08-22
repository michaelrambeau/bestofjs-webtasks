const mongoose = require('mongoose')
const _ = require('lodash')

const getErrorMessage = require('../getErrorMessage')
const constants = require('./constants')

const fields = {
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    html: String,
    md: {
      type: String,
      maxlength: constants.COMMENT_MAX_LENGTH
    }
  },
  createdAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    maxlength: 100,
    required: true
  },
  updatedAt: { type: Date },
  sample: Boolean
}

const schema = new mongoose.Schema(fields, {
  collection: 'reviews'
})

schema.methods.toJSON = function () {
  const item = this
  const result = _.pick(item, ['_id', 'project', 'rating', 'createdBy', 'createdAt', 'updatedAt'])
  result.comment = item.comment.md
  return result
}

schema.statics.canCreate = function (data) {
  return this.find({ project: data.project, createdBy: data.createdBy })
    .then(results => {
      console.log('Existing reviews by the same user', results)
      if (results.length > 0) {
        throw new Error(getErrorMessage('DUPLICATE_REVIEW'))
      }
      return true
    })
}

const model = mongoose.model('Review', schema)
module.exports = model
