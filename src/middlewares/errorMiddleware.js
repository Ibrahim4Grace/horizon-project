export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.success = false;
  }
}

export class BadRequest extends HttpError {
  constructor(message) {
    super(400, message);
  }
}

export class ResourceNotFound extends HttpError {
  constructor(message) {
    super(404, message);
  }
}

export class Unauthorized extends HttpError {
  constructor(message) {
    super(401, message);
  }
}

export class Forbidden extends HttpError {
  constructor(message) {
    super(403, message);
  }
}

export class Conflict extends HttpError {
  constructor(message) {
    super(409, message);
  }
}

export class InvalidInput extends HttpError {
  constructor(message) {
    super(422, message);
  }
}

export class ServerError extends HttpError {
  constructor(message) {
    super(500, message);
  }
}

export const notFoundMIiddleware = (req, res, next) => {
  next(new ResourceNotFound(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    err = new ResourceNotFound('Resource not found');
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
