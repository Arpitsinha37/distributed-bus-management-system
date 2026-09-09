import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) { }

    async get() {
        const info = await this.prisma.contactInfo.findFirst();
        return info || {};
    }

    async upsert(data: any) {
        const existing = await this.prisma.contactInfo.findFirst();
        if (existing) {
            return this.prisma.contactInfo.update({ where: { id: existing.id }, data });
        }
        return this.prisma.contactInfo.create({ data });
    }
}
