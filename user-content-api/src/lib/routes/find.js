const sendError = require('../helpers/send-error')

function apiFind (Model, options) {
  return function (req, res) {
    console.log('GET request', options.endPoint)
    Model.find()
      .populate(options.projectField, 'github.full_name')
      .exec()
      .then(json => {
        const results = json.map(item => item.toJSON())
        res.json({ results })
      })
      .catch(err => sendError(res, err.message))
  }
}

module.exports = apiFind
