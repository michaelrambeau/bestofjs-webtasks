// "Fake" authentication middleware used for tests only

const userProfile = require('./sample/userProfile');

function tokenMiddleware(req, res, done) {
  const token = req.headers.token;
  if (!token) return res.status(401).json({ error: 'Token is required!' });
  res.userProfile = userProfile;
  done();
}
module.exports = tokenMiddleware;
