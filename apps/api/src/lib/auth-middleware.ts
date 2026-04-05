import { NextFunction, Request, Response } from 'express';
import { prisma } from '@circulartec/db';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { UserContext } from '../types/auth';
import { verifyUserToken } from './jwt';

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

export function authContext(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.replace('Bearer ', '').trim();

  void (async () => {
    try {
      const payload = verifyUserToken(token);
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: payload.organizationId,
          userId: payload.userId,
          role: payload.role
        },
        include: {
          organization: {
            select: {
              status: true
            }
          },
          user: {
            select: {
              status: true
            }
          }
        }
      });

      if (
        !membership ||
        membership.user.status !== 'ACTIVE' ||
        membership.organization.status !== 'ACTIVE'
      ) {
        req.user = undefined;
        next();
        return;
      }

      req.user = payload;
      next();
    } catch (error) {
      if (
        error instanceof ZodError ||
        error instanceof JsonWebTokenError ||
        error instanceof TokenExpiredError ||
        error instanceof NotBeforeError
      ) {
        req.user = undefined;
        next();
        return;
      }

      next(error);
    }
  })().catch(next);
}
