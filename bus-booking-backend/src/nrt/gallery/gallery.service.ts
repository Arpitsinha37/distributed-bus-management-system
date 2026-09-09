import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class GalleryService {
    constructor(private prisma: PrismaService) { }
    findAll(query?: { status?: string; category?: string }) {
        const where: any = {};
        if (query?.status) where.status = query.status;
        if (query?.category) where.category = query.category;
        return this.prisma.galleryImage.findMany({ where, orderBy: { order: 'asc' } });
    }
    findOne(id: string) { return this.prisma.galleryImage.findUnique({ where: { id } }); }
    create(data: any) { return this.prisma.galleryImage.create({ data }); }
    update(id: string, data: any) { return this.prisma.galleryImage.update({ where: { id }, data }); }
    remove(id: string) { return this.prisma.galleryImage.delete({ where: { id } }); }
    toggleStatus(id: string, status: string) { return this.prisma.galleryImage.findUnique({ where: { id }}); }
}



