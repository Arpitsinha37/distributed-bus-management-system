import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StoryService } from './story.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Stories')
@Controller()
export class StoryController {
    constructor(private readonly service: StoryService) { }

    // ═══════════════ PUBLIC ═══════════════

    @Get('stories')
    findAllPublic() {
        return this.service.findAllPublic();
    }

    // ═══════════════ ADMIN ═══════════════

    @UseGuards(JwtAuthGuard)
    @Get('admin/stories')
    findAll() {
        return this.service.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin/stories')
    create(@Body() body: any) {
        return this.service.create(body);
    }

    @UseGuards(JwtAuthGuard)
    @Put('admin/stories/:id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.service.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('admin/stories/:id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
