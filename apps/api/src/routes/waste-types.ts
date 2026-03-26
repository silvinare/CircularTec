import { Router } from 'express';
import { prisma } from '@circulartec/db';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const wasteTypes = await prisma.wasteType.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json(wasteTypes);
  } catch (error) {
    next(error);
  }
});

export default router;
