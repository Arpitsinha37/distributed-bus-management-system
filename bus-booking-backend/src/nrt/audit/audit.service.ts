import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(data: { action: string; resource: string; resourceId?: string; details?: any; userId?: string; tenantId?: string; ip?: string; userAgent?: string }) {
        return this.prisma.auditLog.create({ data });
    }

    async findAll(tenantId: string, page = 1, limit = 50) {
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: { tenantId },
                skip: (page - 1) * limit,
                take: limit,
                include: { user: { select: { email: true, firstName: true, lastName: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where: { tenantId } }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
}
