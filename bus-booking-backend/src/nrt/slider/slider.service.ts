import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class SliderService {
    constructor(private prisma: PrismaService) { }
    findAll(siteId?: string, status?: string) {
        const where: any = {};
        if (siteId) where.siteId = siteId;
        
        return this.prisma.slider.findMany({ where, orderBy: { order: 'asc' } });
    }
    findOne(id: string) { return this.prisma.slider.findUnique({ where: { id } }); }
    create(data: any) { return this.prisma.slider.create({ data }); }
    update(id: string, data: any) { return this.prisma.slider.update({ where: { id }, data }); }
    toggleStatus(id: string, status: string) { return this.prisma.slider.update({ where: { id }, data: { isActive: status === 'active' } }); }
    remove(id: string) { return this.prisma.slider.delete({ where: { id } }); }
}


