import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VehicleRentalService {
    private uploadDir = process.env.UPLOAD_DIR || './uploads';

    constructor(private prisma: PrismaService) {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    findAll(query?: { availabilityStatus?: string; vehicleType?: string; isFeatured?: boolean; page?: number; limit?: number; search?: string }) {
        const { availabilityStatus, vehicleType, isFeatured, page = 1, limit = 20, search } = query || {};
        const where: any = {};
        if (availabilityStatus) where.availabilityStatus = availabilityStatus;
        if (vehicleType) where.vehicleType = vehicleType;
        if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
        if (search) {
            where.OR = [
                { vehicleName: { contains: search, mode: 'insensitive' } },
                { vehicleType: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.vehicleRental.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findOne(id: string) {
        return this.prisma.vehicleRental.findUnique({ where: { id } });
    }

    async findBySlug(slug: string) {
        let result = await this.prisma.vehicleRental.findUnique({ where: { slug } });
        // Fallback: if slug looks like a CUID, try finding by ID
        if (!result && /^c[a-z0-9]{20,}$/i.test(slug)) {
            result = await this.prisma.vehicleRental.findUnique({ where: { id: slug } });
        }
        return result;
    }

    private generateSlug(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    async create(data: any) {
        if (!data.slug) {
            data.slug = this.generateSlug(data.vehicleName);
        }
        // Ensure slug uniqueness
        const existing = await this.prisma.vehicleRental.findUnique({ where: { slug: data.slug } });
        if (existing) {
            data.slug = `${data.slug}-${Date.now()}`;
        }
        return this.prisma.vehicleRental.create({ data: {
            vehicleName: data.vehicleName,
            slug: data.slug,
            vehicleType: data.vehicleType,
            pricePerDay: data.pricePerDay,
            capacity: data.capacity,
            transmission: data.transmission,
            fuelType: data.fuelType,
            description: data.description,
            about: data.about,
            faqs: data.faqs ? (typeof data.faqs === 'string' ? JSON.parse(data.faqs) : data.faqs) : undefined,
            features: data.features,
            images: data.images,
            availabilityStatus: data.availabilityStatus,
            isFeatured: data.isFeatured,
            seoTitle: data.seoTitle,
            seoKeywords: data.seoKeywords,
            seoDescription: data.seoDescription,
        } });
    }

    update(id: string, data: any) {
        const updateData: any = { ...data };
        if (updateData.faqs && typeof updateData.faqs === 'string') {
            try {
                updateData.faqs = JSON.parse(updateData.faqs);
            } catch (e) {}
        }
        return this.prisma.vehicleRental.update({ where: { id }, data: updateData });
    }

    remove(id: string) {
        return this.prisma.vehicleRental.delete({ where: { id } });
    }

    async uploadImage(id: string, file: Express.Multer.File) {
        const base64Data = file.buffer.toString('base64');
        const imageUrl = `data:${file.mimetype};base64,${base64Data}`;

        // Get current vehicle and append image
        const vehicle = await this.prisma.vehicleRental.findUnique({ where: { id } });
        const images = vehicle?.images || [];
        images.push(imageUrl);

        await this.prisma.vehicleRental.update({
            where: { id },
            data: { images },
        });

        return { url: imageUrl, filename: file.originalname };
    }

    async removeImage(id: string, imageUrl: string) {
        const vehicle = await this.prisma.vehicleRental.findUnique({ where: { id } });
        if (!vehicle) return;

        const images = (vehicle.images || []).filter(img => img !== imageUrl);
        await this.prisma.vehicleRental.update({ where: { id }, data: { images } });
    }
}
