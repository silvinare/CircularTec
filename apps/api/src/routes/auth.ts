import { Router } from 'express';
import { prisma } from '@circulartec/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { HttpError } from '../lib/errors';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      throw new HttpError(401, 'Credenciales invalidas.');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'Credenciales invalidas.');
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw new HttpError(403, 'Usuario sin organizacion activa.');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: membership.role,
      organizationId: membership.organizationId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '8h'
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: membership.role,
        organizationId: membership.organizationId,
        organization: membership.organization.displayName
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'No autenticado.');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      throw new HttpError(404, 'Usuario no encontrado.');
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: req.user.role,
      organizationId: req.user.organizationId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
