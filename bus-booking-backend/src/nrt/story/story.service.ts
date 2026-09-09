import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoryService {
    constructor(private prisma: PrismaService) { }

    /** Public: list active stories sorted by displayOrder */
    async findAllPublic() {
        return this.prisma.story.findMany({
            where: { status: 'active' },
            orderBy: { displayOrder: 'asc' },
        });
    }

    /** Admin: list all stories */
    async findAll() {
        return this.prisma.story.findMany({
            orderBy: { displayOrder: 'asc' },
        });
    }

    /** Admin: create */
    async create(data: any) {
        return this.prisma.story.create({ data });
    }

    /** Admin: update */
    async update(id: string, data: any) {
        return this.prisma.story.update({ where: { id }, data });
    }

    /** Admin: delete */
    async remove(id: string) {
        return this.prisma.story.delete({ where: { id } });
    }
}
