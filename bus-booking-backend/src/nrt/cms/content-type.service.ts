// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentTypeService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId?: string) {
        return this.prisma.contentType.findMany({
            where: tenantId ? {} : {},
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const ct = await this.prisma.contentType.findUnique({ where: { id } });
        if (!ct) throw new NotFoundException('Content type not found');
        return ct;
    }

    async create(data: { name: string; slug: string; description?: string; fields: any[]; tenantId?: string }) {
        return this.prisma.contentType.create({ data });
    }

    async update(id: string, data: any) {
        await this.findById(id);
        return this.prisma.contentType.update({ where: { id }, data });
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.contentType.delete({ where: { id } });
    }

    // ── Content Entries (auto-generated CRUD) ──

    async createEntry(contentTypeId: string, tenantId: string | null, entryData: any, slug?: string) {
        return this.prisma.contentEntry.create({
            data: { contentTypeId, data: entryData, slug, status: 'draft' },
        });
    }

    async findEntries(contentTypeId: string, tenantId?: string, status?: string, page = 1, limit = 20) {
        const where: any = { contentTypeId };
        if (tenantId) where.tenantId = tenantId;
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.contentEntry.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.contentEntry.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async findEntry(id: string) {
        const entry = await this.prisma.contentEntry.findUnique({ where: { id }, include: { contentType: true, versions: { orderBy: { version: 'desc' }, take: 5 } } });
        if (!entry) throw new NotFoundException('Entry not found');
        return entry;
    }

    async updateEntry(id: string, entryData: any, status?: string) {
        const entry = await this.findEntry(id);

        // Save version history
        await this.prisma.contentVersion.create({
            data: { entryId: id, data: entry.data as any, version: entry.version },
        });

        return this.prisma.contentEntry.update({
            where: { id },
            data: {
                data: entryData,
                status: status || entry.status,
                version: { increment: 1 },
                publishedAt: status === 'published' ? new Date() : entry.publishedAt,
            },
        });
    }

    async deleteEntry(id: string) {
        await this.prisma.contentEntry.delete({ where: { id } });
    }
}
