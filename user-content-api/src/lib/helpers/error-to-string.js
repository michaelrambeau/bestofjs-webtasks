const getErrorMessage = require('./getErrorMessage')

function errorToString (err) {
  return err.code === 11001 || err.code === 11000 ? (
    getErrorMessage('DUPLICATE_LINK')
  ) : err.message
}

module.exports = errorToString
