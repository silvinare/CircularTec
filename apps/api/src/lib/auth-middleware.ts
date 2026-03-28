import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserContext } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

export function authContext(req: Request, _res: Response, next: NextFunction): void {
  const secret = process.env.JWT_SECRET || 'changeme';
  const authHeader = req.header('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      const payload = jwt.verify(token, secret) as UserContext;
      req.user = payload;
      next();
      return;
    } catch {
      req.user = undefined;
      next();
      return;
    }
  }

  next();
}
