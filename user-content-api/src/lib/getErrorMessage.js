const messages = {
  DUPLICATE_REVIEW: 'A review by the same user already exists!'
};

function getErrorMessage(key) {
  const msg = messages[key] || key;
  return msg;
}

module.exports = getErrorMessage;
