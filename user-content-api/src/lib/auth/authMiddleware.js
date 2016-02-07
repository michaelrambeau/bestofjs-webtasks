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

module.exports = tokenMiddleware;
