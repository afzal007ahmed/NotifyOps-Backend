function errorMiddleware(err, _req, res, _next) {
  const code = err.code || "ERR";
  const message = err.message || "SOMETHING WENT WRONG!";
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: code,
    message: message,
  });
}


module.exports = { errorMiddleware } ;