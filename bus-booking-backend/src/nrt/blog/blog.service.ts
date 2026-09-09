import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    findAll(query?: { isPublished?: boolean; isFeatured?: boolean; page?: number; limit?: number; search?: string; siteId?: string }) {
        const { isPublished, isFeatured, page = 1, limit = 50, search, siteId } = query || {};
        const where: any = {};
        if (siteId) where.siteId = siteId;
        if (typeof isPublished === 'boolean') where.isPublished = isPublished;
        if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.blog.findMany({
            where, orderBy: { displayOrder: 'asc' },
            skip: (page - 1) * limit, take: limit,
            include: { author: true },
        });
    }

    findOne(idOrSlug: string) {
        return this.prisma.blog.findFirst({
            where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
            include: { author: true },
        });
    }

    create(data: any) { return this.prisma.blog.create({ data }); }
    update(id: string, data: any) { return this.prisma.blog.update({ where: { id }, data }); }
    remove(id: string) { return this.prisma.blog.delete({ where: { id } }); }
    toggleStatus(id: string, status: string) { return this.prisma.blog.update({ where: { id }, data: { isPublished: status === 'active' } }); }
}
