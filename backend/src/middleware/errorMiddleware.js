const { errorResponse } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json(errorResponse(message));
};

module.exports = errorMiddleware;
