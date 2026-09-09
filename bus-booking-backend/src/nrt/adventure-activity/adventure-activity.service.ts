import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

@Injectable()
export class AdventureActivityService {
    constructor(private prisma: PrismaService) { }

    findAll(query?: { status?: string; search?: string }) {
        const { status, search } = query || {};
        const where: any = {};
        if (status) where.status = status;
        if (search) { where.name = { contains: search, mode: 'insensitive' }; }
        return this.prisma.adventureActivity.findMany({ where, orderBy: { displayOrder: 'asc' } });
    }

    findOne(id: string) { return this.prisma.adventureActivity.findUnique({ where: { id } }); }
    findBySlug(slug: string) { return this.prisma.adventureActivity.findUnique({ where: { slug } }); }

    create(data: any) { 
        if (!data.slug && data.name) {
            data.slug = slugify(data.name);
        }
        return this.prisma.adventureActivity.create({ data }); 
    }

    update(id: string, data: any) { 
        if (!data.slug && data.name) {
            data.slug = slugify(data.name);
        }
        return this.prisma.adventureActivity.update({ where: { id }, data }); 
    }
    remove(id: string) { return this.prisma.adventureActivity.delete({ where: { id } }); }
    toggleStatus(id: string, status: string) { return this.prisma.adventureActivity.update({ where: { id }, data: { status } }); }
}
