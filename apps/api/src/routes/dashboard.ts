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

    const lotCreatedWhere = {
      createdAt: {
        gte: from,
        lte: to
      }
    };

    const collectedOperationWhere = {
      collectedAt: {
        gte: from,
        lte: to
      }
    };

    const closedOperationWhere = {
      status: 'CLOSED' as const,
      closedAt: {
        gte: from,
        lte: to
      }
    };

    const verifiedCertificateWhere = {
      status: 'CLOSED' as const,
      closedAt: {
        gte: from,
        lte: to
      },
      certificate: {
        is: {
          status: 'VERIFIED' as const
        }
      }
    };

    const [publishedLots, collectedAggregate, collectedOperations, closedOperations, verifiedCertificates, backlog] =
      await Promise.all([
        prisma.lot.count({ where: lotCreatedWhere }),
        prisma.operation.aggregate({
          where: collectedOperationWhere,
          _sum: {
            collectedQuantityKg: true
          }
        }),
        prisma.operation.findMany({
          where: collectedOperationWhere,
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
        }),
        prisma.operation.count({
          where: closedOperationWhere
        }),
        prisma.operation.count({
          where: verifiedCertificateWhere
        }),
        prisma.$transaction([
          prisma.lot.count({
            where: {
              status: 'PUBLISHED'
            }
          }),
          prisma.lot.count({
            where: {
              status: {
                in: ['ASSIGNED', 'COLLECTED']
              }
            }
          }),
          prisma.operation.count({
            where: {
              status: 'PENDING_CONFIRMATION'
            }
          }),
          prisma.operation.count({
            where: {
              status: 'CONFIRMED'
            }
          }),
          prisma.operation.count({
            where: {
              status: 'CLOSED',
              OR: [
                {
                  certificate: {
                    is: null
                  }
                },
                {
                  certificate: {
                    is: {
                      status: {
                        not: 'VERIFIED'
                      }
                    }
                  }
                }
              ]
            }
          })
        ])
      ]);

    const byWasteMap = new Map<string, number>();
    const generatorSet = new Set<string>();
    const collectorSet = new Set<string>();

    for (const operation of collectedOperations) {
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

    const recoveredKg = Number((collectedAggregate._sum.collectedQuantityKg || 0).toFixed(2));
    const recoveredTon = Number((recoveredKg / 1000).toFixed(2));
    const certificationCoveragePct =
      closedOperations > 0 ? Number(((verifiedCertificates / closedOperations) * 100).toFixed(1)) : 0;

    res.json({
      period: {
        publishedLots,
        recoveredKg,
        recoveredTon,
        activeGenerators: generatorSet.size,
        activeCollectors: collectorSet.size,
        operationsClosed: closedOperations,
        verifiedCertificates,
        certificationCoveragePct,
        byWaste
      },
      backlog: {
        lotsPendingAssignment: backlog[0],
        lotsInProgress: backlog[1],
        operationsPendingConfirmation: backlog[2],
        operationsReadyToClose: backlog[3],
        closedWithoutCertificate: backlog[4]
      },
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
