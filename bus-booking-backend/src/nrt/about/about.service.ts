import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AboutService {
    constructor(private prisma: PrismaService) { }

    async get() {
        const about = await this.prisma.aboutUs.findFirst();
        return about || {};
    }

    async upsert(data: any) {
        const existing = await this.prisma.aboutUs.findFirst();
        if (existing) {
            return this.prisma.aboutUs.update({ where: { id: existing.id }, data });
        }
        return this.prisma.aboutUs.create({ data });
    }
}
