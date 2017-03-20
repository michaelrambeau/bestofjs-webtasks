const sendError = require('../helpers/send-error')
const errorToString = require('../helpers/error-to-string')

function apiCreate (Model, options) {
  return function (req, res) {
    const body = req.body
    const data = Object.assign({}, body, {
      createdBy: res.userProfile.nickname,
      createdAt: new Date(),
      comment: {
        md: body.comment
      }
    })
    Promise.resolve(data)
      .then(json => {
        Model.canCreate(json)
        return json
      })
      .then(json => {
        const item = new Model(json)
        const validationErrors = item.validateSync()
        if (validationErrors) {
          return sendError(res, 'Model validation failed', validationErrors)
        }
        return item
      })
      .then(item => item.save())
      .then(item => Model.populate(item, { path: options.projectField, select: 'github.full_name' }))
      .then(result => {
        console.log('>>> Result', result)
        const json = Object.assign({}, result.toJSON(), {
          [options.projectField]: req.fullname
        })
        console.log('ITEM CREATED!', json)
        return res.json(result)
      })
      .catch(err => {
        console.log('NO CREATION', err.code)
        sendError(res, errorToString(err))
      })
  }
}

module.exports = apiCreate
