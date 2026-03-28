import { Router } from 'express';
import { prisma } from '@circulartec/db';
import { z } from 'zod';
import { requireRole } from '../lib/guard';

const router = Router();

const querySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

router.get('/summary', async (req, res, next) => {
  try {
    requireRole(req, ['ADMIN_MUNICIPIO']);

    const query = querySchema.parse(req.query);
    const from = query.from ? new Date(query.from) : new Date('2000-01-01T00:00:00.000Z');
    const to = query.to ? new Date(query.to) : new Date();

    const whereOperation = {
      createdAt: {
        gte: from,
        lte: to
      }
    };

    const [operationsCount, aggregate, operations] = await Promise.all([
      prisma.operation.count({ where: whereOperation }),
      prisma.operation.aggregate({
        where: whereOperation,
        _sum: {
          collectedQuantityKg: true
        }
      }),
      prisma.operation.findMany({
        where: whereOperation,
        select: {
          collectedQuantityKg: true,
          collectorOrgId: true,
          lot: {
            select: {
              generatorOrgId: true,
              wasteType: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    ]);

    const byWasteMap = new Map<string, number>();
    const generatorSet = new Set<string>();
    const collectorSet = new Set<string>();

    for (const operation of operations) {
      generatorSet.add(operation.lot.generatorOrgId);
      collectorSet.add(operation.collectorOrgId);

      const wasteType = operation.lot.wasteType.name;
      const current = byWasteMap.get(wasteType) || 0;
      byWasteMap.set(wasteType, current + operation.collectedQuantityKg);
    }

    const byWaste = Array.from(byWasteMap.entries())
      .map(([wasteType, quantityKg]) => ({
        wasteType,
        quantityKg: Number(quantityKg.toFixed(2))
      }))
      .sort((a, b) => b.quantityKg - a.quantityKg);

    res.json({
      operations: operationsCount,
      quantityKg: Number((aggregate._sum.collectedQuantityKg || 0).toFixed(2)),
      quantityTon: Number(((aggregate._sum.collectedQuantityKg || 0) / 1000).toFixed(2)),
      activeGenerators: generatorSet.size,
      activeCollectors: collectorSet.size,
      byWaste,
      range: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
