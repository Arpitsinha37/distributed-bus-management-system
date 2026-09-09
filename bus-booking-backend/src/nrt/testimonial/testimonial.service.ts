import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TestimonialService {
    constructor(private prisma: PrismaService) { }

    findAll(query?: { isActive?: boolean; page?: number; limit?: number }) {
        const { isActive, page = 1, limit = 20 } = query || {};
        const where: any = {};
        if (isActive !== undefined) where.isActive = isActive;
        return this.prisma.testimonial.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    findOne(id: string) {
        return this.prisma.testimonial.findUnique({ where: { id } });
    }

    create(data: any) {
        return this.prisma.testimonial.create({ data });
    }

    update(id: string, data: any) {
        return this.prisma.testimonial.update({ where: { id }, data });
    }

    remove(id: string) {
        return this.prisma.testimonial.delete({ where: { id } });
    }

    toggleApproval(id: string, isActive: boolean) {
        return this.prisma.testimonial.update({ where: { id }, data: { isActive } });
    }
}

