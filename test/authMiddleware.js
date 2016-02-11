// "Fake" authentication middleware used for tests only

const getUserProfile = require('./sample/getUserProfile');

function tokenMiddleware(req, res, done) {
  const token = req.headers.token;
  if (!token) return res.status(401).json({ error: 'Token is required!' });
  res.userProfile = getUserProfile(token);
  done();
}
module.exports = tokenMiddleware;
