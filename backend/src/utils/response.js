const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

const errorResponse = (message = 'Something went wrong', data = null) => ({
  success: false,
  message,
  data,
});

module.exports = {
  successResponse,
  errorResponse,
};
