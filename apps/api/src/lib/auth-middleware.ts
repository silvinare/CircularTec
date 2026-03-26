import { NextFunction, Request, Response } from 'express';
import { UserContext } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

// MVP: usa headers para simular contexto de usuario.
export function mockAuth(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.header('x-user-id') || 'seed-user-id';
  const roleHeader = req.header('x-role');
  const organizationId = req.header('x-organization-id') || 'seed-org-id';

  const role =
    roleHeader === 'ADMIN_MUNICIPIO' ||
    roleHeader === 'OPERADOR_GENERADOR' ||
    roleHeader === 'OPERADOR_RECOLECTOR'
      ? roleHeader
      : 'ADMIN_MUNICIPIO';

  req.user = { userId, role, organizationId };
  next();
}
