import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HeroBannerService {
    constructor(private prisma: PrismaService) { }

    findAll(activeOnly = false) {
        return this.prisma.heroBanner.findMany({
            where: activeOnly ? { active: true } : {},
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    findOne(id: string) {
        return this.prisma.heroBanner.findUnique({ where: { id } });
    }

    create(data: any) {
        return this.prisma.heroBanner.create({ data });
    }

    update(id: string, data: any) {
        return this.prisma.heroBanner.update({ where: { id }, data });
    }

    remove(id: string) {
        return this.prisma.heroBanner.delete({ where: { id } });
    }

    toggleActive(id: string, active: boolean) {
        return this.prisma.heroBanner.update({ where: { id }, data: { active } });
    }
}
