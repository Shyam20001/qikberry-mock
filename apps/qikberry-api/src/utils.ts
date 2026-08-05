export class AppError extends Error {
  statusCode: number;
  details: unknown;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const asyncHandler =
  (fn: any) =>
  (req: any, res: any, next: any): Promise<void> =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const sanitizeDeep = (value: any): any => {
  const blocked = new Set(['__proto__', 'constructor', 'prototype']);

  if (Array.isArray(value)) return value.map(sanitizeDeep);

  if (value && typeof value === 'object' && value.constructor === Object) {
    const out: Record<string, any> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (blocked.has(key) || typeof entry === 'function' || entry === undefined) continue;
      out[key] = sanitizeDeep(entry);
    }
    return out;
  }

  if (typeof value === 'string') return value.trim();

  return value;
};
