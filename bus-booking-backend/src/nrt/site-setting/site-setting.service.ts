import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SiteSettingService {
    constructor(private prisma: PrismaService) { }

    async get() {
        let s = await this.prisma.siteSettings.findFirst();
        if (!s) {
            s = await this.prisma.siteSettings.create({
                data: {
                    id: 'global',
                    businessName: 'New Road Travels'
                }
            });
        }
        return s;
    }

    async update(data: any) {
        const existing = await this.get();
        // Prevent changing the ID
        delete data.id;
        delete data.updatedAt;

        return this.prisma.siteSettings.update({
            where: { id: existing.id },
            data
        });
    }
}
