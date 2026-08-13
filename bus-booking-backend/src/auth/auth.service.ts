import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { email },
      include: { sites: true },
    });
    if (!staff || !staff.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const siteIds = staff.sites.map((s: { siteId: string }) => s.siteId); // empty = SUPER_ADMIN, all sites
    const token = this.jwt.sign({ sub: staff.id, email: staff.email, role: staff.role, siteIds });

    return { accessToken: token, staff: { id: staff.id, name: staff.name, role: staff.role, siteIds } };
  }
}
