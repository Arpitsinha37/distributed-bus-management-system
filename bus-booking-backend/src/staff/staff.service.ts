import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStaffDto) {
    const exists = await this.prisma.staff.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('A staff account with this email already exists');

    const { password, siteIds, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.staff.create({
      data: {
        ...rest,
        passwordHash,
        sites: siteIds?.length
          ? { create: siteIds.map((siteId) => ({ siteId })) }
          : undefined,
      },
      include: { sites: true },
    });
  }

  async findAll(page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { sites: { include: { site: { select: { id: true, name: true, slug: true } } } } },
        // Never return passwordHash to the client.
        // Prisma doesn't have a global field exclude yet, so we strip it below.
      }),
      this.prisma.staff.count(),
    ]);
    return {
      data: data.map(({ passwordHash: _, ...staff }) => staff),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: { sites: { include: { site: { select: { id: true, name: true, slug: true } } } } },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    const { passwordHash: _, ...safe } = staff;
    return safe;
  }

  async update(id: string, dto: UpdateStaffDto) {
    const existing = await this.prisma.staff.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Staff not found');

    const { password, siteIds, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    // If siteIds is explicitly provided, replace the entire set.
    if (siteIds !== undefined) {
      await this.prisma.staffSite.deleteMany({ where: { staffId: id } });
      if (siteIds.length > 0) {
        await this.prisma.staffSite.createMany({
          data: siteIds.map((siteId) => ({ staffId: id, siteId })),
        });
      }
    }

    const updated = await this.prisma.staff.update({
      where: { id },
      data,
      include: { sites: { include: { site: { select: { id: true, name: true, slug: true } } } } },
    });
    const { passwordHash: _, ...safe } = updated;
    return safe;
  }

  async remove(id: string) {
    // Soft-delete: deactivate rather than hard-delete so historical
    // bookings/audit trail referencing this staff member stay intact.
    const existing = await this.prisma.staff.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Staff not found');
    return this.prisma.staff.update({ where: { id }, data: { isActive: false } });
  }
}
