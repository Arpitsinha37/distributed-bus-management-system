import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class FeatureService {
    constructor(private prisma: PrismaService) { }
    findAll(query?: { status?: string; search?: string }) {
        const where: any = {};
        if (query?.status) where.status = query.status;
        if (query?.search) { where.name = { contains: query.search, mode: 'insensitive' }; }
        return this.prisma.feature.findMany({ where, orderBy: { displayOrder: 'asc' } });
    }
    findOne(id: string) { return this.prisma.feature.findUnique({ where: { id } }); }
    create(data: any) { return this.prisma.feature.create({ data }); }
    update(id: string, data: any) { return this.prisma.feature.update({ where: { id }, data }); }
    remove(id: string) { return this.prisma.feature.delete({ where: { id } }); }
    toggleStatus(id: string, status: string) { return this.prisma.feature.update({ where: { id }, data: { status } }); }
}
