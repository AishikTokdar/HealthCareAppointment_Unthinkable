function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.error(err);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict: A record with these details already exists'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found'
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request payload too large'
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && isProduction
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
