import mongoose from 'mongoose';
import { IGenericError, IGenericValidationError } from '../interfaces/error';
import { ZodError } from 'zod';

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

const zodValidationError = (err: ZodError): IGenericError => {
  const errors: IGenericValidationError[] = err.issues.map((i) => ({
    path: i.path[i.path.length - 1],
    message: i.message,
  }));
  return {
    statusCode: 400,
    message: 'Validation Error',
    error: errors,
    stack: err.stack,
  };
};

export { mongooseValidationError, zodValidationError, handleCastError };

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
