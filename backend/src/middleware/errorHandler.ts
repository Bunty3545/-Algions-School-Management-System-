import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
        details: err.details || null,
      },
    });
  }

  // Handle Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
    return res.status(409).json({
      success: false,
      error: {
        name: 'ConflictError',
        message: `A duplicate record already exists for ${target}.`,
        statusCode: 409,
        details: err.meta,
      },
    });
  }

  // Handle Prisma foreign key violation (P2003)
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      error: {
        name: 'ForeignKeyError',
        message: 'Referenced entity does not exist.',
        statusCode: 400,
        details: err.meta,
      },
    });
  }

  // Handle generic unhandled internal server error
  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    success: false,
    error: {
      name: 'InternalServerError',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
      statusCode: 500,
    },
  });
}
