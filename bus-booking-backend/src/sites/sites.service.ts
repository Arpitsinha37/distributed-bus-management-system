import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSiteDto) {
    return this.prisma.site.create({ data: dto });
  }

  async findAll() {
    const data = await this.prisma.site.findMany({ orderBy: { createdAt: 'asc' } });
    return { data, total: data.length };
  }

  // Storefronts call this on boot/build to pull their own branding config.
  async findBySlug(slug: string) {
    const site = await this.prisma.site.findUnique({ where: { slug } });
    if (!site || !site.isActive) throw new NotFoundException('Unknown or inactive site');
    return site;
  }

  update(id: string, dto: Partial<CreateSiteDto>) {
    return this.prisma.site.update({ where: { id }, data: dto });
  }
}
