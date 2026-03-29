function errorMiddleware(err, _req, res, next) {
  if (res.headersSent) return next(err);

  if (err.code === 11000) {
    const dupField = err.keyPattern ? Object.keys(err.keyPattern)[0] : null;
    const message =
      dupField === 'email'
        ? 'Email already exists'
        : 'That value is already taken - pick a different one';

    return res.status(400).json({
      success: false,
      message,
    });
  }

  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message =
    statusCode === 500 && !err.isOperational ? 'Something went wrong on our side' : err.message;

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorMiddleware;
