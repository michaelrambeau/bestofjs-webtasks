const _ = require('lodash')
const sendError = require('../helpers/send-error')
const getErrorMessage = require('../helpers/getErrorMessage')
const errorToString = require('../helpers/error-to-string')

function apiUpdate (Model, options) {
  // Array of field name that can be updated by PUT requests
  const editableFields = options.editableFields
  return function (req, res) {
    const itemId = req.params.id
    // Keep only `rating` and `comment` fields from the PUT request
    const body = _.pick(req.body, editableFields)
    const data = Object.assign({}, body, {
      updatedAt: new Date(),
      comment: {
        md: body.comment
      }
    })
    console.log('Data to update', data)

    const getItem = id => Model.findById(id)
      .populate(options.projectField, 'github.full_name')
    Promise.resolve(itemId)
      .then(id => getItem(id))
      .then(item => {
        if (!item) return Promise.reject(new Error('No item found with id ' + itemId))
        if (res.userProfile.nickname !== item.createdBy) {
          return Promise.reject(new Error(getErrorMessage('CREATOR_ONLY')))
        }
        Object.assign(item, data)
        console.log('Update allowed', item)
        return item.save()
          // .then(saved => Object.assign({}, item.toJSON(), saved.toJSON()))
      })
      .then(item => Model.populate(item, { path: options.projectField, select: 'github.full_name' }))
      .then(result => {
        const json = result
        console.log('ITEM UPDATED!', json)
        return res.json(json)
      })
      .catch(err => {
        console.log('NO UPDATE', err)
        sendError(res, errorToString(err))
      })
  }
}

module.exports = apiUpdate
