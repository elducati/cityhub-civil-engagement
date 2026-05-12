import { Request, Response, NextFunction } from 'express';

export function responseEnvelope(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: unknown): Response {
    if (res.statusCode >= 400 || res.statusCode === 204) {
      return originalJson(body);
    }
    const obj = body as Record<string, unknown> | null;
    if (obj && 'success' in obj) {
      return originalJson(body);
    }
    return originalJson({ success: true, data: body, error: null });
  };

  next();
}
