function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict: Unique constraint failed',
      fields: err.meta ? err.meta.target : []
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
