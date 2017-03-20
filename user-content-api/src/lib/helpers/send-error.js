function sendError (res, message, data) {
  console.log('>>> Send a JSON error object to the client', message)
  const json = { message }
  if (data) json.data = data
  res.status(400).json(json)
}

module.exports = sendError
