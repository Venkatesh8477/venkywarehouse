const { errorResponse } = require('../utils/response');

const notFoundMiddleware = (req, res) => {
  res.status(404).json(errorResponse(`Route not found: ${req.originalUrl}`));
};

module.exports = notFoundMiddleware;
