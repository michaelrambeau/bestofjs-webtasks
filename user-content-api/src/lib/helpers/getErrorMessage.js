const messages = {
  DUPLICATE_REVIEW: 'A review by the same user already exists!',
  CREATOR_ONLY: 'Only the creator can update!',
  DUPLICATE_LINK: 'A link with the same URL already exists!'
};

function getErrorMessage(key) {
  const msg = messages[key] || key;
  return msg;
}

module.exports = getErrorMessage;
