import { Request } from 'express';
import { HttpError } from './errors';

export function requireRole(req: Request, allowed: string[]): void {
  if (!req.user) {
    throw new HttpError(401, 'Debes iniciar sesion para continuar.');
  }

  const role = req.user?.role;
  if (!role || !allowed.includes(role)) {
    throw new HttpError(403, 'No tenes permisos para esta accion.');
  }
}
