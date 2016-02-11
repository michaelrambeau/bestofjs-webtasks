const messages = {
  DUPLICATE_REVIEW: 'A review by the same user already exists!',
  CREATOR_ONLY: 'Only the creator can update!'
};

function getErrorMessage(key) {
  const msg = messages[key] || key;
  return msg;
}

module.exports = getErrorMessage;
