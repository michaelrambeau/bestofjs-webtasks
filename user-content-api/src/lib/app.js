const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
require('isomorphic-fetch'); // node-fetch is not available on webtask.io
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Review = require('./models/Review');
const Link = require('./models/Link');
const Project = require('./models/Project');

module.exports = createServer;

function connectDb(uri) {
  const state = mongoose.connections[0].readyState;
  console.log('state', state);
  if (state > 0) return;
  console.log('Connecting to', uri);
  mongoose.connect(uri);
  console.log('Connected!');
}

function createServer(localContext) {
  console.log('Start the Express app');
  const app = express();

  // Apply custom middlewares to check user token and context credentials
  // app.use(crossDomainMiddleware);
  app.use(dbMiddleware(localContext));
  // app.use(tokenMiddleware);


  // body-parser middleware to parse `application/json` content type
  app.use(bodyParser.json());

  console.log('Express ready!');

  // GET: used to check the user profile,
  // for debugging purpose / monitoring the microservice
  app.get('/', function (req, res) {
    res.json({
      'result': 'OK!'
    });
  });
  app.get('/token', tokenMiddleware, function (req, res) {
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
    editableFields: ['rating', 'comment']
  });

  // LINKS API
  createRoutes(app, {
    endPoint: '/links',
    Model: Link,
    editableFields: ['url', 'title', 'projects', 'comment']
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
  app.post(endPoint, tokenMiddleware, function (req, res) {
    var data = {};
    _.assign(data, req.body, {
      createdBy: res.userProfile.nickname,
    });
    data = formatComment(data);
    Model.canCreate(data)
      .then(() => {
        console.log('POST request...', data);
        const item = new Model(data);
        item.createdAt = new Date();
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
  app.put(`${endPoint}/:id`, tokenMiddleware, function (req, res) {
    const id = req.params.id;
    // Keep only `rating` and `comment` fields from the PUT request
    var data = _.pick(req.body, editableFields);
    data = formatComment(data);
    console.log('PUT request', id, data);

    // Check if the user requesting the update is the one who created the item
    Model.findById(id)
      .then(result => {
        if (res.userProfile.nickname !== result.createdBy) {
          return sendError('Only the creator ' + result.createdBy + ' can update!');
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
        console.log('ITEM UPDATED!', result);
        return res.json(result);
      })
      .catch(err => {
        console.log('NO UPDATE', err);
        sendError(res, err.message);
      });
  });
}

// Get user profile from `id_token` (16 characters token)
function getUserProfile(token, done) {
  if (!token) return done(new Error('Token is missing!'));
  console.log('Auth0 API call...');
  const options = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  const url = 'https://bestofjs.auth0.com/userinfo';
  fetch(url, options)
    .then(response => checkStatus(response))
    .then(response => response.json())
    .then(json => done(null, json))
    .catch(err => done(err));
}

//
// Middleware applied to all routes
//


function dbMiddleware(localContext) {
  return function (req, res, done) {
    const context = localContext ? localContext : req.webtaskContext;
    connectDb(context.data.MONGO_URI);
    done();
  };
}

// Check the token from request headers and update the `res` object with the user profile.
function tokenMiddleware(req, res, done) {
  const token = req.headers.token;
  if (!token) return res.status(401).json({ error: 'Token is required!' });
  console.log('Checking access_token', token);
  getUserProfile(token, function (err, profile) {
    if (err) return res.status(401).json({ error: 'Authentication error' });
    if (!profile) return res.status(401).json({ error: 'No user profile' });
    console.log('Auth0 Response OK!', profile.nickname);
    res.userProfile = profile;
    done();
  });
}

function crossDomainMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,token');
  next();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    console.log('Response=', response.json());
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function getProjectKey(name) {
  return name.toLowerCase().replace(/[^a-z._\-0-9]+/g, '-');
}

function sendError(res, message) {
  res.status(400).json({ message });
}

function formatComment(item) {
  const md = item.comment;
  item.comment = {
    md
  };
  console.log('>> ITEM', item);
  return item;
}
