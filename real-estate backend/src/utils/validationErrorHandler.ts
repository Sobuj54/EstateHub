import mongoose from 'mongoose';
import { IGenericError, IGenericValidationError } from '../interfaces/error';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const mongooseValidationError = (
  err: mongoose.Error.ValidationError
): IGenericError => {
  const errors: IGenericValidationError[] = Object.values(
    (err as mongoose.Error.ValidationError).errors
  ).map((e) => {
    return { path: e?.path, message: e?.message };
  });
  return {
    statusCode: 400,
    message: 'Validation Error',
    error: errors,
  };
};

const handleCastError = (err: mongoose.Error.CastError): IGenericError => {
  const errors: IGenericValidationError[] = [
    {
      path: err.path,
      message: 'Invalid Id',
    },
  ];
  return {
    statusCode: 400,
    message: 'Cast Error',
    error: errors,
  };
};

const handleMulterError = (err: MulterError): IGenericError => {
  let message = err.message;
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File too large. Max size is 5MB.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field.';
  }

  const errors: IGenericValidationError[] = [
    {
      path: err.field || '',
      message: message,
    },
  ];

  return {
    statusCode: 400,
    message: message,
    error: errors,
    stack: err.stack,
  };
};

const handleJWTError = (
  err: TokenExpiredError | JsonWebTokenError
): IGenericError => {
  let message = err.message;
  if (err instanceof TokenExpiredError) {
    message = 'Token expired. Please log in again.';
  } else if (err instanceof JsonWebTokenError) {
    message = 'Invalid token. Authentication failed.';
  }

  const errors: IGenericValidationError[] = [{ path: '', message: message }];

  return {
    statusCode: 401,
    message: message,
    error: errors,
    stack: err.stack,
  };
};

const zodValidationError = (err: ZodError): IGenericError => {
  const errors: IGenericValidationError[] = err.issues.map((i) => ({
    path: i.path[i.path.length - 1] || '',
    message: i.message,
  }));
  return {
    statusCode: 400,
    message: 'Validation Error',
    error: errors,
    stack: err.stack,
  };
};

export {
  mongooseValidationError,
  zodValidationError,
  handleCastError,
  handleMulterError,
  handleJWTError,
};

/*
err.issuses look like below:
[
  {
    expected: 'string',
    code: 'invalid_type',
    path: [ 'user', 'role' ],
    message: 'Invalid input: expected string, received undefined'
  },
  {
    code: 'unrecognized_keys',
    keys: [ 'rolex' ],
    path: [ 'user' ],
    message: 'Unrecognized key: "rolex"'
  }
]
*/
