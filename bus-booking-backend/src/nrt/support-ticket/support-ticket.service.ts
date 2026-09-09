import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportTicketService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 20, status?: string, type?: string) {
        const where: any = {};
        if (status) where.status = status;
        if (type) where.type = type;

        const [data, total] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.supportTicket.count({ where }),
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.prisma.supportTicket.count(),
            this.prisma.supportTicket.count({ where: { status: 'pending' } }),
            this.prisma.supportTicket.count({ where: { status: 'approved' } }),
            this.prisma.supportTicket.count({ where: { status: 'rejected' } }),
        ]);
        return { total, pending, approved, rejected };
    }

    async approve(id: string, adminNotes?: string) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                status: 'approved',
                adminNotes,
                resolvedAt: new Date(),
            },
        });
    }

    async reject(id: string, adminNotes?: string) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                status: 'rejected',
                adminNotes,
                resolvedAt: new Date(),
            },
        });
    }
}
