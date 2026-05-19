import { ErrorRequestHandler } from 'express';
import config from '../config';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  // Format response
  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: err,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

export default globalErrorHandler;
