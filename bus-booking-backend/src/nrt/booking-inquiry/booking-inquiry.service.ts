import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class BookingInquiryService {
    constructor(private prisma: PrismaService) { }
    findAll(seen?: string) {
        const where: any = {};
        if (seen === 'true') where.seen = true;
        if (seen === 'false') where.seen = false;
        return this.prisma.bookingInquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    create(data: any) { return this.prisma.bookingInquiry.create({ data }); }
    toggleSeen(id: string, seen: boolean) { return this.prisma.bookingInquiry.update({ where: { id }, data: { seen } }); }
}
