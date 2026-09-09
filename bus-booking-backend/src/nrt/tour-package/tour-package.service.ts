import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TourPackageService {
    private uploadDir = process.env.UPLOAD_DIR || './uploads';

    constructor(private prisma: PrismaService) {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    findAll(query?: { status?: string; featured?: boolean; page?: number; limit?: number; search?: string }) {
        const { status, featured, page = 1, limit = 20, search } = query || {};
        const where: any = {};
        if (status) where.status = status;
        if (featured !== undefined) where.featured = featured;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.tourPackage.findMany({
            where,
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findOne(id: string) {
        return this.prisma.tourPackage.findUnique({ where: { id } });
    }

    async findBySlug(slug: string) {
        const trimmedSlug = slug.trim();
        let result = await this.prisma.tourPackage.findUnique({ where: { slug: trimmedSlug } });
        // Fallback: try case-insensitive search if exact match fails
        if (!result) {
            result = await this.prisma.tourPackage.findFirst({
                where: { slug: { equals: trimmedSlug, mode: 'insensitive' } },
            });
        }
        // Fallback: if slug looks like a CUID, try finding by ID
        if (!result && /^c[a-z0-9]{20,}$/i.test(trimmedSlug)) {
            result = await this.prisma.tourPackage.findUnique({ where: { id: trimmedSlug } });
        }
        return result;
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    async create(data: any) {
        if (!data.slug && data.title) {
            data.slug = this.generateSlug(data.title);
            const existing = await this.prisma.tourPackage.findUnique({ where: { slug: data.slug } });
            if (existing) {
                data.slug = `${data.slug}-${Date.now().toString(36)}`;
            }
        } else if (data.slug) {
            data.slug = data.slug.trim();
        }
        return this.prisma.tourPackage.create({ data });
    }

    update(id: string, data: any) {
        if (data.title && !data.slug) {
            data.slug = this.generateSlug(data.title);
        } else if (data.slug) {
            data.slug = data.slug.trim();
        }
        return this.prisma.tourPackage.update({ where: { id }, data });
    }

    remove(id: string) {
        return this.prisma.tourPackage.delete({ where: { id } });
    }

    async uploadCoverImage(id: string, file: Express.Multer.File) {
        const base64Data = file.buffer.toString('base64');
        const imageUrl = `data:${file.mimetype};base64,${base64Data}`;

        await this.prisma.tourPackage.update({ where: { id }, data: { image: imageUrl } });
        return { url: imageUrl, filename: file.originalname };
    }

    async uploadGalleryImage(id: string, file: Express.Multer.File) {
        const base64Data = file.buffer.toString('base64');
        const imageUrl = `data:${file.mimetype};base64,${base64Data}`;

        const pkg = await this.prisma.tourPackage.findUnique({ where: { id } });
        const galleryImages = pkg?.galleryImages || [];
        galleryImages.push(imageUrl);

        await this.prisma.tourPackage.update({ where: { id }, data: { galleryImages } });
        return { url: imageUrl, filename: file.originalname };
    }

    async removeGalleryImage(id: string, imageUrl: string) {
        const pkg = await this.prisma.tourPackage.findUnique({ where: { id } });
        if (!pkg) return;

        const galleryImages = (pkg.galleryImages || []).filter(img => img !== imageUrl);
        await this.prisma.tourPackage.update({ where: { id }, data: { galleryImages } });
    }
}

