import jwt from 'jsonwebtoken';
import { ZodError, type ZodTypeAny } from 'zod';
import { AppError } from './utils';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }
  return secret;
};

export const auth = (req: any, _res: any, next: any) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid token', 401));
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    next(new AppError('Token invalid or expired', 401));
  }
};

export const requireAdmin = (req: any, _res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

export const validate =
  (schema: ZodTypeAny) =>
  (req: any, res: any, next: any) => {
    try {
      const parsed: any = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (parsed.body !== undefined) req.body = parsed.body;

      req.validated = parsed;
      res.locals.validated = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError('Validation failed', 400, {
            issues: error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message
            }))
          })
        );
      }
      next(error);
    }
  };

export const notFound = (_req: any, _res: any, next: any) => {
  next(new AppError('Route not found', 404));
};

export const errorHandler = (err: any, _req: any, res: any, _next: any) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    details: err.details || null
  });
};