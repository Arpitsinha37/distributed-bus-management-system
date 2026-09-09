import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusServiceService {
    constructor(private prisma: PrismaService) { }

    findAll(query?: { status?: string; page?: number; limit?: number; search?: string }) {
        const { status, page = 1, limit = 20, search } = query || {};
        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { source: { contains: search, mode: 'insensitive' } },
                { destination: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.busService.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findOne(id: string) {
        return this.prisma.busService.findUnique({ where: { id } });
    }

    async findBySlug(slug: string) {
        let result = await this.prisma.busService.findUnique({ where: { slug } });
        // Fallback: if slug looks like a CUID, try finding by ID
        if (!result && /^c[a-z0-9]{20,}$/i.test(slug)) {
            result = await this.prisma.busService.findUnique({ where: { id: slug } });
        }
        return result;
    }

    async create(data: any) {
        // Auto-generate slug if not provided
        if (!data.slug) {
            data.slug = this.generateSlug(data);
        }
        // Ensure slug uniqueness
        data.slug = await this.ensureUniqueSlug(data.slug);
        return this.prisma.busService.create({ data });
    }

    async update(id: string, data: any) {
        // Re-generate slug if source/destination/busType changed and slug not explicitly set
        if (!data.slug && (data.source || data.destination || data.busType)) {
            const existing = await this.prisma.busService.findUnique({ where: { id } });
            if (existing) {
                const merged = { ...existing, ...data };
                data.slug = this.generateSlug(merged);
                data.slug = await this.ensureUniqueSlug(data.slug, id);
            }
        }
        return this.prisma.busService.update({ where: { id }, data });
    }

    remove(id: string) {
        return this.prisma.busService.delete({ where: { id } });
    }

    toggleStatus(id: string, status: string) {
        return this.prisma.busService.update({ where: { id }, data: { status } });
    }

    /** Generate a URL-safe slug from source, destination, and busType */
    private generateSlug(data: { title?: string; source?: string; destination?: string; busType?: string }): string {
        if (data.title) {
            return this.slugify(data.title);
        }
        const parts = [data.source, 'to', data.destination, data.busType].filter(Boolean);
        return this.slugify(parts.join(' '));
    }

    private slugify(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/\s+/g, '-')     // Spaces to hyphens
            .replace(/-+/g, '-')      // Collapse multiple hyphens
            .replace(/^-|-$/g, '')    // Trim leading/trailing hyphens
            .substring(0, 100);       // Cap length
    }

    /** Ensure slug is unique by appending a counter if needed */
    private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
        let candidate = slug;
        let counter = 0;

        while (true) {
            const existing = await this.prisma.busService.findUnique({ where: { slug: candidate } });
            if (!existing || existing.id === excludeId) {
                return candidate;
            }
            counter++;
            candidate = `${slug}-${counter}`;
        }
    }
}
