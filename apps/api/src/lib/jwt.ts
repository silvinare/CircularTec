import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserContext } from '../types/auth';

const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['ADMIN_MUNICIPIO', 'OPERADOR_GENERADOR', 'OPERADOR_RECOLECTOR']),
  organizationId: z.string().uuid()
}).passthrough();

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || secret === 'changeme') {
    throw new Error('JWT_SECRET debe estar configurado con un valor seguro.');
  }

  return secret;
}

export function signUserToken(payload: UserContext): string {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: '8h'
  });
}

export function verifyUserToken(token: string): UserContext {
  const payload = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256']
  });

  return jwtPayloadSchema.parse(payload);
}
