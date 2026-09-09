import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FAQService {
    constructor(private prisma: PrismaService) { }

    findAll(query?: { status?: string; search?: string }) {
        const { status, search } = query || {};
        const where: any = {};
        if (status) where.isActive = status === 'active';
        if (search) { where.question = { contains: search, mode: 'insensitive' }; }
        return this.prisma.fAQ.findMany({ where, orderBy: { order: 'asc' } });
    }

    findOne(id: string) { return this.prisma.fAQ.findUnique({ where: { id } }); }
    create(data: any) { return this.prisma.fAQ.create({ data }); }
    update(id: string, data: any) { return this.prisma.fAQ.update({ where: { id }, data }); }
    remove(id: string) { return this.prisma.fAQ.delete({ where: { id } }); }
    toggleStatus(id: string, status: string) { return this.prisma.fAQ.update({ where: { id }, data: { isActive: status === 'active' } }); }
}

