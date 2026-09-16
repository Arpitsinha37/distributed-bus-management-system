import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { CrewRole } from '@prisma/client';

@Injectable()
export class CrewService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCrewDto) {
    return this.prisma.crewMember.create({ data: dto });
  }

  findAll(role?: CrewRole, isActive?: boolean) {
    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    
    return this.prisma.crewMember.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const crew = await this.prisma.crewMember.findUnique({
      where: { id },
      include: {
        tripAssignments: {
          include: {
            trip: {
              include: {
                schedule: {
                  include: { route: true },
                },
              },
            },
          },
        },
      },
    });
    if (!crew) throw new NotFoundException('Crew member not found');
    return crew;
  }

  update(id: string, dto: UpdateCrewDto) {
    return this.prisma.crewMember.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.crewMember.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Crew member not found');

    const assignmentCount = await this.prisma.tripCrew.count({ where: { crewMemberId: id } });
    if (assignmentCount > 0) {
      return this.prisma.crewMember.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.crewMember.delete({ where: { id } });
  }
}
