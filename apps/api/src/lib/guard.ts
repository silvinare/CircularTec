import { Request } from 'express';
import { HttpError } from './errors';

export function requireRole(req: Request, allowed: string[]): void {
  const role = req.user?.role;
  if (!role || !allowed.includes(role)) {
    throw new HttpError(403, 'No tenes permisos para esta accion.');
  }
}
