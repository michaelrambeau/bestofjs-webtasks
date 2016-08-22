/* globals fetch */
const http = require('../helpers/http')

function getAppToken (context) {
  const client_secret = context.data.AUTH0_CLIENT_SECRET
  if (!client_secret) Promise.reject('No `client_secret`')
  console.log('Getting the special token required to request full profiles from Github using `client_secret`', client_secret.length)
  const body = {
    'client_id': 'dadmCoaRkXs0IhWwnDmyWaBOjLzJYf4s',
    client_secret,
    'audience': 'https://bestofjs.auth0.com/api/v2/',
    'grant_type': 'client_credentials'
  }
  const options = {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      // 'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  const url = 'https://bestofjs.auth0.com/oauth/token'
  return fetch(url, options)
    .then(response => http.checkStatus(response))
    .then(response => response.json())
    .then(json => json.access_token)
}

// Check the token from request headers and update the `res` object with the user profile.
function createTokenMiddleware (localContext) {
  return function (req, res, done) {
    const context = req.webtaskContext || localContext
    getAppToken(context)
    .then(appToken => {
      console.log('We got the app token', appToken.length)
      const token = req.headers.token
      if (!token) return res.status(401).json({ error: 'Token is required!' })
      console.log('Checking id_token...', token.length)
      getUserProfile(token, function (err, profile) {
        if (err) {
          console.log('Authentication error', err.message)
          return res.status(401).json({
            error: 'Authentication error!',
            message: err.toString()
          })
        }
        if (!profile) return res.status(401).json({ error: 'No user profile' })
        const { user_id, nickname } = profile
        console.log('Auth0 Response OK!', nickname, user_id)
        res.userProfile = profile
        getFullProfile(appToken, user_id, function (err, result) {
          if (err) return res.status(401).json({ error: `Unable to get the app token: ${err.message}` })
          const githubToken = result.identities[0].access_token
          console.log('We got the full profile!', githubToken.length)
          res.githubToken = githubToken
          done()
        })
      })
    })
    .catch(err => {
      console.log('Unable to get the app super token')
      res.status(401).json({ error: err.message })
    })
  }
}

// Get user profile from `id_token` (16 characters token)
function getUserProfile (token, done) {
  if (!token) return done(new Error('Token is missing!'))
  console.log('Auth0 API call with token', token.length)
  const body = {
    id_token: token
  }
  const options = {
    // body,
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      // 'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  const url = 'https://bestofjs.auth0.com/tokeninfo'
  fetch(url, options)
    .then(response => http.checkStatus(response))
    .then(response => response.json())
    .then(json => done(null, json))
    .catch(err => done(err))
}
// ?
function getFullProfile (token, user_id, done) {
  console.log('Get Auth0 full profile for', user_id, token.length)
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
  const url = `https://bestofjs.auth0.com/api/v2/users/${user_id}`
  fetch(url, options)
    .then(response => http.checkStatus(response))
    .then(response => response.json())
    .then(json => done(null, json))
    .catch(err => done(err))
}

module.exports = createTokenMiddleware
