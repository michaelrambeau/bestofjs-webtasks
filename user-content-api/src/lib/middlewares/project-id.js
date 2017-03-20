const mongoose = require('mongoose')

// From a Github fullname (array or String), `d3/d3` for example
// return the database `_id` that will be saved in the database
function toProjectId (fullname) {
  const Project = mongoose.model('Project')
  if (!fullname) Promise.resolve()
  const fullnames = Array.isArray(fullname) ? fullname : [fullname]
  const query = { 'github.full_name': { $in: fullnames } }
  return Project.find(query)
    .then(result => {
      return result ? result.map(project => project._id) : []
    })
}

function createMiddleware (fieldName) {
  return function (req, res, next) {
    const fullname = req.body[fieldName]
    toProjectId(fullname)
      .then(result => {
        if (!result) next()
        req.body[fieldName] = fieldName === 'projects' ? result : result[0]
        req.fullname = fullname
        // req.fullname = fieldName === 'projects' ? fullname : fullname[0]
        console.log('Middleware OK!', fullname, result)
        next()
      })
      .catch(e => {
        console.error('Middleware error', e)
        next()
      })
  }
}

module.exports = createMiddleware
