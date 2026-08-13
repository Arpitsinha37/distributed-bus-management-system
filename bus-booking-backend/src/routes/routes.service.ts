import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRouteDto) {
    return this.prisma.route.create({ data: dto });
  }

  async findAll() {
    const data = await this.prisma.route.findMany({ orderBy: { createdAt: 'asc' } });
    return { data, total: data.length };
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async update(id: string, dto: Partial<CreateRouteDto>) {
    await this.findOne(id);
    return this.prisma.route.update({ where: { id }, data: dto });
  }

  // Powers the "which cities can I search?" dropdown on the storefronts.
  async findDistinctCities() {
    const routes = await this.prisma.route.findMany({
      select: { originCity: true, destinationCity: true },
    });
    const cities = new Set<string>();
    routes.forEach((r: { originCity: string; destinationCity: string }) => {
      cities.add(r.originCity);
      cities.add(r.destinationCity);
    });
    return Array.from(cities).sort();
  }
}

