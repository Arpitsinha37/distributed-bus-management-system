import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AchievementService {
    constructor(private prisma: PrismaService) { }
    findAll(status?: string) {
        const where: any = {};
        if (status) where.status = status;
        return this.prisma.achievement.findMany({ where, orderBy: { displayOrder: 'asc' } });
    }
    findOne(id: string) { return this.prisma.achievement.findUnique({ where: { id } }); }
    create(data: any) { return this.prisma.achievement.create({ data: { ...data, totalCount: parseInt(data.totalCount) || 0 } }); }
    update(id: string, data: any) { return this.prisma.achievement.update({ where: { id }, data: { ...data, totalCount: parseInt(data.totalCount) || 0 } }); }
    remove(id: string) { return this.prisma.achievement.delete({ where: { id } }); }
    toggleStatus(id: string, status: string) { return this.prisma.achievement.update({ where: { id }, data: { status } }); }
}
