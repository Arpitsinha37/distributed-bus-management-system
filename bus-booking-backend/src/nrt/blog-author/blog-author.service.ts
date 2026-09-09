// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BlogAuthorService {
    constructor(private prisma: PrismaService) { }

    findAll(search?: string) {
        const where: any = {};
        if (search) { where.name = { contains: search, mode: 'insensitive' }; }
        return this.prisma.blogAuthor.findMany({ where, orderBy: { name: 'asc' } });
    }

    findOne(id: string) { return this.prisma.blogAuthor.findUnique({ where: { id }, include: { blogs: true } }); }
    create(data: any) { return this.prisma.blogAuthor.create({ data }); }
    update(id: string, data: any) { return this.prisma.blogAuthor.update({ where: { id }, data }); }
    remove(id: string) { return this.prisma.blogAuthor.delete({ where: { id } }); }
}
