function success(data) {
  return {
    success: true,

    timestamp: new Date(),

    data,
  };
}

function failure(message) {
  return {
    success: false,

    timestamp: new Date(),

    message,
  };
}

module.exports = {
  success,
  failure,
};
