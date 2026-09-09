import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PageService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId?: string, status?: string) {
        const where: any = {};
        if (tenantId) where.tenantId = tenantId;
        if (status) where.status = status;
        return this.prisma.cmsPage.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async findBySlug(slug: string, tenantId?: string) {
        const page = await this.prisma.cmsPage.findFirst({ where: { slug, ...(tenantId ? { tenantId } : {}) } });
        if (!page) throw new NotFoundException('Page not found');
        return page;
    }

    async findById(id: string) {
        const page = await this.prisma.cmsPage.findUnique({ where: { id } });
        if (!page) throw new NotFoundException('Page not found');
        return page;
    }

    async create(data: any) {
        return this.prisma.cmsPage.create({ data: { ...data, blocks: data.blocks || [] } });
    }

    async update(id: string, data: any) {
        await this.findById(id);
        if (data.status === 'published') data.publishedAt = new Date();
        return this.prisma.cmsPage.update({ where: { id }, data });
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.cmsPage.delete({ where: { id } });
    }
}

