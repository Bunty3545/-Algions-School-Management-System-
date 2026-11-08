import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { action, entityType, limit = '50', page = '1' } = req.query as {
      action?: string;
      entityType?: string;
      limit?: string;
      page?: string;
    };

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
