import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamService {
    constructor(private prisma: PrismaService) { }
    findAll(query?: { siteId?: string; status?: string; category?: string; search?: string }) {
        const { siteId, status, category, search } = query || {};
        const where: any = {};
        if (siteId) where.siteId = siteId;
        if (status) where.isActive = status === 'active';
        
        if (category) where.category = category;
        if (search) { where.name = { contains: search, mode: 'insensitive' }; }
        return this.prisma.teamMember.findMany({ where, orderBy: { order: 'asc' } });
    }
    findOne(id: string) { return this.prisma.teamMember.findUnique({ where: { id } }); }
    create(data: any) { return this.prisma.teamMember.create({ data }); }
    update(id: string, data: any) { return this.prisma.teamMember.update({ where: { id }, data }); }
    toggleStatus(id: string, status: string) { return this.prisma.teamMember.update({ where: { id }, data: { isActive: status === 'active' } }); }
    remove(id: string) { return this.prisma.teamMember.delete({ where: { id } }); }
}


