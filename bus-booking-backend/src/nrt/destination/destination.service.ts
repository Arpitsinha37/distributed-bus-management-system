import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DestinationService {
    private uploadDir = process.env.UPLOAD_DIR || './uploads';

    constructor(private prisma: PrismaService) {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /** Public: list active destinations sorted by displayOrder */
    async findAllPublic() {
        return this.prisma.destination.findMany({
            where: { status: 'active' },
            orderBy: { displayOrder: 'asc' },
        });
    }

    /** Public: single destination by slug */
    async findBySlug(slug: string) {
        let result = await this.prisma.destination.findUnique({ where: { slug } });
        // Fallback: if slug looks like a CUID, try finding by ID
        if (!result && /^c[a-z0-9]{20,}$/i.test(slug)) {
            result = await this.prisma.destination.findUnique({ where: { id: slug } });
        }
        return result;
    }

    /** Admin: list all destinations */
    async findAll() {
        return this.prisma.destination.findMany({
            orderBy: { displayOrder: 'asc' },
        });
    }

    /** Admin: create */
    async create(data: any) {
        return this.prisma.destination.create({ data });
    }

    /** Admin: update */
    async update(id: string, data: any) {
        return this.prisma.destination.update({ where: { id }, data });
    }

    /** Admin: delete */
    async remove(id: string) {
        return this.prisma.destination.delete({ where: { id } });
    }

    /** Upload image and set as destination image */
    async uploadImage(id: string, file: Express.Multer.File) {
        const base64Data = file.buffer.toString('base64');
        const imageUrl = `data:${file.mimetype};base64,${base64Data}`;

        await this.prisma.destination.update({
            where: { id },
            data: { image: imageUrl },
        });

        return { url: imageUrl, filename: file.originalname };
    }
}
