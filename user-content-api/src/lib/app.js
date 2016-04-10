const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
require('isomorphic-fetch'); // node-fetch is not available on webtask.io
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const tokenMiddleware = require('./auth/authMiddleware');

const Review = require('./models/Review');
const Link = require('./models/Link');
const Project = require('./models/Project');

const getErrorMessage = require('./getErrorMessage');

module.exports = createServer;

// Connect to database if it has not been done before
function connectDb(uri) {
  const state = mongoose.connections[0].readyState;
  if (state > 0) return;
  console.log('Connecting to', uri);
  mongoose.connect(uri);
  console.log('Connected!');
}

function createServer(localContext) {
  console.log('Start the Express app');
  const app = express();

  app.use(crossDomainMiddleware);
  app.use(dbMiddleware(localContext));

  // body-parser middleware to parse `application/json` content type
  app.use(bodyParser.json());

  // Use the default middleware for authentication,
  // except if an other one is passed through the localContext (for tests)
  const auth = localContext.authMiddleware || tokenMiddleware;

  console.log('Express ready!');

  // GET: used to check the user profile,
  // for debugging purpose / monitoring the microservice
  app.get('/', function (req, res) {
    res.json({
      'result': 'OK!'
    });
  });
  app.get('/token', auth, function (req, res) {
    res.json({
      user: res.userProfile
    });
  });

  // Projects
  app.get('/projects', function (req, res) {
    Project.find({}, 'name')
      .exec()
      .then(json => res.json(json.map(project => Object.assign({}, project.toObject(), {
        key: getProjectKey(project.name)
      }))))
      .catch(err => sendError(res, err.message));
  });

  // REVIEWS API
  createRoutes(app, {
    endPoint: '/reviews',
    Model: Review,
    editableFields: ['rating', 'comment'],
    auth
  });

  // LINKS API
  createRoutes(app, {
    endPoint: '/links',
    Model: Link,
    editableFields: ['url', 'title', 'projects', 'comment'],
    auth
  });

  app.options('*', (req, res, next) => {
    console.log('Options request');
    next();
  });

  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Unknown route!' });
  });

  return app;
}

function createRoutes(app, options) {
  // API URL end point: `/reviews` or `/links`
  const endPoint = options.endPoint;
  const auth = options.auth;

  // Class name defined in parse.com
  const Model = options.Model;

  // Array of field name that can be updated by PUT requests
  const editableFields = options.editableFields;

  // GET: show all reviews
  // Token is NOT required.
  app.get(endPoint, function (req, res) {
    console.log('GET request', options.endPoint);
    Model.find()
      // .populate('project', 'name')
      // .populate('projects', 'name')
      .exec()
      .then(json => {
        const results = json.map(item => item.toJSON());
        res.json({ results });
      })
      .catch(err => sendError(res, err.message));
  });

  // POST: create a new item
  app.post(endPoint, auth, function (req, res) {
    var data = {};
    _.assign(data, req.body, {
      createdBy: res.userProfile.nickname,
      createdAt: new Date()
    });
    data = formatComment(data);
    console.log('----- POST request -----', data);
    const item = new Model(data);
    const validationErrors = item.validateSync();
    if (validationErrors) {
      console.log('>>> Mongoose item.validationSync() fails!', validationErrors);
      return sendError(res, 'Model validation failed', validationErrors);
    }
    Model.canCreate(data)
      .then(() => {
        console.log('SAVING...');
        return item.save();
      })
      .then(result => {
        console.log('ITEM CREATED!', result);
        return res.json(result);
      })
      .catch(err => {
        console.log('NO CREATION', err.message);
        sendError(res, err.message);
      });
  });

  // PUT: update an existing item
  app.put(`${endPoint}/:id`, auth, function (req, res) {
    const id = req.params.id;
    // Keep only `rating` and `comment` fields from the PUT request
    var data = _.pick(req.body, editableFields);
    data = formatComment(data);
    // console.log('PUT request', id, data);

    // Check if the user requesting the update is the one who created the item
    Model.findById(id)
      .then(result => {
        if (!result) return Promise.reject(new Error('No item found with id ' + id));
        if (res.userProfile.nickname !== result.createdBy) {
          return Promise.reject(new Error(getErrorMessage('CREATOR_ONLY')));
        }
        console.log('Update allowed', result.createdBy);
        return result;
      })
      .then(item => {
        _.assign(item, data, {
          updatedAt: new Date(),
        });
        return item.save();
      })
      .then(result => {
        console.log('ITEM UPDATED!');
        return res.json(result);
      })
      .catch(err => {
        console.log('NO UPDATE', err);
        const msg = err.code == '11001' || err.code == '11000' ? getErrorMessage('DUPLICATE_LINK') : err.message;
        sendError(res, msg);
      });
  });
}

//
// Middleware applied to all routes
//

function dbMiddleware(localContext) {
  return function (req, res, done) {
    const context = req.webtaskContext || localContext;
    connectDb(context.data.MONGO_URI);
    done();
  };
}

function crossDomainMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,token');
  next();
}

function getProjectKey(name) {
  return name.toLowerCase().replace(/[^a-z._\-0-9]+/g, '-');
}

function sendError(res, message, data) {
  console.log('>>> Send a JSON error object to the client', message);
  const json = { message };
  if (data) json.data = data;
  res.status(400).json(json);
}

function formatComment(item) {
  const md = item.comment;
  item.comment = {
    md
  };
  return item;
}
