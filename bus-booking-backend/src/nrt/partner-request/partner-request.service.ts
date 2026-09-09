import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class PartnerRequestService {
    constructor(private prisma: PrismaService) { }
    findAll(status?: string) {
        const where: any = {};
        if (status) where.status = status;
        return this.prisma.partnerRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    create(data: any) { return this.prisma.partnerRequest.create({ data }); }
    updateStatus(id: string, status: string) { return this.prisma.partnerRequest.update({ where: { id }, data: { status } }); }
}
