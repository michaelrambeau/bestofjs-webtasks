function crossDomainMiddleware (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,token')
  res.header('Cache-Control', 'max-age=7200')
  next()
}

module.exports = crossDomainMiddleware
