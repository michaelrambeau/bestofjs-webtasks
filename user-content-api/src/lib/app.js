const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
require('isomorphic-fetch') // node-fetch is not available on webtask.io
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

// Helpers
const github = require('./helpers/github')
const sendError = require('./helpers/send-error')

// Middlewares
const tokenMiddleware = require('./middlewares/auth')
const githubMiddleware = require('./middlewares/project-id')
const crossDomainMiddleware = require('./middlewares/cross-domain')

// Models
const Review = require('./models/Review')
const Link = require('./models/Link')
const Project = require('./models/Project')

// Routes
const apiFind = require('./routes/find')
const apiCreate = require('./routes/create')
const apiUpdate = require('./routes/update')

module.exports = createServer

// Connect to database if it has not been done before
function connectDb (uri) {
  const state = mongoose.connections[0].readyState
  if (state > 0) return
  console.log('Connecting to', uri)
  mongoose.connect(uri)
  console.log('Connected!')
}

function createServer (localContext) {
  console.log('Start the Express app')
  const app = express()

  app.use(crossDomainMiddleware)
  app.use(dbMiddleware(localContext))

  // body-parser middleware to parse `application/json` content type
  app.use(bodyParser.json())

  // compression middleware
  app.use(compression())

  // Use the default middleware for authentication,
  // except if an other one is passed through the localContext (for tests)
  const auth = localContext.authMiddleware || tokenMiddleware(localContext)

  console.log('Express ready!')

  // GET: used to check the user profile,
  // for debugging purpose / monitoring the microservice
  app.get('/', function (req, res) {
    res.json({
      'result': 'OK!'
    })
  })
  app.get('/token', auth, function (req, res) {
    res.json({
      user: res.userProfile
    })
  })

  // Projects
  app.get('/projects', function (req, res) {
    Project.find({}, 'name')
      .exec()
      .then(json => res.json(json.map(project => Object.assign({}, project.toObject(), {
        key: getProjectKey(project.name)
      }))))
      .catch(err => sendError(res, err.message))
  })

  // REVIEWS API
  createRoutes(app, {
    endPoint: '/reviews',
    Model: Review,
    editableFields: ['rating', 'comment'],
    projectField: 'project',
    auth
  })

  // LINKS API
  createRoutes(app, {
    endPoint: '/links',
    Model: Link,
    editableFields: ['url', 'title', 'projects', 'comment'],
    projectField: 'projects',
    auth
  })

  // CREATE ISSUES TO ADD PROJECTS AND HEROES
  github.createGithubRoutes(app, auth, sendError)

  app.options('*', (req, res, next) => {
    console.log('Options request')
    next()
  })

  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Unknown route!' })
  })

  return app
}

function createRoutes (app, options) {
  // API URL end point: `/reviews` or `/links`
  const endPoint = options.endPoint
  const auth = options.auth

  // Class name defined in parse.com
  const Model = options.Model

  // GET: show all reviews
  // Token is NOT required.
  app.get(endPoint, apiFind(Model, options))

  // POST: create a new item
  app.post(
    endPoint,
    auth,
    githubMiddleware(options.projectField),
    apiCreate(Model, options)
  )

  // PUT: update an existing item
  app.put(
    `${endPoint}/:id`,
    auth,
    githubMiddleware(options.projectField),
    apiUpdate(Model, options))
}

//
// Middleware applied to all routes
//

function dbMiddleware (localContext) {
  return function (req, res, done) {
    const context = req.webtaskContext || localContext
    connectDb(context.data.MONGO_URI)
    done()
  }
}

function getProjectKey (name) {
  return name.toLowerCase().replace(/[^a-z._\-0-9]+/g, '-')
}
